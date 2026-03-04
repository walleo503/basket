const jugadoresService = require('../Services/jugadoresService');

const obtenerJugadoresPorEquipo = async (req, res, next) => {
    try {
        const { idEquipo } = req.params;
        const jugadores = await jugadoresService.obtenerPorEquipo(idEquipo);
        res.status(200).json(jugadores);
    } catch (error) { next(error); }
};

const crearJugador = async (req, res, next) => {
    try {
        const nuevoJugador = await jugadoresService.crear(req.body);
        res.status(201).json({ mensaje: 'Jugador agregado exitosamente', jugador: nuevoJugador });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        if (error.message && (error.message.includes('REGLA_BALONCESTO') || error.message.includes('ya está en uso')))
            return res.status(400).json({ error: error.message.replace('REGLA_BALONCESTO: ', '') });
        next(error);
    }
};

const actualizarJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const jugadorActualizado = await jugadoresService.actualizar(id, req.body);
        res.status(200).json({ mensaje: 'Jugador actualizado exitosamente', jugador: jugadorActualizado });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        if (error.message) return res.status(400).json({ error: error.message.replace('REGLA_BALONCESTO: ', '') });
        next(error);
    }
};

const deshabilitarJugador = async (req, res, next) => {
    try {
        const { id, idEquipo } = req.params;
        await jugadoresService.eliminar(id, idEquipo);
        res.status(200).json({ mensaje: 'Jugador dado de baja del equipo exitosamente' });
    } catch (error) { next(error); }
};

const obtenerJugadoresLibres = async (req, res, next) => {
    try {
        const libres = await jugadoresService.obtenerLibres();
        res.status(200).json(libres);
    } catch (error) { next(error); }
};

const vincularJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vinculado = await jugadoresService.unirAEquipo({ id_jugador: id, ...req.body });
        res.status(200).json({ mensaje: 'Jugador fichado exitosamente', plantilla: vinculado });
    } catch (error) {
        if (error.message) return res.status(400).json({ error: error.message.replace('REGLA_BALONCESTO: ', '') });
        next(error);
    }
};

module.exports = {
    obtenerJugadoresPorEquipo, crearJugador, actualizarJugador,
    deshabilitarJugador, obtenerJugadoresLibres, vincularJugador
};