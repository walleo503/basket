const express = require('express');
const router = express.Router();
const equiposController = require('../Controllers/equiposController');

router.get('/', equiposController.obtenerEquipos);
router.get('/libres/disponibles', equiposController.obtenerEquiposLibres);
router.get('/entrenador/:id', equiposController.obtenerEquipoDeEntrenador);
router.get('/entrenador/:id/todos', equiposController.obtenerEquiposPorEntrenador);
router.get('/:id', equiposController.obtenerEquipoPorId);
router.get('/:id/estadisticas', equiposController.obtenerEstadisticasEquipo);
router.post('/', equiposController.crearEquipo);
router.put('/:id', equiposController.actualizarEquipo);
router.patch('/:id/deshabilitar', equiposController.deshabilitarEquipo);
router.patch('/:id/habilitar', equiposController.habilitarEquipo);
router.post('/:id/abandonar', equiposController.abandonarEquipo);
router.post('/:id/unirse', equiposController.unirseEquipo);

module.exports = router;