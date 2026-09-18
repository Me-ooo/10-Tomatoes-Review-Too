const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { cache } = require('./middleware/cache');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get(
  '/api/movies/trending',
  cache({ key: 'movies:trending', ttl: Number(process.env.REDIS_TTL_SECONDS || 300) }),
  (_req, res) => {
    res.json({
      source: 'placeholder',
      movies: [],
      message: 'Trending route will query MongoDB in Phase 2.',
    });
  }
);

module.exports = { app };
