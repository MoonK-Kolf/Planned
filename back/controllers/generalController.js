const pool = require('../config/db');
const tablasPermitidas = ['Aux_Provincias'];

const obtenerDatosAuxiliares = async (req, res) => {
    const { tabla } = req.params;

    if (!tablasPermitidas.includes(tabla)) {
        return res.status(400).json({error: 'Tabla no permitida'})
    }

    try {
        const resultado = await pool.query(`SELECT * FROM "${tabla}"`);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error al obtener los datos de ${tabla}` });
    }
};

module.exports = { obtenerDatosAuxiliares };