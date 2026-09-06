const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { moviesRouter } = require('./routes/movies');
const { authRouter } = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);

app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Account already exists' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = { app };
