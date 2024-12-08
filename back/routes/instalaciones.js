const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleWare');

const {
    obtenerInstalaciones,
    obtenerInstalacionesEmpresa,
    obtenerInstalacionPorId,
    obtenerTiposInstalacion,
    obtenerSubtiposInstalacion,
    obtenerHorariosPorInstalacion,
    crearInstalacion,
    actualizarInstalacion,
    eliminarInstalacion
} = require('../controllers/InstalacionController');

router.get('/tipos', verificarToken, obtenerTiposInstalacion);
router.get('/tipos/:id/subtipos', verificarToken, obtenerSubtiposInstalacion);
router.get('/empresa', verificarToken, obtenerInstalacionesEmpresa);
router.get('/:id/horarios', verificarToken, obtenerHorariosPorInstalacion);
router.get('/:id', verificarToken, obtenerInstalacionPorId);
router.get('/', verificarToken, obtenerInstalaciones);
router.post('/', verificarToken, crearInstalacion);
router.put('/:id', verificarToken, actualizarInstalacion);
router.delete('/:id', verificarToken, eliminarInstalacion);

module.exports = router;