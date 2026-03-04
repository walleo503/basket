const pool = require('../Config/db');

const obtenerTodas = async () => {
    const query = `
        SELECT id_cancha, nombre_cancha, direccion, capacidad 
        FROM canchas 
        WHERE activo = true 
        ORDER BY nombre_cancha ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const crear = async (datosCancha) => {
    const { nombre_cancha, capacidad, direccion } = datosCancha;
    const query = `
        INSERT INTO canchas (nombre_cancha, capacidad, direccion)
        VALUES ($1, $2, $3) 
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre_cancha, capacidad || null, direccion]);
    return rows[0];
};

module.exports = { obtenerTodas, crear };