const pool = require('../config/db');

// Obtenes todas las instalaciones
const obtenerInstalaciones = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT I."Instalacion_Id", I."Instalacion", I."TipoInstalacion_Id", IT."TipoInstalacion", I."Precio", I."Direccion",
            I."Telefono", I."SubtipoInstalacion_Id", IST."SubtipoInstalacion", I."Cod_Emp", I."Capacidad", I."Observaciones"
            FROM "Instalaciones" I
            INNER JOIN "InstalacionesTipos" IT ON I."TipoInstalacion_Id" = IT."TipoInstalacion_Id"
            INNER JOIN "InstalacionesSubtipos" IST ON I."SubtipoInstalacion_Id" = IST."SubtipoInstalacion_Id"
            ORDER BY I."Instalacion"
        `);

        return res.json({ success: true, data: resultado.rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al obtener las instalaciones' });
    }
};

// Obtener las instalaciones por empresa
const obtenerInstalacionesEmpresa = async (req, res) => {
    const userId = req.user.id;

    try {
        const resultadoEmpresa = await pool.query(`SELECT * FROM "Empresas" WHERE "Cod_Usu" = $1`, [userId]);

        if (resultadoEmpresa.rows.length === 0) { return res.json({ success: false, message: 'Este usuario no tiene empresas asociadas' }) }

        const codigosEmpresa = resultadoEmpresa.rows.map(empresa => empresa.Cod_Emp);

        const resultado = await pool.query(`
            SELECT I."Instalacion_Id", I."Instalacion", I."TipoInstalacion_Id", IT."TipoInstalacion", I."Precio", I."Direccion",
            I."Telefono", I."SubtipoInstalacion_Id", IST."SubtipoInstalacion", I."Cod_Emp", I."Capacidad", I."Observaciones"
            FROM "Instalaciones" I
            INNER JOIN "InstalacionesTipos" IT ON I."TipoInstalacion_Id" = IT."TipoInstalacion_Id"
            INNER JOIN "InstalacionesSubtipos" IST ON I."SubtipoInstalacion_Id" = IST."SubtipoInstalacion_Id"
            WHERE I."Cod_Emp" = ANY($1::int[])
            ORDER BY I."Instalacion"
        `, [codigosEmpresa]);

        return res.json({ success: true, data: resultado.rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al obtener las instalaciones del usuario' });
    }
};

// Detalle de una instalación
const obtenerInstalacionPorId = async (req, res) => {
    const id = req.params.id;

    try {
        const resultado = await pool.query(`
            SELECT I."Instalacion_Id", I."Instalacion", I."TipoInstalacion_Id", IT."TipoInstalacion", I."Precio", I."Direccion",
            I."Telefono", I."SubtipoInstalacion_Id", IST."SubtipoInstalacion", I."Cod_Emp", I."Capacidad", I."Observaciones"
            FROM "Instalaciones" I
            INNER JOIN "InstalacionesTipos" IT ON I."TipoInstalacion_Id" = IT."TipoInstalacion_Id"
            INNER JOIN "InstalacionesSubtipos" IST ON I."SubtipoInstalacion_Id" = IST."SubtipoInstalacion_Id"
            WHERE I."Instalacion_Id" = $1
      `, [id]);

        if (resultado.rows.length === 0) { return res.json({ success: false, message: 'Instalación no encontrada' }) }

        return res.json({ success: true, data: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al obtener la instalación' });
    }
};

// Tipos de instalaciones
const obtenerTiposInstalacion = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT "TipoInstalacion_Id", "TipoInstalacion" 
            FROM "InstalacionesTipos" 
            ORDER BY "TipoInstalacion"
        `);
        return res.json({ success: true, data: resultado.rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al obtener tipos de instalación' });
    }
};

// Subtipos de instalaciones
const obtenerSubtiposInstalacion = async (req, res) => {
    const tipoId = parseInt(req.params.id, 10);

    if (isNaN(tipoId)) { return res.json({ success: false, message: 'Tipo de instalación inválido' }) }

    try {
        const resultado = await pool.query(`
            SELECT "SubtipoInstalacion_Id", "SubtipoInstalacion"
            FROM "InstalacionesSubtipos"
            WHERE "TipoInstalacion_Id" = $1
            ORDER BY "SubtipoInstalacion"
        `, [tipoId]);
        return res.json({ success: true, data: resultado.rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al obtener subtipos de instalación' });
    }
};

// Horarios disponibles
const obtenerHorariosPorInstalacion = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query(`
            SELECT "Dia", "HoraInicio", "HoraFin"
            FROM "InstalacionesHorarios"
            WHERE "Instalacion_Id" = $1
            ORDER BY "Dia"
        `, [id]);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error al obtener los horarios' });
    }
};

