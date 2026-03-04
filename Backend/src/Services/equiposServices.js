const pool = require('../Config/db');

const obtenerTodos = async () => {
    const query = `
        SELECT e.id_equipo, e.nombre_oficial, e.siglas, 
               cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha, 
               e.id_entrenador, e.activo, e.id_clasificacion,
               n.descripcion AS nivel
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        LEFT JOIN nivel_competencia n ON e.id_nivel = n.id_nivel
        ORDER BY e.nombre_oficial ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const obtenerPorId = async (id_equipo) => {
    const query = `
<<<<<<< HEAD
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha,
               n.descripcion AS nivel
=======
        SELECT e.*, cl.descripcion AS clasificacion, 
            c.nombre_cancha, c.direccion AS direccion_cancha, c.capacidad AS capacidad_cancha,
            u.nombre || ' ' || u.apellido AS entrenador_nombre
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        LEFT JOIN nivel_competencia n ON e.id_nivel = n.id_nivel
        WHERE e.id_equipo = $1;
    `;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows[0];
};

const obtenerPorEntrenador = async (id_entrenador) => {
    const query = `
<<<<<<< HEAD
        SELECT e.*, cl.descripcion AS clasificacion,
               c.nombre_cancha, c.direccion AS direccion_cancha
=======
        SELECT e.*, cl.descripcion AS clasificacion, 
            c.nombre_cancha, c.direccion AS direccion_cancha, c.capacidad AS capacidad_cancha
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.id_entrenador = $1 AND e.activo = true
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [id_entrenador]);
    return rows[0];
};

<<<<<<< HEAD
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

