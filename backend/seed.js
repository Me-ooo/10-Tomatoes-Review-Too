import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from './src/models/movie.model.js';
import { generateEmbedding } from './src/utils/openai.js';

const fetchMoviesFromTMDB = async () => {
  const url = 'https://api.themoviedb.org/3/movie/popular?language=th-TH&page=1';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.results.slice(0, 20); // จำกัดแค่ 20 เรื่องแรก
  } catch (error) {
    console.error('Error fetching movies from TMDB:', error);
    throw error;
  }
};

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    console.log('Clearing old movies...');
    await Movie.deleteMany({});
    console.log('Old movies cleared.');

    console.log('Fetching popular movies from TMDB...');
    const rawMovies = await fetchMoviesFromTMDB();
    console.log(`Fetched ${rawMovies.length} movies. Starting to seed...`);

    for (const raw of rawMovies) {
      const movie = {
        title: raw.title || raw.original_title,
        synopsis: raw.overview || 'ไม่มีเรื่องย่อ',
        genres: ['General'],
        director: 'Unknown',
        releaseYear: raw.release_date ? parseInt(raw.release_date.split('-')[0], 10) : null,
        posterUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : ''
      };

      console.log(`Generating embedding for: ${movie.title}`);
      const embedding = await generateEmbedding(movie.synopsis);
      movie.embedding = embedding;

      await Movie.create(movie);
      console.log(`Saved: ${movie.title}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();
