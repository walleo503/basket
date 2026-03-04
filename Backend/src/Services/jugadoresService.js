const pool = require('../Config/db');

// Posiciones oficiales del baloncesto
const POSICIONES_VALIDAS = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];

const obtenerPorEquipo = async (id_equipo) => {
    const query = `
        SELECT j.id_jugador, j.nombre, j.apellido, j.posicion, j.estatura, j.fecha_nacimiento,
            pe.numero_camiseta, pe.es_capitan, pe.activo, pe.rol_equipo -- <-- NUEVO CAMPO
        FROM jugadores j
        JOIN plantilla_equipo pe ON j.id_jugador = pe.id_jugador
        WHERE pe.id_equipo = $1 AND pe.activo = true
        ORDER BY pe.numero_camiseta ASC;
    `;
    const { rows } = await pool.query(query, [id_equipo]);
    return rows;
};

<<<<<<< HEAD
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

=======
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
    const { nombre, apellido, posicion, estatura, fecha_nacimiento, id_equipo, numero_camiseta, es_capitan, rol_equipo } = datosJugador;
    
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
<<<<<<< HEAD

=======
        
        const limiteQuery = `SELECT COUNT(*) FROM plantilla_equipo WHERE id_equipo = $1 AND activo = true`;
        const { rows: conteoRows } = await client.query(limiteQuery, [id_equipo]);
        if (parseInt(conteoRows[0].count) >= 15) throw new Error('REGLA_BALONCESTO: El equipo ya alcanzó el límite máximo de 15 jugadores.');
        if (es_capitan) {
            const capitanExistenteQuery = `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND es_capitan = true AND activo = true`;
            const { rows: capitanRows } = await client.query(capitanExistenteQuery, [id_equipo]);
            if (capitanRows.length > 0) {
                throw new Error('REGLA_BALONCESTO: El equipo ya tiene un capitán. Debes editar al actual y quitarle la capitanía antes de asignársela a alguien más.');
            }
        }
        
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
        const insertJugadorQuery = `
            INSERT INTO jugadores (nombre, apellido, posicion, estatura, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, $5) RETURNING id_jugador;
        `;
        const { rows: jugadorRows } = await client.query(insertJugadorQuery, [
<<<<<<< HEAD
            nombre, apellido, posicion, estatura || null, fecha_nacimiento
        ]);
        const id_jugador = jugadorRows[0].id_jugador;

=======
            nombre, apellido, posicion, estatura || null, fecha_nacimiento || null
        ]);
        const id_jugador = jugadorRows[0].id_jugador;
        
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
        const insertPlantillaQuery = `
            INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo, rol_equipo)
            VALUES ($1, $2, $3, $4, true, $5) RETURNING *;
        `;
        const { rows: plantillaRows } = await client.query(insertPlantillaQuery, [
            id_equipo, id_jugador, numero_camiseta, es_capitan || false, rol_equipo || 'Suplente'
        ]);

        await client.query('COMMIT');
        return { ...jugadorRows[0], ...plantillaRows[0] };
<<<<<<< HEAD
=======

>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
    } catch (error) {
        await client.query('ROLLBACK');
        
        if (error.code === '23505') {
            throw new Error(`REGLA_BALONCESTO: El número de camiseta ${numero_camiseta} ya está en uso en el equipo.`);
        }
        if (error.message.includes('REGLA_BALONCESTO')) {
            throw new Error(error.message);
        }
        throw error;
    } finally {
        client.release();
    }
};

const unirAEquipo = async (datosVinculacion) => {
    const { id_jugador, id_equipo, numero_camiseta, es_capitan, rol_equipo } = datosVinculacion;
    
    const limiteQuery = `SELECT COUNT(*) FROM plantilla_equipo WHERE id_equipo = $1 AND activo = true`;
    const { rows: conteoRows } = await pool.query(limiteQuery, [id_equipo]);
    if (parseInt(conteoRows[0].count) >= 15) throw new Error('REGLA_BALONCESTO: Límite de 15 jugadores alcanzado.');

    const camisetaQuery = `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND numero_camiseta = $2 AND activo = true`;
    const { rows: camisetaRows } = await pool.query(camisetaQuery, [id_equipo, numero_camiseta]);
    if (camisetaRows.length > 0) throw new Error(`REGLA_BALONCESTO: Camiseta ${numero_camiseta} en uso.`);
    if (es_capitan) {
        const capitanExistenteQuery = `SELECT id_jugador FROM plantilla_equipo WHERE id_equipo = $1 AND es_capitan = true AND activo = true`;
        const { rows: capitanRows } = await pool.query(capitanExistenteQuery, [id_equipo]);
        if (capitanRows.length > 0) {
            throw new Error('REGLA_BALONCESTO: El equipo ya tiene un capitán. Debes editar al actual y quitarle la capitanía antes de asignársela a alguien más.');
        }
    }

    const query = `
        INSERT INTO plantilla_equipo (id_equipo, id_jugador, numero_camiseta, es_capitan, activo, rol_equipo)
        VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT (id_equipo, id_jugador) 
        DO UPDATE SET numero_camiseta = EXCLUDED.numero_camiseta, 
                      es_capitan = EXCLUDED.es_capitan,
                      rol_equipo = EXCLUDED.rol_equipo,
                      activo = true
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_equipo, id_jugador, numero_camiseta, es_capitan || false, rol_equipo || 'Suplente']);
    return rows[0];
};

const actualizar = async (id_jugador, datosJugador) => {
<<<<<<< HEAD
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
=======
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
    const { numero_camiseta, es_capitan, rol_equipo } = datosPlantilla;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        if (es_capitan) {
            await client.query(`
                UPDATE plantilla_equipo 
                SET es_capitan = false 
                WHERE id_equipo = $1 AND id_jugador != $2 AND activo = true
            `, [id_equipo, id_jugador]);
        }

        const query = `
            UPDATE plantilla_equipo 
            SET numero_camiseta = COALESCE($1, numero_camiseta),
                es_capitan = COALESCE($2, es_capitan),
                rol_equipo = COALESCE($3, rol_equipo)
            WHERE id_jugador = $4 AND id_equipo = $5 AND activo = true
            RETURNING *;
        `;
        const { rows } = await client.query(query, [numero_camiseta, es_capitan, rol_equipo, id_jugador, id_equipo]);
        
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            throw new Error(`El número de camiseta ${numero_camiseta} ya lo usa otro compañero.`);
        }
        if (error.message.includes('REGLA_BALONCESTO')) {
            throw new Error(error.message);
        }
        throw error;
    } finally {
        client.release();
    }
};

const eliminar = async (id_jugador, id_equipo) => {
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
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

// Mantener eliminar como alias de deshabilitar por compatibilidad
const eliminar = deshabilitar;

module.exports = {
<<<<<<< HEAD
    obtenerPorEquipo, crear, actualizar,
    deshabilitar, eliminar
=======
    obtenerPorEquipo,
    obtenerLibres,
    crear,
    unirAEquipo,
    actualizar,
    actualizarPlantilla,
    eliminar
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
};