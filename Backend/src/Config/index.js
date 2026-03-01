require('dotenv').config();
const express = require('express');
const pool = require('./db');
const errorHandler = require('../Middleware/errorHandler');
const app = express();
const cors = require('cors');

// 🟢 IMPORTACIONES CORREGIDAS - nombres exactos de archivos
const usuarioRoutes = require('../Routes/usuarioRoutes');
const equipoRoutes = require('../Routes/equiposRoutes');      // NOTA: es equiposRoutes.js (con 's')
const canchaRoutes = require('../Routes/canchaRoutes');       // canchaRoutes.js
const canalRoutes = require('../Routes/canalRoutes');         // canalRoutes.js
const jugadoresRoutes = require('../Routes/jugadoresRoutes'); // jugadoresRoutes.js
const arbitroRoutes = require('../Routes/arbitroRoutes');     // arbitroRoutes.js

// Middleware
app.use(cors({
    origin: 'http://localhost:5173' 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟢 RUTAS - asegurar que coinciden con los nombres de archivo
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equipoRoutes);        // ✅ correcto
app.use('/api/canchas', canchaRoutes);        // ✅ correcto
app.use('/api/canales', canalRoutes);          // ✅ correcto
app.use('/api/jugadores', jugadoresRoutes);    // ✅ correcto
app.use('/api/arbitros', arbitroRoutes);       // ✅ correcto

// Probar conexión a BD
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión a PostgreSQL exitosa');
        console.log('📅 Hora del servidor DB:', res.rows[0].now);
    }
});

app.use(errorHandler);

app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando correctamente' });
});

console.log('🔧 Variables de entorno:');
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_NAME:', process.env.DB_NAME);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});