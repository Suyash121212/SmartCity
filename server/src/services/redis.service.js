const Redis = require('ioredis');

let redisConnected = false;
let redisErrorLogged = false;

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  enableReadyCheck: false,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts to avoid spam
    if (times > 3) return null;
    return Math.min(times * 1000, 5000);
  },
});

redis.on('connect', () => {
  redisConnected = true;
  redisErrorLogged = false;
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  redisConnected = true;
});

redis.on('error', (err) => {
  redisConnected = false;
  if (!redisErrorLogged) {
    console.warn('⚠️  Redis unavailable (caching disabled):', err.message);
    redisErrorLogged = true;
  }
});

redis.on('close', () => {
  redisConnected = false;
});

// Try to connect (non-blocking)
redis.connect().catch(() => {
  // Silently fail — app works without Redis
});

const DEFAULT_TTL = 300; // 5 minutes

const get = async (key) => {
  if (!redisConnected) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const set = async (key, value, ttl = DEFAULT_TTL) => {
  if (!redisConnected) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Silently fail
  }
};

const del = async (...keys) => {
  if (!redisConnected) return;
  try {
    await redis.del(...keys);
  } catch {
    // Silently fail
  }
};

const invalidatePattern = async (pattern) => {
  if (!redisConnected) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Silently fail
  }
};

module.exports = { redis, get, set, del, invalidatePattern };
