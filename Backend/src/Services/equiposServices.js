const pool = require('../Config/db');

const obtenerTodos = async () => {
    const query = `
        SELECT e.id_equipo, e.nombre_oficial, e.siglas, 
               cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha, 
               e.id_entrenador, e.activo
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        ORDER BY e.nombre_oficial ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const obtenerPorId = async (id_equipo) => {
    const query = `
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.id_equipo = $1;
    `;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows[0];
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

const obtenerEquiposPorEntrenador = async (id_entrenador) => {
    const query = `
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.id_entrenador = $1
        ORDER BY e.activo DESC, e.nombre_oficial ASC;
    `;
    const { rows } = await pool.query(query, [id_entrenador]);
    return rows;
};

const crear = async (datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_entrenador, id_cancha, direccion_cancha } = datosEquipo;
    
    const query = `
        INSERT INTO equipos (nombre_oficial, siglas, id_clasificacion, id_cancha, id_entrenador, direccion_cancha)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        nombre_oficial, siglas, id_clasificacion, id_cancha, id_entrenador, direccion_cancha
    ]);
    return rows[0];
};

const actualizar = async (id_equipo, datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_cancha, direccion_cancha } = datosEquipo;
    
    const query = `
        UPDATE equipos 
        SET nombre_oficial = COALESCE($1, nombre_oficial),
            siglas = COALESCE($2, siglas),
            id_clasificacion = COALESCE($3, id_clasificacion),
            id_cancha = COALESCE($4, id_cancha),
            direccion_cancha = COALESCE($5, direccion_cancha)
        WHERE id_equipo = $6
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre_oficial, siglas, id_clasificacion, id_cancha, direccion_cancha, id_equipo]);
    return rows[0];
};

const cambiarEstado = async (id_equipo, activo) => {
    const query = `
        UPDATE equipos 
        SET activo = $1
        WHERE id_equipo = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [activo, id_equipo]);
    return rows[0];
};

const obtenerEstadisticas = async (id_equipo) => {
    const query = `
        SELECT 
            COUNT(DISTINCT pe.id_jugador) as jugadores_activos,
            COUNT(DISTINCT p.id_partido) as partidos_jugados,
            COUNT(DISTINCT CASE WHEN p.marcador_local > p.marcador_visitante 
                                 AND p.id_equipo_local = $1 THEN 1
                                WHEN p.marcador_visitante > p.marcador_local 
                                 AND p.id_equipo_visitante = $1 THEN 1 END) as victorias
        FROM equipos e
        LEFT JOIN plantilla_equipo pe ON e.id_equipo = pe.id_equipo AND pe.activo = true
        LEFT JOIN partidos p ON (e.id_equipo = p.id_equipo_local OR e.id_equipo = p.id_equipo_visitante)
            AND p.estado = 'Finalizado'
        WHERE e.id_equipo = $1
        GROUP BY e.id_equipo;
    `;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows[0] || { jugadores_activos: 0, partidos_jugados: 0, victorias: 0 };
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    obtenerPorEntrenador,
    obtenerEquiposPorEntrenador,
    crear,
    actualizar,
    cambiarEstado,
    obtenerEstadisticas
};