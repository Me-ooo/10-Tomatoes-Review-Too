import Movie from '../models/movie.model.js';
import Review from '../models/review.model.js';
import User from '../models/user.model.js';
import { generateEmbedding } from '../utils/openai.js';

// ---- Movies ----

// GET /api/admin/movies
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().select('-embedding').sort({ createdAt: -1 });
    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/movies
export const createMovie = async (req, res) => {
  try {
    const movieData = { ...req.body };
    
    // สร้าง Vector Embedding จากพล็อตเรื่อง
    if (movieData.synopsis) {
      try {
        movieData.embedding = await generateEmbedding(movieData.synopsis);
      } catch (err) {
        console.error('Failed to generate embedding during movie creation:', err);
      }
    }

    const movie = await Movie.create(movieData);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/movies/:id
export const updateMovie = async (req, res) => {
  try {
    const movieData = { ...req.body };
    const oldMovie = await Movie.findById(req.params.id);
    
    if (!oldMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // หากมีการแก้ไขพล็อตเรื่อง ให้คำนวณ Embedding ใหม่
    if (movieData.synopsis && movieData.synopsis !== oldMovie.synopsis) {
      try {
        movieData.embedding = await generateEmbedding(movieData.synopsis);
      } catch (err) {
        console.error('Failed to update embedding during movie update:', err);
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      movieData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/movies/:id
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // ลบรีวิวทั้งหมดที่เชื่อมโยงกับหนังเรื่องนี้ด้วย
    await Review.deleteMany({ movie: req.params.id });

    res.status(200).json({ message: 'Movie removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- Reviews ----

// GET /api/admin/reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const movieId = review.movie;
    await Review.findByIdAndDelete(reviewId);

    // คำนวณคะแนนเฉลี่ยใหม่ทันที
    const movie = await Movie.findById(movieId);
    if (movie) {
      const aggregation = await Review.aggregate([
        { $match: { movie: movie._id } },
        { $group: { _id: '$movie', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
      ]);

      if (aggregation.length > 0) {
        movie.averageRating = aggregation[0].averageRating;
        movie.reviewCount = aggregation[0].reviewCount;
      } else {
        movie.averageRating = 0;
        movie.reviewCount = 0;
      }
      await movie.save();
    }

    res.status(200).json({ message: 'Review deleted and movie ratings updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- Users ----

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username email role createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
