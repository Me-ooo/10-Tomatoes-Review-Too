const { getRedis } = require('../config/redis');

const DEFAULT_TTL = Number(process.env.REDIS_TTL_SECONDS || 300);

function cacheKeyFromRequest(req) {
  const path = req.originalUrl || req.url;
  return `cache:${req.method}:${path}`;
}

/**
 * Redis-first cache for high-traffic GET routes.
 * Example: app.get('/api/movies/trending', cache({ key: 'movies:trending' }), handler)
 */
function cache(options = {}) {
  const ttl = options.ttl ?? DEFAULT_TTL;
  const keyFn =
    typeof options.key === 'function'
      ? options.key
      : options.key
        ? () => options.key
        : cacheKeyFromRequest;

  return async function cacheMiddleware(req, res, next) {
    if (req.method !== 'GET') {
      return next();
    }

    const redis = getRedis();
    const key = keyFn(req);

    try {
      const hit = await redis.get(key);

      if (hit) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(JSON.parse(hit));
      }
    } catch (err) {
      console.error('Redis cache read failed:', err.message);
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      res.set('X-Cache', 'MISS');

      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.set(key, JSON.stringify(body), 'EX', ttl).catch((err) => {
          console.error('Redis cache write failed:', err.message);
        });
      }

      return originalJson(body);
    };

    next();
  };
}

async function invalidateCache(keys) {
  const redis = getRedis();
  const list = Array.isArray(keys) ? keys : [keys];

  if (list.length === 0) {
    return;
  }

  await redis.del(...list);
}

module.exports = {
  cache,
  invalidateCache,
  cacheKeyFromRequest,
};
