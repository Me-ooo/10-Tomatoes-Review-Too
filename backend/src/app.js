import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import movieRoutes from './routes/movie.route.js';
import authRoutes from './routes/auth.route.js';

import reviewRoutes from './routes/review.route.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', reviewRoutes);

export { app };
