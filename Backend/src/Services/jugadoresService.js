const pool = require('../Config/db');

const obtenerPorEquipo = async (id_equipo) => {
    const query = `
        SELECT j.id_jugador, j.nombre, j.apellido, j.posicion, j.estatura, j.fecha_nacimiento,
            pe.numero_camiseta, pe.es_capitan, pe.activo
        FROM jugadores j
        JOIN plantilla_equipo pe ON j.id_jugador = pe.id_jugador
        WHERE pe.id_equipo = $1 AND pe.activo = true
        ORDER BY pe.numero_camiseta ASC;
    `;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows;
};

const obtenerLibres = async () => {
    const query = `
        SELECT j.* FROM jugadores j
        WHERE j.activo = true 
        AND NOT EXISTS (
            SELECT 1 FROM plantilla_equipo pe 
            WHERE pe.id_jugador = j.id_jugador AND pe.activo = true
        );
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const crear = async (datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, id_equipo, numero_camiseta, es_capitan } = datosJugador;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // REGLA 1: Límite de 15
        const limiteQuery = `SELECT COUNT(*) FROM plantilla_equipo WHERE id_equipo = $1 AND activo = true`;
        const { rows: conteoRows } = await client.query(limiteQuery, [id_equipo]);
        if (parseInt(conteoRows[0].count) >= 15) throw new Error('El equipo ya alcanzó el límite máximo de 15 jugadores.');

        // REGLA 2: Si el nuevo es capitán, le quitamos la banda al capitán anterior del equipo
        if (es_capitan) {
            await client.query(`
                UPDATE plantilla_equipo 
                SET es_capitan = false 
                WHERE id_equipo = $1 AND activo = true
            `, [id_equipo]);
        }

        // Insertar jugador
        const insertJugadorQuery = `
            INSERT INTO jugadores (nombre, apellido, posicion, estatura, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, $5) RETURNING id_jugador;
        `;
        const { rows: jugadorRows } = await client.query(insertJugadorQuery, [
            nombre, apellido, posicion, estatura || null, fecha_nacimiento || null
        ]);
        const id_jugador = jugadorRows[0].id_jugador;

        // Insertar en plantilla
        const insertPlantillaQuery = `
            INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo)
            VALUES ($1, $2, $3, $4, true) RETURNING *;
        `;
        const { rows: plantillaRows } = await client.query(insertPlantillaQuery, [
            id_equipo, id_jugador, numero_camiseta, es_capitan || false
        ]);

        await client.query('COMMIT');
        return { ...jugadorRows[0], ...plantillaRows[0] };

    } catch (error) {
        await client.query('ROLLBACK');
        // Traducimos el error de duplicado del nuevo índice parcial
        if (error.code === '23505') {
            throw new Error(`El número de camiseta ${numero_camiseta} ya está en uso en el equipo.`);
        }
        throw error;
    } finally {
        client.release();
    }
};

// Asignar un jugador ya existente (agente libre) a un equipo
const unirAEquipo = async (datosVinculacion) => {
    const { id_jugador, id_equipo, numero_camiseta, es_capitan } = datosVinculacion;
    
    // Mismas validaciones de baloncesto
    const limiteQuery = `SELECT COUNT(*) FROM plantilla_equipo WHERE id_equipo = $1 AND activo = true`;
    const { rows: conteoRows } = await pool.query(limiteQuery, [id_equipo]);
    if (parseInt(conteoRows[0].count) >= 15) throw new Error('REGLA_BALONCESTO: Límite de 15 jugadores alcanzado.');

    const camisetaQuery = `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND numero_camiseta = $2 AND activo = true`;
    const { rows: camisetaRows } = await pool.query(camisetaQuery, [id_equipo, numero_camiseta]);
    if (camisetaRows.length > 0) throw new Error(`REGLA_BALONCESTO: Camiseta ${numero_camiseta} en uso.`);

    const query = `
        INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (id_equipo, id_jugador) 
        DO UPDATE SET numero_camiseta = EXCLUDED.numero_camiseta, 
                      es_capitan = EXCLUDED.es_capitan, 
                      activo = true
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_equipo, id_jugador, numero_camiseta, es_capitan || false]);
    return rows[0];
};

const actualizar = async (id_jugador, datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento } = datosJugador;
    const query = `
        UPDATE jugadores 
        SET nombre = COALESCE($1, nombre),
            apellido = COALESCE($2, apellido),
            posicion = COALESCE($3, posicion),
            estatura = COALESCE($4, estatura),
            fecha_nacimiento = COALESCE($5, fecha_nacimiento)
        WHERE id_jugador = $6
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre, apellido, posicion, estatura, fecha_nacimiento, id_jugador]);
    return rows[0];
};

const actualizarPlantilla = async (id_jugador, id_equipo, datosPlantilla) => {
    const { numero_camiseta, es_capitan } = datosPlantilla;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Si lo están nombrando capitán, destituimos al anterior
        if (es_capitan) {
            await client.query(`
                UPDATE plantilla_equipo 
                SET es_capitan = false 
                WHERE id_equipo = $1 AND id_jugador != $2 AND activo = true
            `, [id_equipo, id_jugador]);
        }

        // Actualizamos al jugador actual
        const query = `
            UPDATE plantilla_equipo 
            SET numero_camiseta = COALESCE($1, numero_camiseta),
                es_capitan = COALESCE($2, es_capitan)
            WHERE id_jugador = $3 AND id_equipo = $4 AND activo = true
            RETURNING *;
        `;
        const { rows } = await client.query(query, [numero_camiseta, es_capitan, id_jugador, id_equipo]);
        
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            throw new Error(`El número de camiseta ${numero_camiseta} ya lo usa otro compañero.`);
        }
        throw error;
    } finally {
        client.release();
    }
};

const eliminar = async (id_jugador, id_equipo) => {
    const query = `
        UPDATE plantilla_equipo 
        SET activo = false, 
            fecha_salida = CURRENT_DATE,
            es_capitan = false 
        WHERE id_jugador = $1 AND id_equipo = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_jugador, id_equipo]);
    return rows[0];
};

module.exports = {
    obtenerPorEquipo,
    obtenerLibres,
    crear,
    unirAEquipo,
    actualizar,
    actualizarPlantilla,
    eliminar
};