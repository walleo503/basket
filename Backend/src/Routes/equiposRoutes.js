const express = require('express');
const router = express.Router();
// ✅ IMPORTACIÓN CORRECTA - con S
const equiposController = require('../Controllers/equiposController');

// Todas las rutas con equiposController (con S)
router.get('/', equiposController.obtenerEquipos);
router.get('/entrenador/:id', equiposController.obtenerEquipoDeEntrenador);
router.get('/entrenador/:id/todos', equiposController.obtenerEquiposPorEntrenador);
router.get('/:id/estadisticas', equiposController.obtenerEstadisticasEquipo);
router.post('/', equiposController.crearEquipo);
router.put('/:id', equiposController.actualizarEquipo);
router.patch('/:id/deshabilitar', equiposController.deshabilitarEquipo);
router.patch('/:id/habilitar', equiposController.habilitarEquipo);

module.exports = router;