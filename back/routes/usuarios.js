const express = require('express'); 
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleWare');
const { obtenerUsuario, actualizarUsuario } = require('../controllers/usuariosController');

router.get('/perfil', verificarToken, obtenerUsuario);
router.put('/perfil', verificarToken, actualizarUsuario);

module.exports = router;