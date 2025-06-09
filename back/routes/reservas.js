const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { body, validationResult } = require('express-validator');
const { verificarToken } = require('../middlewares/authMiddleWare');

router.use(verificarToken);

// Endpoint para obtener horarios disponibles
router.get('/instalacion/:id/disponibles', async (req, res) => {
    const instalacionId = parseInt(req.params.id, 10);
    const fecha = req.query.fecha;

    if (!fecha) { return res.json({ success: false, message: 'Fecha no proporcionada' }) }

    try {
        const diaSemanaResult = await pool.query('SELECT EXTRACT(DOW FROM $1::date) AS dia_semana', [fecha]);
        let diaSemana = parseInt(diaSemanaResult.rows[0].dia_semana, 10);
        diaSemana = diaSemana === 0 ? 7 : diaSemana;

        const horariosDisponiblesResult = await pool.query(`
        SELECT
            gs.hora_inicio::time AS "HoraInicio",
            (gs.hora_inicio + interval '1 hour')::time AS "HoraFin"
        FROM "InstalacionesHorarios" ih
        CROSS JOIN LATERAL generate_series(
                $3::date + ih."HoraInicio"::time,
                $3::date + ih."HoraFin"::time - interval '1 hour',
                interval '1 hour'
            ) AS gs(hora_inicio)
        LEFT JOIN "Reservas" r ON r."Instalacion_Id" = ih."Instalacion_Id"
            AND r."FechaReserva" = $3::date
            AND r."HoraInicio" = gs.hora_inicio::time
            AND r."HoraFin" = (gs.hora_inicio + interval '1 hour')::time
        WHERE ih."Instalacion_Id" = $1
            AND ih."Dia" = $2
            AND r."Cod_Usu" IS NULL
        ORDER BY gs.hora_inicio;
        `, [instalacionId, diaSemana, fecha]);

        // Mapear los resultados para adaptarlos al frontend
        const horariosDisponibles = horariosDisponiblesResult.rows.map(row => ({
            HoraInicio: row.HoraInicio,
            HoraFin: row.HoraFin
        }));

        res.json({ success: true, horariosDisponibles });
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        res.json({ success: false, message: 'Error al obtener horarios disponibles' });
    }
});

// Endpoint para crear una nueva reserva
router.post('/',
    body('Instalacion_Id').isInt(),
    body('FechaReserva').isISO8601(),
    body('HoraInicio').matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
    body('HoraFin').matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) { return res.json({ success: false, message: 'Datos inválidos', errors: errors.array() }) }

        const { Instalacion_Id, FechaReserva, HoraInicio, HoraFin } = req.body;
        const Cod_Usu = req.user.id;

        try {
            const diaSemanaResult = await pool.query('SELECT EXTRACT(DOW FROM $1::date) AS dia_semana', [FechaReserva]);
            let diaSemana = parseInt(diaSemanaResult.rows[0].dia_semana);
            diaSemana = diaSemana === 0 ? 7 : diaSemana;

            // Verificar que el horario no está reservado ya
            const reservaExistente = await pool.query(`
                SELECT 1 FROM "Reservas"
                WHERE "Instalacion_Id" = $1 AND "FechaReserva" = $2 AND "HoraInicio" = $3 AND "HoraFin" = $4
            `, [Instalacion_Id, FechaReserva, HoraInicio, HoraFin]);

            if (reservaExistente.rows.length > 0) { return res.json({ success: false, message: 'El horario ya está reservado' }) }

            // Insertar la reserva
            const insertResult = await pool.query(`
                INSERT INTO "Reservas" ("Instalacion_Id", "Cod_Usu", "FechaReserva", "HoraInicio", "HoraFin")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [Instalacion_Id, Cod_Usu, FechaReserva, HoraInicio, HoraFin]);

            res.json({ success: true, message: 'Reserva creada exitosamente', reserva: insertResult.rows[0] });
        } catch (error) {
            console.error('Error al crear la reserva:', error);
            res.json({ success: false, message: 'Error al crear la reserva' });
        }
    }
);

// Endpoint para obtener reservas del usuario
router.get('/usuario', async (req, res) => {
    const userId = req.user.id;

    if (!userId) { return res.json({ success: false, message: 'Código de usuario inválido' }) }

    try {
        const reservasResult = await pool.query(`
        SELECT 
            r."Reserva_Id",
            r."Instalacion_Id",
            i."Instalacion",
            i."Direccion",
            i."Capacidad",
            i."Precio",
            r."FechaReserva",
            r."HoraInicio",
            r."HoraFin"
        FROM "Reservas" r
        JOIN "Instalaciones" i ON r."Instalacion_Id" = i."Instalacion_Id"
        WHERE r."Cod_Usu" = $1
        ORDER BY r."FechaReserva" DESC, r."HoraInicio" DESC;
        `, [userId]);

        res.json({ success: true, reservas: reservasResult.rows });
    } catch (error) {
        console.error('Error al obtener reservas del usuario:', error);
        res.json({ success: false, message: 'Error al obtener reservas del usuario' });
    }
});

router.delete('/:id', async (req, res) => {
    const reservaId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    console.log(reservaId);
    console.log(userId);

    if (isNaN(reservaId)) {
        return res.json({ success: false, message: 'ID de reserva inválido' });
    }

    try {
        const reserva = await pool.query(`
        SELECT * FROM "Reservas" 
        WHERE "Reserva_Id" = $1 AND "Cod_Usu" = $2
        `, [reservaId, userId]);

        if (reserva.rows.length === 0) {
            return res.json({ success: false, message: 'Reserva no encontrada o no autorizada' });
        }

        await pool.query(`DELETE FROM "Reservas" WHERE "Reserva_Id" = $1`, [reservaId]);
        res.json({ success: true, message: 'Reserva eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        res.json({ success: false, message: 'Error al eliminar la reserva' });
    }
});

module.exports = router;