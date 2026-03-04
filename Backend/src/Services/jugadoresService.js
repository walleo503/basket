const pool = require('../Config/db');

const POSICIONES_VALIDAS = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];

const obtenerPorEquipo = async (id_equipo) => {
    const { rows } = await pool.query(`
        SELECT j.id_jugador, j.nombre, j.apellido, j.posicion, j.estatura, j.fecha_nacimiento,
               pe.numero_camiseta, pe.es_capitan, pe.activo,
               COALESCE(pe.rol_equipo, 'Suplente') AS rol_equipo
        FROM jugadores j
        JOIN plantilla_equipo pe ON j.id_jugador = pe.id_jugador
        WHERE pe.id_equipo = $1 AND pe.activo = true
        ORDER BY pe.numero_camiseta ASC;
    `, [id_equipo]);
    return rows;
};

const obtenerLibres = async () => {
    const { rows } = await pool.query(`
        SELECT j.* FROM jugadores j
        WHERE NOT EXISTS (
            SELECT 1 FROM plantilla_equipo pe
            WHERE pe.id_jugador = j.id_jugador AND pe.activo = true
        );
    `);
    return rows;
};

const verificarNumeroCamiseta = async (id_equipo, numero_camiseta, excluir_jugador = null) => {
    let query = `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND numero_camiseta = $2 AND activo = true`;
    const params = [id_equipo, numero_camiseta];
    if (excluir_jugador) { query += ` AND id_jugador != $3`; params.push(excluir_jugador); }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

const validarEdadSegunNivel = (fecha_nacimiento, id_nivel) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (id_nivel == 1 && (edad < 5 || edad > 16))
        throw { status: 400, message: `Amateur: jugador debe tener entre 5 y 16 años (edad actual: ${edad})` };
    if (id_nivel == 2 && edad < 19)
        throw { status: 400, message: `Profesional: jugador debe tener al menos 19 años (edad actual: ${edad})` };
};

const obtenerNivelEquipo = async (id_equipo) => {
    const { rows } = await pool.query(`SELECT id_nivel FROM equipos WHERE id_equipo = $1`, [id_equipo]);
    return rows[0]?.id_nivel;
};

const crear = async (datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, id_equipo, numero_camiseta, es_capitan, rol_equipo } = datosJugador;

    if (!nombre || !apellido || !posicion || !numero_camiseta || !fecha_nacimiento)
        throw { status: 400, message: 'Todos los campos obligatorios deben completarse' };
    if (!POSICIONES_VALIDAS.includes(posicion))
        throw { status: 400, message: `Posición inválida. Válidas: ${POSICIONES_VALIDAS.join(', ')}` };

    const numeroDuplicado = await verificarNumeroCamiseta(id_equipo, numero_camiseta);
    if (numeroDuplicado) throw { status: 400, message: `El número ${numero_camiseta} ya está en uso en este equipo` };

    const id_nivel = await obtenerNivelEquipo(id_equipo);
    if (id_nivel) validarEdadSegunNivel(fecha_nacimiento, id_nivel);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows: conteo } = await client.query(
            `SELECT COUNT(*) FROM plantilla_equipo WHERE id_equipo = $1 AND activo = true`, [id_equipo]
        );
        if (parseInt(conteo[0].count) >= 15)
            throw { status: 400, message: 'El equipo ya alcanzó el límite máximo de 15 jugadores.' };

        if (es_capitan) {
            const { rows: cap } = await client.query(
                `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND es_capitan = true AND activo = true`, [id_equipo]
            );
            if (cap.length > 0)
                throw { status: 400, message: 'El equipo ya tiene un capitán.' };
        }

        const { rows: jRows } = await client.query(
            `INSERT INTO jugadores (nombre, apellido, posicion, estatura, fecha_nacimiento)
             VALUES ($1, $2, $3, $4, $5) RETURNING id_jugador;`,
            [nombre, apellido, posicion, estatura || null, fecha_nacimiento]
        );
        const id_jugador = jRows[0].id_jugador;

        // Intentar con rol_equipo, si falla la columna no existe aún
        let pRows;
        try {
            const res = await client.query(
                `INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo, rol_equipo)
                 VALUES ($1, $2, $3, $4, true, $5) RETURNING *;`,
                [id_equipo, id_jugador, numero_camiseta, es_capitan || false, rol_equipo || 'Suplente']
            );
            pRows = res.rows;
        } catch (colError) {
            // Si la columna rol_equipo no existe, insertar sin ella
            const res = await client.query(
                `INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo)
                 VALUES ($1, $2, $3, $4, true) RETURNING *;`,
                [id_equipo, id_jugador, numero_camiseta, es_capitan || false]
            );
            pRows = res.rows;
        }

        await client.query('COMMIT');
        return { ...jRows[0], ...pRows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') throw { status: 400, message: `El número ${numero_camiseta} ya está en uso.` };
        throw error;
    } finally {
        client.release();
    }
};

