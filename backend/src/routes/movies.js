const express = require('express');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const {
  listMovies,
  listTrending,
  getMovie,
  createMovie,
} = require('../controllers/moviesController');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.get('/', cacheMiddleware, asyncHandler(listMovies));
router.get('/trending', cacheMiddleware, asyncHandler(listTrending));
router.get('/:id', asyncHandler(getMovie));
router.post('/', verifyToken, isAdmin, asyncHandler(createMovie));

module.exports = { moviesRouter: router };