// CREAR instalación
const crearInstalacion = async (req, res) => {
    const userId = req.user.id;
    const { Instalacion, TipoInstalacion_Id, SubtipoInstalacion_Id, Telefono, Cod_Emp, Capacidad, Precio, Direccion, Observaciones } = req.body.instalacion;
    const { horarios } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Obtener Cod_Emp correctamente
        const empresa = await pool.query('SELECT * FROM "Empresas" WHERE "Cod_Usu" = $1', [userId]);
        if (empresa.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.json({ success: false, message: 'Empresa no encontrada para el usuario proporcionado.' });
        }

        const codEmp = empresa.rows[0].Cod_Emp;

        // Insertar la instalación
        const resultadoInstalacion = await client.query(`
            INSERT INTO "Instalaciones" 
            ("Instalacion", "TipoInstalacion_Id", "SubtipoInstalacion_Id", "Cod_Emp", "Capacidad", "Observaciones", "Precio", "Direccion", "Telefono")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING "Instalacion_Id"
        `, [Instalacion, TipoInstalacion_Id, SubtipoInstalacion_Id, codEmp, Capacidad, Observaciones, Precio, Direccion, Telefono]);

        const instalacionId = resultadoInstalacion.rows[0].Instalacion_Id;

        // Insertar los horarios
        const insertHorarios = horarios.map(horario => {
            const horaInicio = horario.Cerrado ? '00:00:00' : horario.HoraInicio;
            const horaFin = horario.Cerrado ? '00:00:00' : horario.HoraFin;

            return client.query(`
                INSERT INTO "InstalacionesHorarios" 
                ("Instalacion_Id", "Dia", "HoraInicio", "HoraFin")
                VALUES ($1, $2, $3, $4)
            `, [instalacionId, horario.Dia, horaInicio, horaFin]);
        });

        await Promise.all(insertHorarios);

        await client.query('COMMIT');
        return res.json({ success: true, message: 'Instalación y horarios creados correctamente', Instalacion_Id: instalacionId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.json({ success: false, message: 'Error al crear la instalación' });
    } finally {
        client.release();
    }
};

// MODIFICAR instalación
const actualizarInstalacion = async (req, res) => {
    const id = req.params.id;
    const { Instalacion, Capacidad, Observaciones, Direccion, Precio, Telefono, horarios } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Actualizar la instalación
        await client.query(`
            UPDATE "Instalaciones"
            SET "Instalacion" = $1,
                "Capacidad" = $2,
                "Observaciones" = $3,
                "Direccion" = $4,
                "Precio" = $5,
                "Telefono" = $6
            WHERE "Instalacion_Id" = $7
        `, [Instalacion, Capacidad, Observaciones, Direccion, Precio, Telefono, id]);

        // Eliminar horarios existentes
        await client.query(`
            DELETE FROM "InstalacionesHorarios"
            WHERE "Instalacion_Id" = $1
        `, [id]);

        // Insertar los nuevos horarios
        const insertHorarios = horarios.map(horario => {
            const horaInicio = horario.Cerrado ? '00:00:00' : horario.HoraInicio;
            const horaFin = horario.Cerrado ? '00:00:00' : horario.HoraFin;

            return client.query(`
                INSERT INTO "InstalacionesHorarios" 
                ("Instalacion_Id", "Dia", "HoraInicio", "HoraFin")
                VALUES ($1, $2, $3, $4)
            `, [id, horario.Dia, horaInicio, horaFin]);
        });
        await Promise.all(insertHorarios);

        await client.query('COMMIT');

        return res.json({ success: true, message: 'Instalación actualizada correctamente' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al actualizar la instalación' });
    }
};

// ELIMINAR instalación
const eliminarInstalacion = async (req, res) => {
    const id = req.params.id;

    try {
        await pool.query(`DELETE FROM "Instalaciones" WHERE "Instalacion_Id" = $1`, [id]);
        return res.json({ success: true, message: 'Instalación eliminada correctamente' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al eliminar la instalación' });
    }
};

module.exports = {
    obtenerInstalaciones,
    obtenerInstalacionesEmpresa,
    obtenerInstalacionPorId,
    obtenerHorariosPorInstalacion,
    crearInstalacion,
    actualizarInstalacion,
    eliminarInstalacion,
    obtenerTiposInstalacion,
    obtenerSubtiposInstalacion
};