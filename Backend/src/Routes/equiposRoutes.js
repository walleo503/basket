const express = require('express');
const router = express.Router();
// ✅ IMPORTACIÓN CORRECTA - con S
const equiposController = require('../Controllers/equiposController');

<<<<<<< HEAD
// Todas las rutas con equiposController (con S)
router.get('/', equiposController.obtenerEquipos);
router.get('/entrenador/:id', equiposController.obtenerEquipoDeEntrenador);
router.get('/entrenador/:id/todos', equiposController.obtenerEquiposPorEntrenador);
router.get('/:id/estadisticas', equiposController.obtenerEstadisticasEquipo);
router.post('/', equiposController.crearEquipo);
router.put('/:id', equiposController.actualizarEquipo);
router.patch('/:id/deshabilitar', equiposController.deshabilitarEquipo);
router.patch('/:id/habilitar', equiposController.habilitarEquipo);
=======
router.get('/', equipoController.obtenerEquipos);
router.get('/libres/disponibles', equipoController.obtenerEquiposLibres);
router.post('/', equipoController.crearEquipo);

router.get('/entrenador/:id', equipoController.obtenerEquipoDeEntrenador);

router.get('/:id', equipoController.obtenerEquipoPorId);
router.put('/:id', equipoController.actualizarEquipo);
router.get('/:id/estadisticas', equipoController.obtenerEstadisticasEquipo);
router.patch('/:id/deshabilitar', equipoController.deshabilitarEquipo);
router.patch('/:id/habilitar', equipoController.habilitarEquipo);
router.post('/:id/abandonar', equipoController.abandonarEquipo);
router.post('/:id/unirse', equipoController.unirseEquipo);
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690

module.exports = router;