const Redis = require('ioredis');

let redis = null;

function createRedisClient() {
  if (redis) {
    return redis;
  }

  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 8) {
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  redis.on('connect', () => {
    console.log('Redis connecting...');
  });

  redis.on('ready', () => {
    console.log('Redis ready');
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  redis.on('end', () => {
    console.warn('Redis connection closed');
  });

  return redis;
}

async function connectRedis() {
  const client = createRedisClient();

  if (client.status === 'wait') {
    await client.connect();
  }

  return client;
}

function getRedis() {
  if (!redis) {
    return createRedisClient();
  }

  return redis;
}

function isRedisReady() {
  return Boolean(redis && redis.status === 'ready');
}

async function closeRedis() {
  if (!redis) {
    return;
  }

  await redis.quit();
  redis = null;
}

module.exports = {
  createRedisClient,
  connectRedis,
  getRedis,
  isRedisReady,
  closeRedis,
};
