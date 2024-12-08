const pool = require('../config/db');

const obtenerUsuario = async (req, res) => {
    const userId = req.user.id;

    try {
        const resultadoUsuario = await pool.query(`
            SELECT U."Cod_Usu", U."Usuario", U."Perfil_Id", P."Perfil", U."Nombre", U."Apellidos", U."Email",
            U."FechaNacimiento", U."Telefono", U."Provincia_Id", U."Poblacion", U."Direccion", U."CPostal"
            FROM "Usuarios" U
            INNER JOIN "Perfiles" P ON P."Perfil_Id" = U."Perfil_Id"
            WHERE U."Cod_Usu" = $1
        `, [userId]);

        if (resultadoUsuario.rows.length > 0) {
            const usuario = resultadoUsuario.rows[0];

            if (usuario.Perfil_Id === 3) {
                const resultadoEmpresa = await pool.query(`
                    SELECT E."Cod_Emp", E."Empresa", E."CIF", E."DireccionSede", E."Fax", E."SitioWeb"
                    FROM "Empresas" E
                    WHERE E."Cod_Usu" = $1
                `, [userId]);

                if (resultadoEmpresa.rows.length > 0) {
                    usuario.Empresa = resultadoEmpresa.rows[0];
                } else {
                    usuario.Empresa = null;
                }
            }

            res.json(usuario);
        } else {
            res.json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error al obtener el usuario' });
    }
};

const actualizarUsuario = async (req, res) => {
    const userId = req.user.id;
    const { Nombre, Apellidos, Email, FechaNacimiento, Telefono, Provincia_Id, Poblacion, Direccion, CPostal, Empresa } = req.body;

    try {
        // Actualizar datos del usuario
        await pool.query(`
            UPDATE "Usuarios" SET 
                "Nombre" = $1, 
                "Apellidos" = $2,
                "Email" = $3,
                "FechaNacimiento" = $4,
                "Telefono" = $5,
                "Provincia_Id" = $6,
                "Poblacion" = $7,
                "Direccion" = $8,
                "CPostal" = $9
                WHERE "Cod_Usu" = $10
        `, [Nombre, Apellidos, Email, FechaNacimiento, Telefono, Provincia_Id, Poblacion, Direccion, CPostal, userId]);

        const resultadoUsuario = await pool.query(`SELECT "Perfil_Id" FROM "Usuarios" WHERE "Cod_Usu" = $1`, [userId]);

        if (resultadoUsuario.rows.length > 0 && resultadoUsuario.rows[0].Perfil_Id === 3) {
            const { Cod_Emp, Empresa: NombreEmpresa, CIF, DireccionSede, Fax, SitioWeb } = Empresa;

            await pool.query(`
                UPDATE "Empresas" SET
                    "Empresa" = $1,
                    "CIF" = $2,
                    "DireccionSede" = $3,
                    "Fax" = $4,
                    "SitioWeb" = $5
                WHERE "Cod_Emp" = $6 AND "Cod_Usu" = $7
            `, [NombreEmpresa, CIF, DireccionSede, Fax, SitioWeb, Cod_Emp, userId]);
        }

        res.json({ success: true, message: 'Modificación correcta!' });
    } catch (error) {
        console.error("ERROR ERROR ERROR -> ", error);
        res.json({ success: false, message: 'Error al actualizar el usuario' });
    }
}

module.exports = { obtenerUsuario, actualizarUsuario };