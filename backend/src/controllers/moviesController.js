const { Movie } = require('../models/Movie');

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

module.exports = {
  listMovies,
  listTrending,
  getMovie,
};
