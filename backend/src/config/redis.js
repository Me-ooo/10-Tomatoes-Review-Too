import Redis from 'ioredis';

let redis = null;

export function createRedisClient() {
  if (redis) {
    return redis;
  }

  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('Redis connecting...');
  });

  redis.on('ready', () => {
    console.log('Redis ready');
  });

  redis.on('error', (err) => {
    // Suppressing noisy reconnect errors; connection issues are handled gracefully in server.js
    // console.warn('Redis error:', err.message);
  });

  return redis;
}

export async function connectRedis() {
  const client = createRedisClient();

  if (client.status === 'wait') {
    await client.connect();
  }

  return client;
}

export function getRedis() {
  if (!redis) {
    return createRedisClient();
  }

  return redis;
}

export async function closeRedis() {
  if (!redis) {
    return;
  }

  await redis.quit();
  redis = null;
}
