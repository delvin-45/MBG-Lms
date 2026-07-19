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

const CACHE_TTL = 60; // seconds

/**
 * Get a cached JSON value.
 * Returns parsed object, or null on miss / Redis error.
 */
const getCached = async (key) => {
  try {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Store a JSON value in cache with TTL.
 * Fails silently on Redis error.
 */
const setCache = async (key, data) => {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: CACHE_TTL });
  } catch {
    // fail silently — cache is best-effort
  }
};

/**
 * Delete one or more cache keys.
 * Fails silently on Redis error.
 */
const delCache = async (...keys) => {
  try {
    const flat = keys.flat().filter(Boolean);
    if (flat.length > 0) await redisClient.del(flat);
  } catch {
    // fail silently
  }
};

/**
 * Delete all keys matching a glob pattern using SCAN (non-blocking).
 * Safer than KEYS for production workloads.
 */
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
