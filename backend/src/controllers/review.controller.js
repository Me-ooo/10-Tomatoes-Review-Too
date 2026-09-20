import Review from '../models/review.model.js';
import Movie from '../models/movie.model.js';

// GET /api/movies/:id/reviews
export const getReviewsForMovie = async (req, res) => {
  try {
    const { id: movieId } = req.params;

    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { movieId, rating, text } = req.body;
    const userId = req.user._id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const existingReview = await Review.findOne({ movie: movieId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    const newReview = await Review.create({
      movie: movieId,
      user: userId,
      rating: Number(rating),
      text,
    });

    // Recalculate averageRating and reviewCount
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

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
