import Movie from '../models/movie.model.js';
import { generateEmbedding } from '../utils/openai.js';

// GET /api/movies/trending
export const getTrendingMovies = async (req, res) => {
  try {
    // Get top 10 movies based on averageRating and reviewCount (or just recent ones)
    // Here we query from MongoDB and exclude the vector embedding field
    const movies = await Movie.find()
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(10)
      .select('-embedding');

    res.status(200).json({
      source: 'mongodb',
      movies,
      message: 'Trending movies fetched from database successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/movies/:id
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).select('-embedding');
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/movies (Admin)
export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/movies/:id (Admin)
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/movies/:id (Admin)
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/movies/search?q=...
export const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const embedding = await generateEmbedding(q);

    const movies = await Movie.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          embedding: 0,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
