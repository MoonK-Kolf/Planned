const express = require('express'); 
const router = express.Router();
const { obtenerDatosAuxiliares } = require('../controllers/GeneralController');

router.get('/:tabla', obtenerDatosAuxiliares);

module.exports = router;