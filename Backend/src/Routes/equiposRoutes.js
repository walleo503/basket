const express = require('express');
const router = express.Router();
const equipoController = require('../Controllers/equiposController');

router.get('/libres', equipoController.obtenerEquiposLibres);
// Rutas básicas
router.get('/', equipoController.obtenerEquipos);
router.get('/:id', equipoController.obtenerEquipoPorId);
router.post('/', equipoController.crearEquipo);
router.put('/:id', equipoController.actualizarEquipo);

// Rutas específicas
router.get('/entrenador/:id', equipoController.obtenerEquipoDeEntrenador);
router.get('/:id/estadisticas', equipoController.obtenerEstadisticasEquipo);
router.patch('/:id/deshabilitar', equipoController.deshabilitarEquipo);
router.patch('/:id/habilitar', equipoController.habilitarEquipo);
router.post('/:id/abandonar', equipoController.abandonarEquipo);
router.post('/:id/unirse', equipoController.unirseEquipo);

module.exports = router;