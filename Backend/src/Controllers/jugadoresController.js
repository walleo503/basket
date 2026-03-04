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
        res.status(201).json({ mensaje: 'Jugador agregado exitosamente', jugador: nuevoJugador });
    } catch (error) {
<<<<<<< HEAD
        if (error.status) return res.status(error.status).json({ error: error.message });
=======
        if (error.message.includes('límite máximo') || error.message.includes('ya está en uso')|| error.message.includes('REGLA_BALONCESTO')) {
            return res.status(400).json({ error: error.message.replace('REGLA_BALONCESTO: ', '') });
        }
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
        next(error);
    }
};

const actualizarJugador = async (req, res, next) => {
    try {
        const { id } = req.params;
<<<<<<< HEAD
        const jugadorActualizado = await jugadoresService.actualizar(id, req.body);
        res.status(200).json({ mensaje: 'Jugador actualizado exitosamente', jugador: jugadorActualizado });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
=======
        const datosBody = req.body;
        const jugadorActualizado = await jugadoresService.actualizar(id, datosBody);
        if (datosBody.id_equipo) {
            await jugadoresService.actualizarPlantilla(id, datosBody.id_equipo, datosBody);
        }
        
        res.status(200).json({
            mensaje: 'Jugador actualizado exitosamente',
            jugador: jugadorActualizado
        });
    } catch (error) {
        if (error.message.includes('ya lo usa otro compañero')) {
            return res.status(400).json({ error: error.message.replace('REGLA_BALONCESTO: ', '') });
        }
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
        next(error);
    }
};

// Renombrado a deshabilitar (ya no elimina, solo pone activo = false)
const deshabilitarJugador = async (req, res, next) => {
    try {
<<<<<<< HEAD
        const { id, idEquipo } = req.params;
        await jugadoresService.deshabilitar(id, idEquipo);
        res.status(200).json({ mensaje: 'Jugador deshabilitado del equipo' });
=======
        const { id, idEquipo } = req.params; 
        
        await jugadoresService.eliminar(id, idEquipo);
        
        res.status(200).json({
            mensaje: 'Jugador dado de baja del equipo exitosamente'
        });
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
    } catch (error) {
        next(error);
    }
};
const obtenerJugadoresLibres = async (req, res, next) => {
    try {
        const libres = await jugadoresService.obtenerLibres();
        res.status(200).json(libres);
    } catch (error) {
        next(error);
    }
};

const vincularJugador = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const datosVinculacion = { id_jugador: id, ...req.body };
        
        const vinculado = await jugadoresService.unirAEquipo(datosVinculacion);
        
        res.status(200).json({
            mensaje: 'Jugador fichado exitosamente',
            plantilla: vinculado
        });
    } catch (error) {
        if (error.message.includes('Límite') || error.message.includes('uso')) {
            return res.status(400).json({ error: error.message.replace('REGLA_BALONCESTO: ', '') });
        }
        next(error);
    }
};
module.exports = {
    obtenerJugadoresPorEquipo,
    crearJugador,
    actualizarJugador,
<<<<<<< HEAD
    deshabilitarJugador
=======
    eliminarJugador,
    obtenerJugadoresLibres,
    vincularJugador
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690
};