const equipoService = require('../Services/equipoServices');

const obtenerEquipos = async (req, res, next) => {
    try {
        const equipos = await equipoService.obtenerTodos();
        res.status(200).json(equipos);
    } catch (error) {
    
        next(error);
    }
};

const crearEquipo = async (req, res, next) => {
    try {
        const nuevoEquipo = await equipoService.crear(req.body);
        res.status(201).json({
            mensaje: 'Equipo creado exitosamente',
            equipo: nuevoEquipo
        });
    } catch (error) {
        next(error);
    }
};
const obtenerEquipoDeEntrenador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipo = await equipoService.obtenerPorEntrenador(id);
        
        if (!equipo) {
            return res.status(404).json({ mensaje: 'No tiene equipo registrado' });
        }
        res.status(200).json(equipo);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerEquipos,
    crearEquipo,
    obtenerEquipoDeEntrenador
};