const { Pool } = require('pg');
const path = require('path');

// Cargar dotenv desde la raíz del backend
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 DB_USER cargado:', process.env.DB_USER);
console.log('🔧 DB_PASSWORD cargado:', process.env.DB_PASSWORD ? '✓ Sí' : '✗ No');

const pool = new Pool({
    user: String(process.env.DB_USER || 'postgres'),
    host: String(process.env.DB_HOST || 'localhost'),
    database: String(process.env.DB_NAME || 'sistema_basket'),
    password: String(process.env.DB_PASSWORD || '1234'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

module.exports = pool;