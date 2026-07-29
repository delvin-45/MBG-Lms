require('dotenv').config();
const app = require('./app');
const { initDb } = require('./config/db');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

// Entry Point Utama Server Backend
const startServer = async () => {
  try {
    // 1. Hubungkan ke memori Redis Caching
    await connectRedis();
    
    // 2. Hubungkan ke PostgreSQL, buat tabel otomatis (DDL Schema), & buat user bawaan
    await initDb();

    // 3. Nyalakan server HTTP Express untuk mendengarkan request dari Frontend/K6
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Gagal menjalankan server:', error);
    process.exit(1); // Matikan proses jika DB/Redis gagal tersambung saat booting
  }
};

startServer();
