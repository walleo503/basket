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

const crear = async (datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, id_equipo, numero_camiseta, es_capitan } = datosJugador;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Insertar jugador
        const insertJugadorQuery = `
            INSERT INTO jugadores (nombre, apellido, posicion, estatura, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, $5) RETURNING id_jugador;
        `;
        const { rows: jugadorRows } = await client.query(insertJugadorQuery, [
            nombre, apellido, posicion, estatura, fecha_nacimiento
        ]);
        
        const id_jugador = jugadorRows[0].id_jugador;

        // Insertar en plantilla
        const insertPlantillaQuery = `
            INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const { rows: plantillaRows } = await client.query(insertPlantillaQuery, [
            id_equipo, id_jugador, numero_camiseta, es_capitan || false
        ]);

        await client.query('COMMIT');
        
        return {
            ...jugadorRows[0],
            ...plantillaRows[0]
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
    
    const query = `
        UPDATE plantilla_equipo 
        SET numero_camiseta = COALESCE($1, numero_camiseta),
            es_capitan = COALESCE($2, es_capitan)
        WHERE id_jugador = $3 AND id_equipo = $4
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [numero_camiseta, es_capitan, id_jugador, id_equipo]);
    return rows[0];
};

const eliminar = async (id_jugador, id_equipo) => {
    const query = `
        UPDATE plantilla_equipo 
        SET activo = false
        WHERE id_jugador = $1 AND id_equipo = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_jugador, id_equipo]);
    return rows[0];
};

module.exports = {
    obtenerPorEquipo,
    crear,
    actualizar,
    actualizarPlantilla,
    eliminar
};