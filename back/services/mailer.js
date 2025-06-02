const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: process.env.BREVO_SMTP_PORT || 587,
        secure: false, //true para 465, false para otros puertos
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY
        }
    });
}

const enviarCorreo = async (mailOptions) => {
    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from: `"${ process.env.EMAIL_SENDER_NAME }" <${ process.env.EMAIL_FROM }>`,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text
        });

        console.log("INFO ->", info);

        console.log('Correo enviado:', info.messageId);
        return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return {
            success: false,
            message: 'Error al enviar el correo de restablecimiento.',
            error: error.response || error.message
        };
    }
}

module.exports = { enviarCorreo };