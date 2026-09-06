const { createClient } = require('redis');

const DEFAULT_TTL = Number(process.env.REDIS_TTL_SECONDS || 300);

let redisClient = null;
let connecting = null;

function getCacheKey(req) {
  return `cache:${req.method}:${req.originalUrl || req.url}`;
}

async function getRedisClient() {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (connecting) {
    return connecting;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  });

  redisClient.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  connecting = redisClient.connect().then(() => {
    connecting = null;
    console.log('Redis ready');
    return redisClient;
  });

  return connecting;
}

/**
 * Checks Redis before the route handler queries MongoDB.
 * HIT: return cached JSON. MISS: store the successful response.
 */
async function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const key = getCacheKey(req);

  try {
    const redis = await getRedisClient();
    const cached = await redis.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      res.set('X-Cache', 'MISS');

      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.setEx(key, DEFAULT_TTL, JSON.stringify(body)).catch((err) => {
          console.error('Redis cache write failed:', err.message);
        });
      }

      return originalJson(body);
    };

    return next();
  } catch (err) {
    console.error('Redis cache bypass:', err.message);
    res.set('X-Cache', 'BYPASS');
    return next();
  }
}

async function invalidateCache(keys) {
  try {
    const redis = await getRedisClient();
    const list = Array.isArray(keys) ? keys : [keys];

    if (list.length === 0) {
      return;
    }

    await redis.del(list);
  } catch (err) {
    console.error('Redis cache invalidate failed:', err.message);
  }
}

module.exports = {
  cacheMiddleware,
  getRedisClient,
  invalidateCache,
  getCacheKey,
};
