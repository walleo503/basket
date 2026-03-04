const pool = require('../Config/db');

// Posiciones oficiales del baloncesto
const POSICIONES_VALIDAS = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];

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

const verificarNumeroCamiseta = async (id_equipo, numero_camiseta, excluir_jugador = null) => {
    let query = `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND numero_camiseta = $2 AND activo = true`;
    const params = [id_equipo, numero_camiseta];
    if (excluir_jugador) {
        query += ` AND id_jugador != $3`;
        params.push(excluir_jugador);
    }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

const validarEdadSegunNivel = (fecha_nacimiento, id_nivel) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;

    // id_nivel: 1 = Amateur (5-16 años), 2 = Profesional (19+ años)
    if (id_nivel == 1) {
        if (edad < 5 || edad > 16) {
            throw { status: 400, message: `Para categoría Amateur el jugador debe tener entre 5 y 16 años (edad actual: ${edad})` };
        }
    } else if (id_nivel == 2) {
        if (edad < 19) {
            throw { status: 400, message: `Para categoría Profesional el jugador debe tener al menos 19 años (edad actual: ${edad})` };
        }
    }
};

const obtenerNivelEquipo = async (id_equipo) => {
    const query = `SELECT id_nivel FROM equipos WHERE id_equipo = $1`;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows[0]?.id_nivel;
};

const crear = async (datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, id_equipo, numero_camiseta, es_capitan } = datosJugador;

    // Validar campos requeridos
    if (!nombre || !apellido || !posicion || !numero_camiseta || !fecha_nacimiento) {
        throw { status: 400, message: 'Todos los campos obligatorios deben completarse' };
    }

    // Validar posición oficial
    if (!POSICIONES_VALIDAS.includes(posicion)) {
        throw { status: 400, message: `Posición inválida. Válidas: ${POSICIONES_VALIDAS.join(', ')}` };
    }

    // Validar número de camiseta duplicado
    const numeroDuplicado = await verificarNumeroCamiseta(id_equipo, numero_camiseta);
    if (numeroDuplicado) {
        throw { status: 400, message: `El número ${numero_camiseta} ya está en uso en este equipo` };
    }

    // Validar edad según nivel del equipo
    if (fecha_nacimiento) {
        const id_nivel = await obtenerNivelEquipo(id_equipo);
        if (id_nivel) validarEdadSegunNivel(fecha_nacimiento, id_nivel);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertJugadorQuery = `
            INSERT INTO jugadores (nombre, apellido, posicion, estatura, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, $5) RETURNING id_jugador;
        `;
        const { rows: jugadorRows } = await client.query(insertJugadorQuery, [
            nombre, apellido, posicion, estatura || null, fecha_nacimiento
        ]);
        const id_jugador = jugadorRows[0].id_jugador;

        const insertPlantillaQuery = `
            INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const { rows: plantillaRows } = await client.query(insertPlantillaQuery, [
            id_equipo, id_jugador, numero_camiseta, es_capitan || false
        ]);

        await client.query('COMMIT');
        return { ...jugadorRows[0], ...plantillaRows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const actualizar = async (id_jugador, datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, numero_camiseta, es_capitan, id_equipo } = datosJugador;

    if (posicion && !POSICIONES_VALIDAS.includes(posicion)) {
        throw { status: 400, message: `Posición inválida. Válidas: ${POSICIONES_VALIDAS.join(', ')}` };
    }

    // Validar número duplicado si se cambia
    if (numero_camiseta && id_equipo) {
        const numeroDuplicado = await verificarNumeroCamiseta(id_equipo, numero_camiseta, id_jugador);
        if (numeroDuplicado) {
            throw { status: 400, message: `El número ${numero_camiseta} ya está en uso en este equipo` };
        }
    }

    // Validar edad si se cambia fecha
    if (fecha_nacimiento && id_equipo) {
        const id_nivel = await obtenerNivelEquipo(id_equipo);
        if (id_nivel) validarEdadSegunNivel(fecha_nacimiento, id_nivel);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateJugadorQuery = `
            UPDATE jugadores 
            SET nombre = COALESCE($1, nombre),
                apellido = COALESCE($2, apellido),
                posicion = COALESCE($3, posicion),
                estatura = COALESCE($4, estatura),
                fecha_nacimiento = COALESCE($5, fecha_nacimiento)
            WHERE id_jugador = $6 RETURNING *;
        `;
        const { rows: jugadorRows } = await client.query(updateJugadorQuery, [
            nombre, apellido, posicion, estatura, fecha_nacimiento, id_jugador
        ]);

        if (numero_camiseta !== undefined || es_capitan !== undefined) {
            const updatePlantillaQuery = `
                UPDATE plantilla_equipo 
                SET numero_camiseta = COALESCE($1, numero_camiseta),
                    es_capitan = COALESCE($2, es_capitan)
                WHERE id_jugador = $3 AND id_equipo = $4 RETURNING *;
            `;
            await client.query(updatePlantillaQuery, [numero_camiseta, es_capitan, id_jugador, id_equipo]);
        }

        await client.query('COMMIT');
        return jugadorRows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Deshabilitar jugador (en lugar de eliminar)
const deshabilitar = async (id_jugador, id_equipo) => {
    const query = `
        UPDATE plantilla_equipo 
        SET activo = false
        WHERE id_jugador = $1 AND id_equipo = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_jugador, id_equipo]);
    return rows[0];
};

// Mantener eliminar como alias de deshabilitar por compatibilidad
const eliminar = deshabilitar;

module.exports = {
    obtenerPorEquipo, crear, actualizar,
    deshabilitar, eliminar
};