require('dotenv').config();

const { app } = require('./app');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDatabase();
  await connectRedis();

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
