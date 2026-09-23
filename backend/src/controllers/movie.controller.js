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

// GET /api/movies/search?q=...
export const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // 1. ตรวจสอบลักษณะคำค้นหา (Query Analysis)
    // สำหรับภาษาไทย ห้ามใช้การเว้นวรรคนับคำ ให้ดูความยาวหรือลูกน้ำแทน
    const isShortQuery = q.trim().length < 15 || q.includes(',');

    // 2. ปรับน้ำหนัก (Dynamic Weights)
    const keywordWeight = isShortQuery ? 1.0 : 0.3;
    const vectorWeight = isShortQuery ? 0.0 : 0.7;

    let regexTerms = q.includes(',') 
      ? q.split(',').map(t => t.trim()).filter(t => t).map(tag => new RegExp(tag, 'i'))
      : [new RegExp(q.trim(), 'i')];
      
    // 3. ดึงผลลัพธ์จาก Keyword Search
    let keywordMovies = [];
    try {
      const keywordConditions = regexTerms.map(regex => ({
        $or: [
          { title: regex },
          { genres: regex },
          { synopsis: regex },
          { director: regex }
        ]
      }));

      keywordMovies = await Movie.find({
        $or: keywordConditions
      })
      .limit(20)
      .select('-embedding')
      .lean();
    } catch (err) {
      console.error('Keyword search failed', err);
    }

    // 4. ดึงผลลัพธ์จาก Vector Search (น้ำหนักแปรผัน)
    let vectorMovies = [];
    if (vectorWeight > 0) {
      try {
        const embedding = await generateEmbedding(q, true);
        const rawVectorMovies = await Movie.aggregate([
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
        
        // ขยับ Vector Threshold ให้เข้มงวดสุดขีด (คัดเฉพาะ >= 0.84)
        vectorMovies = rawVectorMovies.filter(m => m.score >= 0.84);
      } catch (embedError) {
        console.warn(`Vector search failed (${embedError.message}), relying purely on keyword search`);
      }
    }

    // 5. ผสมผสานคะแนน (Hybrid Scoring) และจัดการ Fallback
    const movieMap = new Map();

    // ประมวลผลคะแนนฝั่ง Vector
    vectorMovies.forEach(movie => {
      const id = movie._id.toString();
      movieMap.set(id, {
        ...movie,
        vectorScore: movie.score || 0,
        keywordScore: 0,
        finalScore: (movie.score || 0) * vectorWeight
      });
    });

    // ประมวลผลคะแนนฝั่ง Keyword
    keywordMovies.forEach(movie => {
      const id = movie._id.toString();
      // จำลองคะแนนความแม่นยำของ Keyword 
      let keywordScore = 0.5; // คะแนนพื้นฐานกรณีเจอใน synopsis/director
      
      const titleLower = movie.title.toLowerCase();
      const genresLower = movie.genres ? movie.genres.map(g => g.toLowerCase()) : [];
      const searchTerms = q.includes(',') 
        ? q.split(',').map(t => t.trim().toLowerCase()).filter(t => t) 
        : [q.trim().toLowerCase()];
      
      const titleMatch = searchTerms.some(term => titleLower.includes(term));
      // เช็คว่ามีคำที่ตรงกับ genres/tags หรือไม่ (ทั้งแบบซ่อนอยู่หรือตรงตัว)
      const genreMatch = searchTerms.some(term => genresLower.some(g => g.includes(term) || term.includes(g)));

      if (genreMatch) {
        keywordScore = 3.0; // โบนัสพิเศษ บังคับให้ทะยานขึ้นอันดับ 1
      } else if (titleMatch) {
        keywordScore = 1.0; // หากเจอในชื่อเรื่อง ให้คะแนนปกติ
      }
      
      const weightedKeywordScore = keywordScore * keywordWeight;

      if (movieMap.has(id)) {
        const existing = movieMap.get(id);
        existing.keywordScore = keywordScore;
        existing.finalScore += weightedKeywordScore; // รวมคะแนน
      } else {
        movieMap.set(id, {
          ...movie,
          vectorScore: 0,
          keywordScore: keywordScore,
          finalScore: weightedKeywordScore
        });
      }
    });

    // 6. คัดกรองด้วย Minimum Score Threshold และเรียงลำดับ
    const MIN_SCORE_THRESHOLD = 0.5;
    const sortedMovies = Array.from(movieMap.values())
      .filter(movie => movie.finalScore >= MIN_SCORE_THRESHOLD)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 10);

    // Log เพื่อดูคะแนน
    console.log(`\n--- Search Results for: "${q}" ---`);
    sortedMovies.forEach((m, idx) => {
      console.log(`[${idx+1}] Title: ${m.title} | Vector: ${m.vectorScore?.toFixed(4) || '0.0000'} | Keyword: ${m.keywordScore?.toFixed(4) || '0.0000'} | Final: ${m.finalScore?.toFixed(4) || '0.0000'}`);
    });

    res.status(200).json({ 
      movies: sortedMovies,
      meta: {
        isShortQuery,
        weights: { keyword: keywordWeight, vector: vectorWeight }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
