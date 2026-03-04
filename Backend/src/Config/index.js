require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const pool = require('./db');
const errorHandler = require('../Middleware/errorHandler');
const app = express();
const cors = require('cors');
<<<<<<< HEAD

// 🟢 IMPORTACIONES
const usuarioRoutes = require('../Routes/usuarioRoutes');
const equipoRoutes = require('../Routes/equiposRoutes');
const canchaRoutes = require('../Routes/canchaRoutes');
const canalRoutes = require('../Routes/canalRoutes');
const jugadoresRoutes = require('../Routes/jugadoresRoutes');
const arbitroRoutes = require('../Routes/arbitroRoutes');

console.log('📁 Ruta del .env:', require('path').join(__dirname, '../../.env'));
console.log('🔧 DB_USER:', process.env.DB_USER);
console.log('🔧 DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ Cargada' : '✗ No cargada');
=======
const torneosRoutes = require('../Routes/torneosRoutes');     
const usuarioRoutes = require('../Routes/usuarioRoutes');
const equipoRoutes = require('../Routes/equiposRoutes');      
const canchaRoutes = require('../Routes/canchaRoutes');       
const canalRoutes = require('../Routes/canalRoutes');         
const jugadoresRoutes = require('../Routes/jugadoresRoutes'); 
const arbitroRoutes = require('../Routes/arbitroRoutes');     
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/canchas', canchaRoutes);
app.use('/api/canales', canalRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/arbitros', arbitroRoutes);
=======
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/equipos', equipoRoutes);        
app.use('/api/canchas', canchaRoutes);        
app.use('/api/canales', canalRoutes);          
app.use('/api/jugadores', jugadoresRoutes);   
app.use('/api/arbitros', arbitroRoutes);       
app.use('/api/torneos', torneosRoutes);        
>>>>>>> e3c36add34bb575a0def27e2705b9fc51b08c690

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});