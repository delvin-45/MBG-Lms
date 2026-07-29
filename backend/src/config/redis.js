const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Redis connected successfully');
});

// Auto-connect
const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

module.exports = {
  redisClient: client,
  connectRedis
};
