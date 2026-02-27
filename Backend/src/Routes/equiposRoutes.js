const express = require('express');
const router = express.Router();
const equipoController = require('../Controllers/equipoController');

router.get('/', equipoController.obtenerEquipos);
router.post('/', equipoController.crearEquipo);
router.get('/entrenador/:id', equipoController.obtenerEquipoDeEntrenador);

module.exports = router;