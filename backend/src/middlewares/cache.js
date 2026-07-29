/**
 * Redis Cache Helper for MBG API
 *
 * Provides get/set/delete utilities with silent failure (cache miss
 * on Redis outage does not break request handling).
 *
 * Cache TTL: 60 seconds for GET endpoints.
 * Invalidation: called explicitly from service layer on mutations.
 */

const { redisClient } = require('../config/redis');

// Waktu Simpan Cache: 60 detik untuk endpoint GET (bisa kedaluwarsa otomatis)
const CACHE_TTL = 60; // detik

// 1. Ambil data dari memori Redis. Jika Redis mati/error, kembalikan null secara diam-diam (Silent Fail)
const getCached = async (key) => {
  try {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // Redis error dianggap Cache Miss, aplikasi tetap jalan via DB
  }
};

// 2. Simpan data ke memori Redis selama 60 detik. Gagal secara diam-diam jika Redis mati.
const setCache = async (key, data) => {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: CACHE_TTL });
  } catch {
    // Silent fail - Redis bersifat Best-Effort Caching
  }
};

// 3. Hapus 1 atau beberapa key cache spesifik di Redis
const delCache = async (...keys) => {
  try {
    const flat = keys.flat().filter(Boolean);
    if (flat.length > 0) await redisClient.del(flat);
  } catch {
    // Silent fail
  }
};

// 4. Hapus seluruh key cache berdasarkan pola (misal 'courses:*') menggunakan Redis SCAN (Non-Blocking)
const clearPattern = async (pattern) => {
  try {
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = reply.cursor;
      if (reply.keys.length > 0) {
        await redisClient.del(reply.keys);
      }
    } while (cursor !== 0);
  } catch {
    // fail silently
  }
};

module.exports = {
  getCached,
  setCache,
  delCache,
  clearPattern
};
