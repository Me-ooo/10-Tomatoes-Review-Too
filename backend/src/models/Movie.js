const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    genres: {
      type: [String],
      default: [],
    },
    synopsis: {
      type: String,
      required: true,
      trim: true,
    },
    director: {
      type: String,
      trim: true,
      default: '',
    },
    releaseYear: {
      type: Number,
      min: 1888,
    },
    runtimeMinutes: {
      type: Number,
      min: 1,
    },
    posterUrl: {
      type: String,
      trim: true,
      default: '',
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: '',
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
      min: 0,
    },
    /**
     * Dense embedding used by MongoDB Atlas Vector Search.
     * Default size matches OpenAI text-embedding-3-small (1536).
     * If you switch to HuggingFace MiniLM, use 384 dimensions.
     */
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', synopsis: 'text', genres: 'text' });
movieSchema.index({ averageRating: -1, reviewCount: -1 });
movieSchema.index({ createdAt: -1 });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = { Movie };
