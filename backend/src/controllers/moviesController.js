const { Movie } = require('../models/Movie');
const { invalidateCache } = require('../middlewares/cacheMiddleware');
const { embedText, movieEmbeddingText } = require('../services/embeddings');

const VECTOR_INDEX = process.env.VECTOR_INDEX_NAME || 'movie_embedding_index';

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

async function searchMovies(req, res) {
  const query = String(req.query.q || '').trim();

  if (!query) {
    return res.status(400).json({ message: 'Query parameter q is required' });
  }

  const queryVector = await embedText(query);

  const movies = await Movie.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX,
        path: 'embedding',
        queryVector,
        numCandidates: 100,
        limit: 10,
      },
    },
    {
      $project: {
        embedding: 0,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  return res.json({ movies, source: 'vector' });
}

async function createMovie(req, res) {
  const embedding = await embedText(movieEmbeddingText(req.body));
  const movie = await Movie.create({ ...req.body, embedding });
  await invalidateCache([MOVIE_LIST_CACHE_KEY, MOVIE_TRENDING_CACHE_KEY]);
  return res.status(201).json(movie);
}

module.exports = {
  listMovies,
  listTrending,
  getMovie,
  searchMovies,
  createMovie,
  MOVIE_LIST_CACHE_KEY,
  MOVIE_TRENDING_CACHE_KEY,
};
