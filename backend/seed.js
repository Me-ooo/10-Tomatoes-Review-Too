import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from './src/models/movie.model.js';
import { generateEmbedding } from './src/utils/openai.js';

const mockMovies = [
  {
    title: 'Inception',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    director: 'Christopher Nolan',
    releaseYear: 2010,
    posterUrl: 'https://example.com/inception.jpg',
  },
  {
    title: 'The Matrix',
    synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    genres: ['Action', 'Sci-Fi'],
    director: 'Lana Wachowski, Lilly Wachowski',
    releaseYear: 1999,
    posterUrl: 'https://example.com/matrix.jpg',
  },
  {
    title: 'สัปเหร่อ (The Undertaker)',
    synopsis: 'เรื่องราวของเซียงที่บวชเป็นพระเพื่อลืมแฟนเก่า แต่สุดท้ายต้องสึกออกมาเป็นสัปเหร่อเพื่อตามหาความจริงบางอย่าง',
    genres: ['Comedy', 'Horror', 'Drama'],
    director: 'ธิติ ศรีนวล',
    releaseYear: 2023,
    posterUrl: 'https://example.com/undertaker.jpg',
  },
  {
    title: 'Parasite',
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    genres: ['Drama', 'Thriller'],
    director: 'Bong Joon Ho',
    releaseYear: 2019,
    posterUrl: 'https://example.com/parasite.jpg',
  },
  {
    title: 'Interstellar',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    director: 'Christopher Nolan',
    releaseYear: 2014,
    posterUrl: 'https://example.com/interstellar.jpg',
  },
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    console.log('Clearing old movies...');
    await Movie.deleteMany({});
    console.log('Old movies cleared.');

    console.log('Seeding new movies...');
    for (const movie of mockMovies) {
      const contextText = `${movie.title} ${movie.synopsis} ${movie.genres.join(' ')}`;
      console.log(`Generating embedding for: ${movie.title}`);
      
      const embedding = await generateEmbedding(contextText);
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