const unirAEquipo = async (datosVinculacion) => {
    const { id_jugador, id_equipo, numero_camiseta, es_capitan, rol_equipo } = datosVinculacion;

    const { rows: conteo } = await pool.query(`SELECT COUNT(*) FROM plantilla_equipo WHERE id_equipo = $1 AND activo = true`, [id_equipo]);
    if (parseInt(conteo[0].count) >= 15) throw { status: 400, message: 'Límite de 15 jugadores alcanzado.' };

    const dup = await verificarNumeroCamiseta(id_equipo, numero_camiseta);
    if (dup) throw { status: 400, message: `Camiseta ${numero_camiseta} en uso.` };

    if (es_capitan) {
        const { rows: cap } = await pool.query(
            `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND es_capitan = true AND activo = true`, [id_equipo]
        );
        if (cap.length > 0) throw { status: 400, message: 'El equipo ya tiene un capitán.' };
    }

    const { rows } = await pool.query(`
        INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (id_equipo, id_jugador)
        DO UPDATE SET numero_camiseta = EXCLUDED.numero_camiseta,
                      es_capitan = EXCLUDED.es_capitan, activo = true
        RETURNING *;
    `, [id_equipo, id_jugador, numero_camiseta, es_capitan || false]);
    return rows[0];
};

const actualizar = async (id_jugador, datosJugador) => {
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, numero_camiseta, es_capitan, id_equipo, rol_equipo } = datosJugador;

    if (posicion && !POSICIONES_VALIDAS.includes(posicion))
        throw { status: 400, message: `Posición inválida. Válidas: ${POSICIONES_VALIDAS.join(', ')}` };
    if (numero_camiseta && id_equipo) {
        const dup = await verificarNumeroCamiseta(id_equipo, numero_camiseta, id_jugador);
        if (dup) throw { status: 400, message: `El número ${numero_camiseta} ya está en uso` };
    }
    if (fecha_nacimiento && id_equipo) {
        const id_nivel = await obtenerNivelEquipo(id_equipo);
        if (id_nivel) validarEdadSegunNivel(fecha_nacimiento, id_nivel);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows: jRows } = await client.query(`
            UPDATE jugadores
            SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido),
                posicion = COALESCE($3, posicion), estatura = COALESCE($4, estatura),
                fecha_nacimiento = COALESCE($5, fecha_nacimiento)
            WHERE id_jugador = $6 RETURNING *;
        `, [nombre, apellido, posicion, estatura, fecha_nacimiento, id_jugador]);

        if (id_equipo) {
            if (es_capitan) {
                await client.query(
                    `UPDATE plantilla_equipo SET es_capitan = false WHERE id_equipo = $1 AND id_jugador != $2 AND activo = true`,
                    [id_equipo, id_jugador]
                );
            }
            await client.query(`
                UPDATE plantilla_equipo
                SET numero_camiseta = COALESCE($1, numero_camiseta),
                    es_capitan = COALESCE($2, es_capitan)
                WHERE id_jugador = $3 AND id_equipo = $4 AND activo = true;
            `, [numero_camiseta, es_capitan, id_jugador, id_equipo]);
        }

        await client.query('COMMIT');
        return jRows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') throw { status: 400, message: 'El número de camiseta ya lo usa otro compañero.' };
        throw error;
    } finally {
        client.release();
    }
};

const eliminar = async (id_jugador, id_equipo) => {
    // Intentar con fecha_salida, si no existe la columna hacerlo sin ella
    try {
        const { rows } = await pool.query(`
            UPDATE plantilla_equipo
            SET activo = false, fecha_salida = CURRENT_DATE, es_capitan = false
            WHERE id_jugador = $1 AND id_equipo = $2 RETURNING *;
        `, [id_jugador, id_equipo]);
        return rows[0];
    } catch (e) {
        const { rows } = await pool.query(`
            UPDATE plantilla_equipo
            SET activo = false, es_capitan = false
            WHERE id_jugador = $1 AND id_equipo = $2 RETURNING *;
        `, [id_jugador, id_equipo]);
        return rows[0];
    }
};

const deshabilitar = eliminar;

module.exports = { obtenerPorEquipo, obtenerLibres, crear, unirAEquipo, actualizar, eliminar, deshabilitar };