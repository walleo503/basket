require('dotenv').config();
const express = require('express');
const pool = require('./db'); // ✅ Esto está bien, asume que db.js está en la misma carpeta
const usuarioRoutes = require('../Routes/usuarioRoutes');
const errorHandler = require('../Middleware/errorHandler');
const app = express();
const cors = require('cors');
const equipoRoutes = require('../Routes/equiposRoutes');
const canchaRoutes = require('../Routes/canchaRoutes');
const canalRoutes = require('../Routes/canalRoutes');
const jugadoresRoutes = require('./Routes/jugadoresRoutes');
const arbitroRoutes = require('./Routes/arbitroRoutes');

// 🟢 CAMBIO 1: Elimina el app.use(cors()) duplicado y deja solo este:
app.use(cors({
    origin: 'http://localhost:5173' 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/canchas', canchaRoutes);
app.use('/api/canales', canalRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/arbitros', arbitroRoutes);


pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        console.error('📌 Detalles del error:', err);
    } else {
        console.log('✅ Conexión a PostgreSQL exitosa');
        console.log('📅 Hora del servidor DB:', res.rows[0].now);
    }
});

app.use(errorHandler);

app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando correctamente' });
});

// 🟢 CAMBIO 3: Agrega logs de las variables de entorno (OPCIONAL, pero útil para depurar)
console.log('🔧 Variables de entorno cargadas:');
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- PORT:', process.env.PORT);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});