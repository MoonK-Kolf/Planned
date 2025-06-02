const express = require('express');
const router = express.Router();
const { login, register, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// router.get('/test-email', async (req, res) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: process.env.EMAIL_USER,
//         subject: 'Prueba de Email',
//         text: 'Este es un correo de prueba enviado desde Nodemailer utilizando OAuth2.'
//     };

//     const resultado = await enviarCorreo(mailOptions);
//     return res.json(resultado);
// });

module.exports = router;