const pool = require('../Config/db');

const crearTorneo = async (datosTorneo) => {
    const { nombre_torneo, descripcion, categoria, fecha_inicio, fecha_fin, numero_equipos, id_clasificacion, reglamento } = datosTorneo;
    if (numero_equipos > 12) throw new Error('El límite máximo de equipos permitidos por torneo es 12.');

    const query = `
        INSERT INTO torneos (nombre_torneo, descripcion, categoria, fecha_inicio, fecha_fin, numero_equipos, id_clasificacion, reglamento)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre_torneo, descripcion, categoria, fecha_inicio, fecha_fin, numero_equipos, id_clasificacion, reglamento]);
    return rows[0];
};

const editarTorneo = async (id_torneo, datosTorneo) => {
    const client = await pool.connect();
    try {
        const estadoQuery = await client.query(`SELECT estado FROM torneos WHERE id_torneo = $1`, [id_torneo]);
        if (estadoQuery.rows[0].estado !== 'En inscripción') throw new Error('Solo puedes editar un torneo antes de que inicie.');

        const { nombre_torneo, descripcion, categoria, fecha_inicio, fecha_fin, numero_equipos, reglamento } = datosTorneo;
        const query = `
            UPDATE torneos 
            SET nombre_torneo = COALESCE($1, nombre_torneo), descripcion = COALESCE($2, descripcion),
                categoria = COALESCE($3, categoria), fecha_inicio = COALESCE($4, fecha_inicio),
                fecha_fin = COALESCE($5, fecha_fin), numero_equipos = COALESCE($6, numero_equipos),
                reglamento = COALESCE($7, reglamento)
            WHERE id_torneo = $8 RETURNING *;
        `;
        const { rows } = await client.query(query, [nombre_torneo, descripcion, categoria, fecha_inicio, fecha_fin, numero_equipos, reglamento, id_torneo]);
        return rows[0];
    } finally {
        client.release();
    }
};

const iniciarTorneo = async (id_torneo) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const equiposInscritos = await client.query(`SELECT COUNT(*) FROM inscripciones WHERE id_torneo = $1`, [id_torneo]);
        const cantidad = parseInt(equiposInscritos.rows[0].count, 10);

        if (cantidad === 0) throw new Error('No puedes iniciar un torneo sin equipos.');
        if (cantidad % 2 !== 0) throw new Error('REGLA_TORNEO: El torneo debe tener una cantidad PAR de equipos para poder iniciar.');

        const { rows } = await client.query(`UPDATE torneos SET estado = 'En curso' WHERE id_torneo = $1 RETURNING *`, [id_torneo]);
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// NUEVA FUNCIÓN: Eliminar (Cancelar) Torneo
const eliminarTorneo = async (id_torneo) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Verificamos estado y si la fecha de inicio ya pasó (usando CURRENT_DATE de Postgres)
        const torneoQuery = await client.query(`
            SELECT estado, (CURRENT_DATE >= fecha_inicio) as ya_inicio 
            FROM torneos WHERE id_torneo = $1
        `, [id_torneo]);
        
        const torneo = torneoQuery.rows[0];
        
        if (!torneo) throw new Error('El torneo no existe.');
        if (torneo.estado !== 'En inscripción') throw new Error('REGLA_TORNEO: No puedes eliminar un torneo que ya inició o finalizó.');
        if (torneo.ya_inicio) throw new Error('REGLA_TORNEO: No puedes eliminar el torneo porque la fecha de inicio ya ha llegado.');
        
        const inscripcionesQuery = await client.query(`SELECT COUNT(*) FROM inscripciones WHERE id_torneo = $1`, [id_torneo]);
        if (parseInt(inscripcionesQuery.rows[0].count, 10) > 0) {
            throw new Error('REGLA_TORNEO: No puedes eliminar un torneo que ya tiene equipos inscritos.');
        }

        const { rows } = await client.query(`UPDATE torneos SET estado = 'Cancelado' WHERE id_torneo = $1 RETURNING *`, [id_torneo]);
        
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const obtenerTodosActivos = async () => {
    const query = `
        SELECT t.*, c.descripcion AS clasificacion_genero,
        (SELECT COUNT(*) FROM inscripciones i WHERE i.id_torneo = t.id_torneo) as equipos_inscritos
        FROM torneos t
        LEFT JOIN clasificacion_equipo c ON t.id_clasificacion = c.id_clasificacion
        WHERE t.estado NOT IN ('Finalizado', 'Cancelado') ORDER BY t.fecha_inicio ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// ACTUALIZADO: Ahora verifica el traslape de fechas
const obtenerEquiposElegibles = async (id_torneo) => {
    const torneoQuery = await pool.query(`SELECT id_clasificacion, fecha_inicio, fecha_fin FROM torneos WHERE id_torneo = $1`, [id_torneo]);
    const { id_clasificacion, fecha_inicio, fecha_fin } = torneoQuery.rows[0];

    const query = `
        SELECT e.id_equipo, e.nombre_oficial, e.siglas, c.nombre_cancha
        FROM equipos e
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.activo = true 
        AND e.id_entrenador IS NOT NULL 
        AND e.id_clasificacion = $1
        AND e.id_equipo NOT IN (
            SELECT i.id_equipo FROM inscripciones i
            JOIN torneos t ON i.id_torneo = t.id_torneo
            WHERE t.estado NOT IN ('Cancelado', 'Finalizado')
            AND i.estado_inscripcion = 'Aprobada'
            -- AQUÍ CORTAMOS EL TRASLAPE
            AND (t.fecha_inicio <= $3 AND t.fecha_fin >= $2)
        )
        ORDER BY e.nombre_oficial ASC;
    `;
    const { rows } = await pool.query(query, [id_clasificacion, fecha_inicio, fecha_fin]);
    return rows;
};

const inscribirEquipo = async (id_torneo, id_equipo) => {
    try {
        const query = `INSERT INTO inscripciones (id_torneo, id_equipo, estado_inscripcion) VALUES ($1, $2, 'Aprobada') RETURNING *;`;
        const { rows } = await pool.query(query, [id_torneo, id_equipo]);
        return rows[0];
    } catch (error) {
        if (error.message.includes('REGLA_TORNEO')) throw new Error(error.message);
        if (error.code === '23505') throw new Error('El equipo ya está inscrito en este torneo.');
        throw error;
    }
};

module.exports = { crearTorneo, editarTorneo, iniciarTorneo, eliminarTorneo, obtenerTodosActivos, obtenerEquiposElegibles, inscribirEquipo };