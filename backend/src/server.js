require('dotenv').config();
const app = require('./app');
const { initDb } = require('./config/db');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    
    // Initialize PostgreSQL Database Schema and seed default users
    await initDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
