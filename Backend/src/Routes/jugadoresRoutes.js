const express = require('express');
const router = express.Router();
const jugadoresController = require('../Controllers/jugadoresController');

router.get('/equipo/:idEquipo', jugadoresController.obtenerJugadoresPorEquipo);
router.post('/', jugadoresController.crearJugador);
router.put('/:id', jugadoresController.actualizarJugador);
// Ruta actualizada: deshabilitar en vez de eliminar
router.patch('/:id/equipo/:idEquipo/deshabilitar', jugadoresController.deshabilitarJugador);
// Mantener la ruta antigua por compatibilidad
router.delete('/:id/equipo/:idEquipo', jugadoresController.deshabilitarJugador);

module.exports = router;