const {
  cacheMiddleware,
  getRedisClient,
  invalidateCache,
  getCacheKey,
} = require('../middlewares/cacheMiddleware');

module.exports = {
  cacheMiddleware,
  cache: cacheMiddleware,
  getRedisClient,
  invalidateCache,
  getCacheKey,
};
