const express = require('express');
const { cache } = require('../middleware/cache');
const {
  listMovies,
  listTrending,
  getMovie,
} = require('../controllers/moviesController');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.get('/', asyncHandler(listMovies));
router.get(
  '/trending',
  cache({ key: 'movies:trending', ttl: Number(process.env.REDIS_TTL_SECONDS || 300) }),
  asyncHandler(listTrending)
);
router.get('/:id', asyncHandler(getMovie));

module.exports = { moviesRouter: router };
