import express from 'express';
import { 
  getTrendingMovies, 
  getMovieById,
  searchMovies
} from '../controllers/movie.controller.js';
import { cache } from '../middleware/cache.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/movies/trending
// Using Redis cache middleware for this high-traffic route
router.get(
  '/trending',
  cache({ key: 'movies:trending', ttl: Number(process.env.REDIS_TTL_SECONDS || 300) }),
  getTrendingMovies
);

// GET /api/movies/search
router.get('/search', searchMovies);

// GET /api/movies/:id
router.get('/:id', getMovieById);

export default router;
