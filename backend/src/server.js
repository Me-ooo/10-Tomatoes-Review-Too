import 'dotenv/config';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';

const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDatabase();
  
  try {
    await connectRedis();
  } catch (err) {
    console.warn('Redis connection failed, bypassing cache');
  }

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
