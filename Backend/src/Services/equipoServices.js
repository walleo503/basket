const pool = require('../Config/db');
const obtenerTodos = async () => {
    
    const query = `
        SELECT e.id_equipo, e.nombre_oficial, e.siglas, cl.descripcion AS clasificacion, 
            c.nombre_cancha, c.direccion AS direccion_cancha, e.id_entrenador, e.activo
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.activo = true
        ORDER BY e.nombre_oficial ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const obtenerPorEntrenador = async (id_entrenador) => {
    const query = `
        SELECT e.*, cl.descripcion AS clasificacion, 
            c.nombre_cancha, c.direccion AS direccion_cancha 
            FROM equipos e
            LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
            LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
            WHERE e.id_entrenador = $1 AND e.activo = true
            LIMIT 1;
    `;
    const { rows } = await pool.query(query, [id_entrenador]);
    return rows[0];
};

const crear = async (datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_entrenador, id_cancha, nueva_cancha } = datosEquipo;
    
    // Usamos el cliente para hacer una transacción (BEGIN / COMMIT / ROLLBACK)
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Inicia la transacción

        let canchaAsignadaId = id_cancha;

        // Si no viene un ID de cancha, pero sí vienen los datos de una nueva, la creamos primero
        if (!canchaAsignadaId && nueva_cancha) {
            const insertCanchaQuery = `
                INSERT INTO canchas (nombre_cancha, direccion, capacidad)
                VALUES ($1, $2, $3) RETURNING id_cancha;
            `;
            const { rows: canchaRows } = await client.query(insertCanchaQuery, [
                nueva_cancha.nombre, 
                nueva_cancha.direccion, 
                nueva_cancha.capacidad || null
            ]);
            canchaAsignadaId = canchaRows[0].id_cancha;
        }

        // Ahora creamos el equipo con el id_cancha (ya sea el existente o el recién creado)
        const insertEquipoQuery = `
            INSERT INTO equipos (nombre_oficial, siglas, id_clasificacion, id_cancha, id_entrenador)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;
        const { rows: equipoRows } = await client.query(insertEquipoQuery, [
            nombre_oficial, siglas, id_clasificacion, canchaAsignadaId, id_entrenador
        ]);

        await client.query('COMMIT'); // Todo salió bien, guardamos permanentemente
        return equipoRows[0];

    } catch (error) {
        await client.query('ROLLBACK'); // Algo falló, deshacemos todo
        throw error;
    } finally {
        client.release(); // Liberamos el cliente de vuelta al pool
    }
};

module.exports = {
    obtenerTodos,
    obtenerPorEntrenador,
    crear
};