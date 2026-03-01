const jugadoresService = require('../Services/jugadoresService');

const obtenerJugadoresPorEquipo = async (req, res, next) => {
    try {
        const { idEquipo } = req.params;
        const jugadores = await jugadoresService.obtenerPorEquipo(idEquipo);
        res.status(200).json(jugadores);
    } catch (error) {
        next(error);
    }
};

const crearJugador = async (req, res, next) => {
    try {
        const nuevoJugador = await jugadoresService.crear(req.body);
        res.status(201).json({
            mensaje: 'Jugador agregado exitosamente',
            jugador: nuevoJugador
        });
    } catch (error) {
        next(error);
    }
};

const actualizarJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const jugadorActualizado = await jugadoresService.actualizar(id, req.body);
        
        res.status(200).json({
            mensaje: 'Jugador actualizado exitosamente',
            jugador: jugadorActualizado
        });
    } catch (error) {
        next(error);
    }
};

const eliminarJugador = async (req, res, next) => {
    try {
        const { id, idEquipo } = req.params;
        const resultado = await jugadoresService.eliminar(id, idEquipo);
        
        res.status(200).json({
            mensaje: 'Jugador eliminado del equipo'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerJugadoresPorEquipo,
    crearJugador,
    actualizarJugador,
    eliminarJugador
};