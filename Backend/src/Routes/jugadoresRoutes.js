const express = require('express');
const router = express.Router();
const jugadoresController = require('../Controllers/jugadoresController');

// Rutas básicas CRUD
router.get('/', jugadoresController.obtenerJugadores);
router.get('/:id', jugadoresController.obtenerJugadorPorId);
router.post('/', jugadoresController.crearJugador);
router.put('/:id', jugadoresController.actualizarJugador);
router.delete('/:id', jugadoresController.eliminarJugador);

// Rutas específicas
router.get('/equipo/:idEquipo', jugadoresController.obtenerJugadoresPorEquipo);
router.get('/:id/estadisticas', jugadoresController.obtenerEstadisticasJugador);
router.get('/:id/sancion', jugadoresController.verificarSancion);

module.exports = router;