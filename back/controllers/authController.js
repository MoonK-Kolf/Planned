const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

module.exports = { login, register };