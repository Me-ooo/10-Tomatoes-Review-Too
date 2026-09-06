const { Movie } = require('../models/Movie');
const { invalidateCache } = require('../middlewares/cacheMiddleware');

const MOVIE_LIST_CACHE_KEY = 'cache:GET:/api/movies';
const MOVIE_TRENDING_CACHE_KEY = 'movies:trending';

async function listMovies(_req, res) {
  const movies = await Movie.find().sort({ averageRating: -1, title: 1 }).lean();
  res.json({ movies });
}

async function listTrending(_req, res) {
  const movies = await Movie.find()
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(10)
    .lean();

  res.json({
    source: 'mongodb',
    movies,
  });
}

async function getMovie(req, res) {
  const movie = await Movie.findById(req.params.id).lean();

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  return res.json(movie);
}

async function createMovie(req, res) {
  const movie = await Movie.create(req.body);
  await invalidateCache([MOVIE_LIST_CACHE_KEY, MOVIE_TRENDING_CACHE_KEY]);
  return res.status(201).json(movie);
}

module.exports = {
  listMovies,
  listTrending,
  getMovie,
  createMovie,
  MOVIE_LIST_CACHE_KEY,
  MOVIE_TRENDING_CACHE_KEY,
};
