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

    const regex = new RegExp(q, 'i');
    
    // 1. ดึงผลลัพธ์จาก Keyword Search (น้ำหนัก 30%)
    let keywordMovies = [];
    try {
      keywordMovies = await Movie.find({
        $or: [
          { title: regex },
          { synopsis: regex },
          { director: regex }
        ]
      })
      .limit(20)
      .select('-embedding')
      .lean();
    } catch (err) {
      console.error('Keyword search failed', err);
    }

    // 2. ดึงผลลัพธ์จาก Vector Search (น้ำหนัก 70%)
    let vectorMovies = [];
    try {
      const embedding = await generateEmbedding(q);
      vectorMovies = await Movie.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: embedding,
            numCandidates: 100,
            limit: 20
          }
        },
        {
          $project: {
            embedding: 0,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]);
    } catch (embedError) {
      console.warn(`Vector search failed (${embedError.message}), relying purely on keyword search`);
    }

    // 3. ผสมผสานคะแนน (Hybrid Scoring)
    const movieMap = new Map();

    // ประมวลผลคะแนนฝั่ง Vector
    vectorMovies.forEach(movie => {
      const id = movie._id.toString();
      movieMap.set(id, {
        ...movie,
        finalScore: (movie.score || 0) * 0.7 // น้ำหนัก 70%
      });
    });

    // ประมวลผลคะแนนฝั่ง Keyword
    keywordMovies.forEach(movie => {
      const id = movie._id.toString();
      // จำลองคะแนนความแม่นยำของ Keyword 
      let keywordScore = 0.5; // คะแนนพื้นฐานกรณีเจอใน synopsis/director
      if (movie.title.toLowerCase().includes(q.toLowerCase())) {
        keywordScore = 1.0; // หากเจอในชื่อเรื่อง ให้คะแนนเต็ม
      }
      
      const weightedKeywordScore = keywordScore * 0.3; // น้ำหนัก 30%

      if (movieMap.has(id)) {
        const existing = movieMap.get(id);
        existing.finalScore += weightedKeywordScore; // รวมคะแนน
      } else {
        movieMap.set(id, {
          ...movie,
          finalScore: weightedKeywordScore
        });
      }
    });

    // 4. เรียงลำดับตามคะแนนรวม และเลือก 10 อันดับแรก
    const sortedMovies = Array.from(movieMap.values())
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 10);

    res.status(200).json({ movies: sortedMovies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
