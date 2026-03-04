const pool = require('../Config/db');

const PALABRAS_PROHIBIDAS = [
    'puta','mierda','cabron','pendejo','idiota','estupido',
    'imbecil','marica','perra','bastardo','culero','verga',
    'chingada','coño','joder','puto','hijo de puta'
];

const contienePalabraProhibida = (texto) => {
    const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return PALABRAS_PROHIBIDAS.some(p => t.includes(p));
};

const verificarNombreExistente = async (nombre_oficial, excluirId = null) => {
    let query = `SELECT id_equipo FROM equipos WHERE LOWER(nombre_oficial) = LOWER($1)`;
    const params = [nombre_oficial];
    if (excluirId) { query += ` AND id_equipo != $2`; params.push(excluirId); }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

const obtenerTodos = async () => {
    const { rows } = await pool.query(`
        SELECT e.id_equipo, e.nombre_oficial, e.siglas,
               cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha,
               e.id_entrenador, e.activo, e.id_clasificacion, e.id_nivel,
               n.descripcion AS nivel
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        LEFT JOIN nivel_competencia n ON e.id_nivel = n.id_nivel
        ORDER BY e.nombre_oficial ASC;
    `);
    return rows;
};

const obtenerPorId = async (id_equipo) => {
    const { rows } = await pool.query(`
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha, c.capacidad AS capacidad_cancha,
               u.nombre || ' ' || u.apellido AS entrenador_nombre,
               n.descripcion AS nivel
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        LEFT JOIN usuarios u ON e.id_entrenador = u.id_usuario
        LEFT JOIN nivel_competencia n ON e.id_nivel = n.id_nivel
        WHERE e.id_equipo = $1;
    `, [id_equipo]);
    return rows[0];
};

const obtenerPorEntrenador = async (id_entrenador) => {
    const { rows } = await pool.query(`
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha, c.capacidad AS capacidad_cancha
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.id_entrenador = $1 AND e.activo = true
        LIMIT 1;
    `, [id_entrenador]);
    return rows[0];
};

const obtenerEquiposPorEntrenador = async (id_entrenador) => {
    const { rows } = await pool.query(`
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha,
               n.descripcion AS nivel
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        LEFT JOIN nivel_competencia n ON e.id_nivel = n.id_nivel
        WHERE e.id_entrenador = $1
        ORDER BY e.activo DESC, e.nombre_oficial ASC;
    `, [id_entrenador]);
    return rows;
};

const crear = async (datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_entrenador, id_cancha, direccion_cancha, id_nivel } = datosEquipo;

    const existe = await verificarNombreExistente(nombre_oficial);
    if (existe) throw { status: 400, message: 'Ya existe un equipo con ese nombre' };
    if (contienePalabraProhibida(nombre_oficial))
        throw { status: 400, message: 'El nombre del equipo contiene palabras no permitidas' };

    const { rows } = await pool.query(`
        INSERT INTO equipos (nombre_oficial, siglas, id_clasificacion, id_cancha, id_entrenador, direccion_cancha, id_nivel)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `, [nombre_oficial, siglas, id_clasificacion, id_cancha || null, id_entrenador, direccion_cancha, id_nivel || null]);
    return rows[0];
};

