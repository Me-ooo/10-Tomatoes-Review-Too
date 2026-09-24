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

    // 1. กำหนดน้ำหนักคะแนนคงที่ (Fixed Weights)
    const keywordWeight = 0.3;
    const vectorWeight = 0.7;

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
            $set: { score: { $meta: "vectorSearchScore" } }
          },
          {
            $unset: "embedding"
          }
        ]);
        
        // ลดเกณฑ์ Vector เพื่อให้หนังเข้ารับโบนัส Keyword ได้ (คัดเฉพาะ >= 0.72)
        vectorMovies = rawVectorMovies.filter(m => m.score >= 0.72);
      } catch (embedError) {
        console.warn(`Vector search failed (${embedError.message}), relying purely on keyword search`);
      }
    }

    // 5. ผสมผสานคะแนน (Hybrid Scoring) และจัดการ Fallback
    const movieMap = new Map();

    // รวบรวมหนังทั้งหมดลง Map ก่อน
    vectorMovies.forEach(movie => {
      const id = movie._id.toString();
      movieMap.set(id, {
        ...movie,
        vectorScore: movie.score || 0,
        keywordScore: 0,
        finalScore: 0,
        fromKeyword: false
      });
    });

    keywordMovies.forEach(movie => {
      const id = movie._id.toString();
      if (!movieMap.has(id)) {
        movieMap.set(id, {
          ...movie,
          vectorScore: 0,
          keywordScore: 0,
          finalScore: 0,
          fromKeyword: true
        });
      } else {
        movieMap.get(id).fromKeyword = true;
      }
    });

    // Smart Genre Mapping (คำภาษาไทย -> หมวดหมู่สากล) รองรับ 2 ภาษา
    const genreMap = {
      "ผี": ["horror", "สยองขวัญ"],
      "สยอง": ["horror", "สยองขวัญ"],
      "ตลก": ["comedy", "ตลก"],
      "ฮา": ["comedy", "ตลก"],
      "ฟีลกู๊ด": ["comedy", "ตลก"],
      "เศร้า": ["drama", "ดราม่า"],
      "น้ำตา": ["drama", "ดราม่า"],
      "ร้องไห้": ["drama", "ดราม่า"],
      "บู๊": ["action", "แอคชั่น"],
      "รัก": ["romance", "โรแมนติก"],
      "แฟนตาซี": ["fantasy", "แฟนตาซี"],
      "การ์ตูน": ["animation", "แอนิเมชัน"],
      "อวกาศ": ["sci-fi", "ไซไฟ"],
      "ครอบครัว": ["family", "ครอบครัว"],
      "อบอุ่น": ["family", "ครอบครัว"],
      "เอาชีวิตรอด": ["adventure", "ผจญภัย", "action", "แอ็คชั่น", "thriller", "ระทึกขวัญ"],
      "รอดชีวิต": ["adventure", "ผจญภัย", "action", "แอ็คชั่น"],
      "ป่า": ["adventure", "ผจญภัย"],
      "ผจญภัย": ["adventure", "ผจญภัย"]
    };

    const searchTerms = q.includes(',') 
      ? q.split(',').map(t => t.trim().toLowerCase()).filter(t => t) 
      : [q.trim().toLowerCase()];

    // ประมวลผลคะแนนให้หนัง *ทุกเรื่อง* แบบ Global Scoring
    for (const [id, movie] of movieMap.entries()) {
      let keywordScore = 0;
      
      // ให้คะแนนพื้นฐานถ้าหนังถูกดึงมาจากการค้นหาด้วย Keyword ปกติ
      if (movie.fromKeyword) {
        keywordScore = 0.5;
      }
      
      const titleLower = movie.title ? movie.title.toLowerCase() : '';
      const genresLower = movie.genres ? movie.genres.map(g => g.toLowerCase()) : [];
      const tagsLower = movie.tags ? movie.tags.map(t => t.toLowerCase()) : [];
      
      const titleMatch = searchTerms.some(term => titleLower.includes(term));
      
      // 1. ตรวจสอบ Smart Genre Mapping (Bilingual Array Match)
      let smartGenreMatch = false;
      for (const term of searchTerms) {
        for (const [key, mappedGenres] of Object.entries(genreMap)) {
          if (term.includes(key)) {
            const matchInGenres = movie.genres ? movie.genres.some(g => mappedGenres.some(mg => mg.toLowerCase() === g.toLowerCase())) : false;
            const matchInTags = movie.tags ? movie.tags.some(t => mappedGenres.some(mg => mg.toLowerCase() === t.toLowerCase())) : false;
            
            if (matchInGenres || matchInTags) {
              smartGenreMatch = true;
              break;
            }
          }
        }
        if (smartGenreMatch) break;
      }

      // 2. เช็คว่ามีคำที่ตรงกับ genres/tags ปกติหรือไม่
      const normalGenreMatch = searchTerms.some(term => {
        const matchGenres = genresLower.some(g => g.includes(term) || term.includes(g));
        const matchTags = tagsLower.some(t => t.includes(term) || term.includes(t));
        return matchGenres || matchTags;
      });

      if (smartGenreMatch || normalGenreMatch) {
        keywordScore = 3.0; // โบนัสพิเศษ บังคับให้ทะยานขึ้นอันดับ 1
      } else if (titleMatch) {
        keywordScore = 1.0; // หากเจอในชื่อเรื่อง ให้คะแนนปกติ
      }
      
      movie.keywordScore = keywordScore;
      movie.finalScore = (movie.vectorScore * vectorWeight) + (keywordScore * keywordWeight);
    }

    // 6. คัดกรองด้วย Dynamic Threshold และเรียงลำดับ
    let sortedMovies = Array.from(movieMap.values())
      .filter(movie => {
        const threshold = movie.keywordScore === 0 ? 0.50 : 0.48;
        return movie.finalScore >= threshold;
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 10);

    // 7. Fallback Result
    if (sortedMovies.length === 0) {
      sortedMovies = Array.from(movieMap.values())
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 10);
    }

    // Log เพื่อดูคะแนน
    console.log(`\n--- Search Results for: "${q}" ---`);
    sortedMovies.forEach((m, idx) => {
      console.log(`[${idx+1}] Title: ${m.title} | Vector: ${m.vectorScore?.toFixed(4) || '0.0000'} | Keyword: ${m.keywordScore?.toFixed(4) || '0.0000'} | Final: ${m.finalScore?.toFixed(4) || '0.0000'}`);
    });

    res.status(200).json({ 
      movies: sortedMovies,
      meta: {
        weights: { keyword: keywordWeight, vector: vectorWeight }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