const verificarNombreExistente = async (nombre_oficial, excluirId = null) => {
    let query = `SELECT id_equipo FROM equipos WHERE LOWER(nombre_oficial) = LOWER($1)`;
    const params = [nombre_oficial];
    if (excluirId) {
        query += ` AND id_equipo != $2`;
        params.push(excluirId);
=======
const crear = async (datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_entrenador, id_cancha, nueva_cancha } = datosEquipo;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        let canchaAsignadaId = id_cancha;

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

        const insertEquipoQuery = `
            INSERT INTO equipos (nombre_oficial, siglas, id_clasificacion, id_cancha, id_entrenador)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;
        const { rows: equipoRows } = await client.query(insertEquipoQuery, [
            nombre_oficial, siglas, id_clasificacion, canchaAsignadaId, id_entrenador
        ]);

        await client.query('COMMIT');
        return equipoRows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
    }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

// Palabras no permitidas en nombres de equipos
const PALABRAS_PROHIBIDAS = [
    'puta', 'mierda', 'cabron', 'pendejo', 'idiota', 'estupido',
    'imbecil', 'marica', 'perra', 'bastardo', 'culero', 'verga',
    'chingada', 'coño', 'joder', 'puto', 'hijo de puta'
];

const contienePalabraProhibida = (texto) => {
    const textoNorm = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return PALABRAS_PROHIBIDAS.some(p => textoNorm.includes(p));
};

const crear = async (datosEquipo) => {
    const { nombre_oficial, siglas, id_clasificacion, id_entrenador, id_cancha, direccion_cancha, id_nivel } = datosEquipo;

    // Validar nombre duplicado
    const existe = await verificarNombreExistente(nombre_oficial);
    if (existe) throw { status: 400, message: 'Ya existe un equipo con ese nombre' };

    // Validar palabras prohibidas
    if (contienePalabraProhibida(nombre_oficial)) {
        throw { status: 400, message: 'El nombre del equipo contiene palabras no permitidas' };
    }

    const query = `
        INSERT INTO equipos (nombre_oficial, siglas, id_clasificacion, id_cancha, id_entrenador, direccion_cancha, id_nivel)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        nombre_oficial, siglas, id_clasificacion, id_cancha || null, id_entrenador, direccion_cancha, id_nivel || null
    ]);
    return rows[0];
};
const actualizar = async (id_equipo, datosEquipo) => {
<<<<<<< HEAD
    const { nombre_oficial, siglas, id_clasificacion, id_cancha, direccion_cancha, id_nivel } = datosEquipo;

    if (nombre_oficial) {
        const existe = await verificarNombreExistente(nombre_oficial, id_equipo);
        if (existe) throw { status: 400, message: 'Ya existe un equipo con ese nombre' };
        if (contienePalabraProhibida(nombre_oficial)) {
            throw { status: 400, message: 'El nombre del equipo contiene palabras no permitidas' };
        }
    }

    const query = `
        UPDATE equipos 
        SET nombre_oficial = COALESCE($1, nombre_oficial),
            siglas = COALESCE($2, siglas),
            id_clasificacion = COALESCE($3, id_clasificacion),
            id_cancha = COALESCE($4, id_cancha),
            direccion_cancha = COALESCE($5, direccion_cancha),
            id_nivel = COALESCE($6, id_nivel)
        WHERE id_equipo = $7
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre_oficial, siglas, id_clasificacion, id_cancha, direccion_cancha, id_nivel, id_equipo]);
    return rows[0];
=======
    const { 
        nombre_oficial, siglas, id_clasificacion, 
        id_cancha, nombre_cancha, direccion_cancha, capacidad_cancha 
    } = datosEquipo;
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        let canchaFinalId = id_cancha;

        // CASO A: Ya tenía una cancha, la actualizamos
        if (id_cancha && direccion_cancha) {
            const duplicateCheck = await client.query(
                `SELECT id_cancha FROM canchas WHERE direccion = $1 AND id_cancha != $2`,
                [direccion_cancha, id_cancha]
            );
            if (duplicateCheck.rows.length > 0) throw new Error('DIRECCION_REPETIDA: Ya existe otra sede deportiva registrada exactamente con esa misma dirección.');

            await client.query(`
                UPDATE canchas 
                SET nombre_cancha = COALESCE($1, nombre_cancha),
                    direccion = COALESCE($2, direccion),
                    capacidad = COALESCE($3, capacidad)
                WHERE id_cancha = $4
            `, [nombre_cancha, direccion_cancha, capacidad_cancha || null, id_cancha]);
        } 
        // CASO B: No tenía cancha, creamos una nueva y se la asignamos
        else if (!id_cancha && direccion_cancha) {
            const duplicateCheck = await client.query(`SELECT id_cancha FROM canchas WHERE direccion = $1`, [direccion_cancha]);
            if (duplicateCheck.rows.length > 0) throw new Error('DIRECCION_REPETIDA: Ya existe otra sede deportiva registrada exactamente con esa misma dirección.');

            const { rows: nuevaCancha } = await client.query(`
                INSERT INTO canchas (nombre_cancha, direccion, capacidad)
                VALUES ($1, $2, $3) RETURNING id_cancha;
            `, [nombre_cancha, direccion_cancha, capacidad_cancha || null]);
            
            canchaFinalId = nuevaCancha[0].id_cancha;
        }

        // 2. Actualizar la información del Equipo
        const queryEquipo = `
            UPDATE equipos 
            SET nombre_oficial = COALESCE($1, nombre_oficial),
                siglas = COALESCE($2, siglas),
                id_clasificacion = COALESCE($3, id_clasificacion),
                id_cancha = COALESCE($4, id_cancha)
            WHERE id_equipo = $5
            RETURNING *;
        `;
        const { rows } = await client.query(queryEquipo, [nombre_oficial, siglas, id_clasificacion, canchaFinalId, id_equipo]);

        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') throw new Error('El nombre oficial del equipo o sus siglas ya están siendo utilizados.');
        throw error;
    } finally {
        client.release();
    }
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
};

const cambiarEstado = async (id_equipo, activo) => {
    const query = `UPDATE equipos SET activo = $1 WHERE id_equipo = $2 RETURNING *;`;
    const { rows } = await pool.query(query, [activo, id_equipo]);
    return rows[0];
};

<<<<<<< HEAD
=======
const eliminar = async (id_equipo) => {
    const query = `UPDATE equipos SET activo = false WHERE id_equipo = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows[0];
};

>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
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

const obtenerEquiposLibres = async () => {
    const query = `
        SELECT e.id_equipo, e.nombre_oficial, e.siglas, cl.descripcion AS clasificacion, 
            c.nombre_cancha, c.direccion AS direccion_cancha
        FROM equipos e
        LEFT JOIN clasificacion_equipo cl ON e.id_clasificacion = cl.id_clasificacion
        LEFT JOIN canchas c ON e.id_cancha = c.id_cancha
        WHERE e.id_entrenador IS NULL AND e.activo = true
        ORDER BY e.nombre_oficial ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const abandonarEquipo = async (id_equipo) => {
    const query = `UPDATE equipos SET id_entrenador = NULL WHERE id_equipo = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows[0];
};

const unirseEquipo = async (id_equipo, id_entrenador) => {
    const query = `UPDATE equipos SET id_entrenador = $1 WHERE id_equipo = $2 RETURNING *;`;
    const { rows } = await pool.query(query, [id_entrenador, id_equipo]);
    return rows[0];
};
module.exports = {
<<<<<<< HEAD
    obtenerTodos, obtenerPorId, obtenerPorEntrenador,
    obtenerEquiposPorEntrenador, crear, actualizar,
    cambiarEstado, obtenerEstadisticas
=======
    obtenerTodos, obtenerPorId, obtenerPorEntrenador, crear, actualizar,
    cambiarEstado, eliminar, obtenerEstadisticas, obtenerEquiposLibres,
    abandonarEquipo, unirseEquipo
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
};