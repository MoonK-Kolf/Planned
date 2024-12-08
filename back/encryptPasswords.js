const pool = require('./config/db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function encryptPasswords() {
    try {
        // Selecciona todos los usuarios que tienen contraseñas no encriptadas (podemos usar un criterio)
        const result = await pool.query('SELECT * FROM "Usuarios"');
        const users = result.rows;

        for (const user of users) {
            // Verifica si la contraseña está encriptada (por ejemplo, revisando su longitud o patrón)
            if (user.Clave.length < 60) { // Los hashes bcrypt suelen ser de 60 caracteres
                const hashedPassword = bcrypt.hashSync(user.Clave, saltRounds);

                // Actualiza la contraseña en la base de datos
                await pool.query(
                    'UPDATE "Usuarios" SET "Clave" = $1 WHERE "Cod_Usu" = $2',
                    [hashedPassword, user.Cod_Usu]
                );
                console.log(`Contraseña encriptada para usuario: ${user.Usuario}`);
            }
        }

        console.log('Todas las contraseñas han sido encriptadas.');
        process.exit();
    } catch (error) {
        console.error('Error al encriptar las contraseñas:', error);
        process.exit(1);
    }
}

encryptPasswords();