const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

// Configurar OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Crear el transportador
const getTransporter = async () => {
    try {
        const accessTokenResponse = await oAuth2Client.getAccessToken();
        const accessToken = accessTokenResponse?.token;

        if (!accessToken) {
            throw new Error('Failed to obtain access token');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        return transporter;
    } catch (error) {
        console.error('Error creating transporter:', error);
        throw new Error('Failed to create transporter');
    }
};

// Función para enviar correos electrónicos
const enviarCorreo = async (mailOptions) => {
    try {
        const transporter = await getTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
        return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return { success: false, message: 'Error al enviar el correo de restablecimiento.' };
    }
};

const register = async (req, res) => {
    const { username, email, password, perfil, empresa } = req.body;

    try {
        const userCheck = await pool.query(`
            SELECT * FROM "Usuarios" 
            WHERE "Usuario" = $1 OR "Email" = $2
        `, [username, email]);

        if (userCheck.rows.length > 0) { return res.json({ success: false, message: 'El usuario o email ya existe' }) }

        const insertUsuario = await pool.query(`
            INSERT INTO "Usuarios"
            ("Usuario", "Email", "Clave", "Perfil_Id") 
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,[username, email, bcrypt.hashSync(password, 10), perfil === 'Empresa' ? 3 : 2 ]
        );

        const userId = insertUsuario.rows[0].Cod_Usu;

        if (perfil === 'Empresa') {
            await pool.query(`
                INSERT INTO "Empresas" ("Empresa", "Cod_Usu") 
                VALUES ($1, $2)
            `, [ empresa.nombre, userId ]);
        }

        return res.json({ success: true, message: 'Registro correcto' });
    } catch (error) {
        console.error(error);
        return res.json({ success : false, message: error.message || 'Error en el servidor'});
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(`
            SELECT * FROM "Usuarios" 
            WHERE "Usuario" = $1
        `, [username]);
        const user = result.rows[0];

        if (user) {
            const isPasswordValid = bcrypt.compareSync(password, user.Clave);

            if (isPasswordValid) {
                const token = jwt.sign(
                    { id: user.Cod_Usu, usuario: user.Usuario, perfil: user.Perfil_Id },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '3h' }
                );

                return res.json({ success: true, message: 'Inicio de sesión correcto!', token });
            } else {
                return res.json({ success: false, message: 'Contraseña incorrecta' });
            }

        } else {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error en el servidor' });
    }
};

// Función para manejar solicitudes de restablecimiento de contraseña
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'El campo "Email" es obligatorio.' });
    }

    try {
        // Verificar si el email existe
        const userResult = await pool.query(`
            SELECT "Cod_Usu", "Email", "Usuario" 
            FROM "Usuarios" 
            WHERE "Email" = $1
        `, [email]);

        if (userResult.rows.length === 0) {
            return res.json({ success: false, message: 'No se encontró un usuario con ese correo electrónico.' });
        }

        const user = userResult.rows[0];

        // Generar un token seguro
        const token = crypto.randomBytes(32).toString('hex');

        // Establecer una fecha de expiración (por ejemplo, 1 hora)
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora en milisegundos

        // Almacenar el token en la base de datos
        await pool.query(`
            INSERT INTO "PasswordResets" ("user_id", "token", "expires_at") 
            VALUES ($1, $2, $3)
        `, [user.Cod_Usu, token, expiresAt]);

        // Crear el enlace de restablecimiento
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        // Enviar el correo electrónico al usuario
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.Email,
            subject: 'Restablecimiento de Contraseña',
            html: `
                <p>Hola ${user.Usuario},</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, por favor ignora este correo.</p>
            `
        };

        const correoEnviado = await enviarCorreo(mailOptions);

        return res.json(correoEnviado);

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        return res.json({ success: false, message: 'Error en el servidor.' });
    }
};

// Función para manejar el restablecimiento de la contraseña
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    try {
        // Verificar si el token es válido y no ha expirado
        const tokenResult = await pool.query(`
            SELECT "user_id", "expires_at"
            FROM "PasswordResets"
            WHERE "token" = $1
        `, [token]);

        if (tokenResult.rows.length === 0) {
            return res.json({ success: false, message: 'Token inválido o ya utilizado.' });
        }

        const passwordReset = tokenResult.rows[0];

        if (new Date() > new Date(passwordReset.expires_at)) {
            // Token ha expirado
            await pool.query(`DELETE FROM "PasswordResets" WHERE "token" = $1`, [token]);
            return res.json({ success: false, message: 'El token ha expirado.' });
        }

        // Hash de la nueva contraseña
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Actualizar la contraseña del usuario
        await pool.query(`
            UPDATE "Usuarios" 
            SET "Clave" = $1 
            WHERE "Cod_Usu" = $2
        `, [hashedPassword, passwordReset.user_id]);

        // Eliminar el token para evitar reutilización
        await pool.query(`DELETE FROM "PasswordResets" WHERE "token" = $1`, [token]);

        return res.json({ success: true, message: 'Contraseña restablecida exitosamente.' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        return res.json({ success: false, message: 'Error en el servidor.' });
    }
};

module.exports = { login, register, forgotPassword, resetPassword };