import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    genres: {
      type: [String],
    },
    synopsis: {
      type: String,
      required: true,
      trim: true,
    },
    director: {
      type: String,
      trim: true,
    },
    releaseYear: {
      type: Number,
      min: 1888,
    },
    runtimeMinutes: {
      type: Number,
    },
    posterUrl: {
      type: String,
    },
    trailerUrl: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 'text', synopsis: 'text', genres: 'text' });
movieSchema.index({ averageRating: -1, reviewCount: -1 });

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
