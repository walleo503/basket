const equiposService = require('../Services/equiposServices');

const obtenerEquipos = async (req, res, next) => {
    try {
        const equipos = await equiposService.obtenerTodos();
        res.status(200).json(equipos);
    } catch (error) {
        next(error);
    }
};

const obtenerEquipoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipo = await equiposService.obtenerPorId(id);
        
        if (!equipo) {
            return res.status(404).json({ mensaje: 'Equipo no encontrado' });
        }
        res.status(200).json(equipo);
    } catch (error) {
        next(error);
    }
};

const crearEquipo = async (req, res, next) => {
    try {
        const nuevoEquipo = await equiposService.crear(req.body);
        res.status(201).json({
            mensaje: 'Equipo creado exitosamente',
            equipo: nuevoEquipo
        });
    } catch (error) {
        next(error);
    }
};

const actualizarEquipo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipoActualizado = await equiposService.actualizar(id, req.body);
        res.status(200).json({
            mensaje: 'Equipo actualizado exitosamente',
            equipo: equipoActualizado
        });
    } catch (error) {
        next(error);
    }
};

const deshabilitarEquipo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipo = await equiposService.cambiarEstado(id, false);
        res.status(200).json({
            mensaje: 'Equipo deshabilitado correctamente',
            equipo
        });
    } catch (error) {
        next(error);
    }
};

const habilitarEquipo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipo = await equiposService.cambiarEstado(id, true);
        res.status(200).json({
            mensaje: 'Equipo habilitado correctamente',
            equipo
        });
    } catch (error) {
        next(error);
    }
};

const obtenerEquipoDeEntrenador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipo = await equiposService.obtenerPorEntrenador(id);
        
        if (!equipo) {
            return res.status(404).json({ mensaje: 'No tiene equipo registrado' });
        }
        res.status(200).json(equipo);
    } catch (error) {
        next(error);
    }
};

// ✅ NUEVA FUNCIÓN PARA OBTENER TODOS LOS EQUIPOS
const obtenerEquiposPorEntrenador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipos = await equiposService.obtenerEquiposPorEntrenador(id);
        res.status(200).json(equipos);
    } catch (error) {
        next(error);
    }
};

const obtenerEstadisticasEquipo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const estadisticas = await equiposService.obtenerEstadisticas(id);
        res.status(200).json(estadisticas);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerEquipos,
    obtenerEquipoPorId,
    crearEquipo,
    actualizarEquipo,
    deshabilitarEquipo,
    habilitarEquipo,
    obtenerEquipoDeEntrenador,
    obtenerEquiposPorEntrenador,  // ✅ EXPORTAR LA NUEVA FUNCIÓN
    obtenerEstadisticasEquipo
};