const actualizar = async (id_equipo, datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_cancha, direccion_cancha, id_nivel,
            nombre_cancha, capacidad_cancha } = datosEquipo;

    if (nombre_oficial) {
        const existe = await verificarNombreExistente(nombre_oficial, id_equipo);
        if (existe) throw { status: 400, message: 'Ya existe un equipo con ese nombre' };
        if (contienePalabraProhibida(nombre_oficial))
            throw { status: 400, message: 'El nombre del equipo contiene palabras no permitidas' };
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let canchaFinalId = id_cancha;

        if (id_cancha && direccion_cancha) {
            const dup = await client.query(
                `SELECT id_cancha FROM canchas WHERE direccion = $1 AND id_cancha != $2`,
                [direccion_cancha, id_cancha]
            );
            if (dup.rows.length > 0)
                throw new Error('DIRECCION_REPETIDA: Ya existe otra sede con esa dirección.');
            await client.query(`
                UPDATE canchas SET nombre_cancha = COALESCE($1, nombre_cancha),
                    direccion = COALESCE($2, direccion), capacidad = COALESCE($3, capacidad)
                WHERE id_cancha = $4
            `, [nombre_cancha, direccion_cancha, capacidad_cancha || null, id_cancha]);
        } else if (!id_cancha && direccion_cancha) {
            const dup = await client.query(`SELECT id_cancha FROM canchas WHERE direccion = $1`, [direccion_cancha]);
            if (dup.rows.length > 0)
                throw new Error('DIRECCION_REPETIDA: Ya existe otra sede con esa dirección.');
            const { rows: nueva } = await client.query(`
                INSERT INTO canchas (nombre_cancha, direccion, capacidad)
                VALUES ($1, $2, $3) RETURNING id_cancha;
            `, [nombre_cancha, direccion_cancha, capacidad_cancha || null]);
            canchaFinalId = nueva[0].id_cancha;
        }

        const { rows } = await client.query(`
            UPDATE equipos
            SET nombre_oficial = COALESCE($1, nombre_oficial),
                siglas = COALESCE($2, siglas),
                id_clasificacion = COALESCE($3, id_clasificacion),
                id_cancha = COALESCE($4, id_cancha),
                direccion_cancha = COALESCE($5, direccion_cancha),
                id_nivel = COALESCE($6, id_nivel)
            WHERE id_equipo = $7 RETURNING *;
        `, [nombre_oficial, siglas, id_clasificacion, canchaFinalId, direccion_cancha, id_nivel, id_equipo]);

        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') throw new Error('El nombre o siglas del equipo ya están en uso.');
        throw error;
    } finally {
        client.release();
    }
};

const cambiarEstado = async (id_equipo, activo) => {
    const { rows } = await pool.query(`UPDATE equipos SET activo = $1 WHERE id_equipo = $2 RETURNING *;`, [activo, id_equipo]);
    return rows[0];
};

const obtenerEstadisticas = async (id_equipo) => {
    const { rows } = await pool.query(`
        SELECT
            COUNT(DISTINCT pe.id_jugador) as jugadores_activos,
            COUNT(DISTINCT p.id_partido) as partidos_jugados,
            COUNT(DISTINCT CASE
                WHEN p.marcador_local > p.marcador_visitante AND p.id_equipo_local = $1 THEN 1
                WHEN p.marcador_visitante > p.marcador_local AND p.id_equipo_visitante = $1 THEN 1
            END) as victorias
        FROM equipos e
        LEFT JOIN plantilla_equipo pe ON e.id_equipo = pe.id_equipo AND pe.activo = true
        LEFT JOIN partidos p ON (e.id_equipo = p.id_equipo_local OR e.id_equipo = p.id_equipo_visitante) AND p.estado = 'Finalizado'
        WHERE e.id_equipo = $1
        GROUP BY e.id_equipo;
    `, [id_equipo]);
    return rows[0] || { jugadores_activos: 0, partidos_jugados: 0, victorias: 0 };
};

const obtenerEquiposLibres = async () => {
    const { rows } = await pool.query(`
        SELECT e.id_equipo, e.nombre_oficial, e.siglas, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.id_entrenador IS NULL AND e.activo = true
        ORDER BY e.nombre_oficial ASC;
    `);
    return rows;
};

const abandonarEquipo = async (id_equipo) => {
    const { rows } = await pool.query(`UPDATE equipos SET id_entrenador = NULL WHERE id_equipo = $1 RETURNING *;`, [id_equipo]);
    return rows[0];
};

const unirseEquipo = async (id_equipo, id_entrenador) => {
    const { rows } = await pool.query(`UPDATE equipos SET id_entrenador = $1 WHERE id_equipo = $2 RETURNING *;`, [id_entrenador, id_equipo]);
    return rows[0];
};

module.exports = {
    obtenerTodos, obtenerPorId, obtenerPorEntrenador, obtenerEquiposPorEntrenador,
    crear, actualizar, cambiarEstado, obtenerEstadisticas,
    obtenerEquiposLibres, abandonarEquipo, unirseEquipo
};