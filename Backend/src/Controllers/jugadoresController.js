const jugadoresService = require('../Services/jugadoresService');

// Obtener todos los jugadores
const obtenerJugadores = async (req, res, next) => {
    try {
        const jugadores = await jugadoresService.obtenerTodos();
        res.status(200).json(jugadores);
    } catch (error) {
        next(error);
    }
};

// Obtener un jugador por ID
const obtenerJugadorPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const jugador = await jugadoresService.obtenerPorId(id);
        
        if (!jugador) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado' });
        }
        res.status(200).json(jugador);
    } catch (error) {
        next(error);
    }
};

// Crear un nuevo jugador
const crearJugador = async (req, res, next) => {
    try {
        const nuevoJugador = await jugadoresService.crear(req.body);
        res.status(201).json({
            mensaje: 'Jugador creado exitosamente',
            jugador: nuevoJugador
        });
    } catch (error) {
        next(error);
    }
};

// Actualizar un jugador
const actualizarJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const jugadorActualizado = await jugadoresService.actualizar(id, req.body);
        
        if (!jugadorActualizado) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado' });
        }
        res.status(200).json({
            mensaje: 'Jugador actualizado exitosamente',
            jugador: jugadorActualizado
        });
    } catch (error) {
        next(error);
    }
};

// Eliminar (desactivar) un jugador
const eliminarJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const resultado = await jugadoresService.eliminar(id);
        
        if (!resultado) {
            return res.status(404).json({ mensaje: 'Jugador no encontrado' });
        }
        res.status(200).json({ mensaje: 'Jugador eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// Obtener jugadores por equipo
const obtenerJugadoresPorEquipo = async (req, res, next) => {
    try {
        const { idEquipo } = req.params;
        const jugadores = await jugadoresService.obtenerPorEquipo(idEquipo);
        res.status(200).json(jugadores);
    } catch (error) {
        next(error);
    }
};

// Obtener estadísticas de un jugador
const obtenerEstadisticasJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const estadisticas = await jugadoresService.obtenerEstadisticas(id);
        res.status(200).json(estadisticas);
    } catch (error) {
        next(error);
    }
};

// Verificar si un jugador está sancionado
const verificarSancion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sancion = await jugadoresService.verificarSancionActiva(id);
        res.status(200).json(sancion);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerJugadores,
    obtenerJugadorPorId,
    crearJugador,
    actualizarJugador,
    eliminarJugador,
    obtenerJugadoresPorEquipo,
    obtenerEstadisticasJugador,
    verificarSancion
};