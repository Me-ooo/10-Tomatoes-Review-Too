require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { Movie } = require('./models/Movie');
const mongoose = require('mongoose');

const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS || 1536);

function dummyEmbedding(seed) {
  const values = [];
  let state = seed;

  for (let i = 0; i < EMBEDDING_DIMENSIONS; i += 1) {
    state = (state * 16807) % 2147483647;
    values.push(Number(((state / 2147483647) * 2 - 1).toFixed(6)));
  }

  return values;
}

const movies = [
  {
    title: 'Interstellar',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    synopsis:
      'A former NASA pilot joins a desperate mission through a wormhole to find a new home for humanity, racing against time as Earth becomes uninhabitable.',
    director: 'Christopher Nolan',
    releaseYear: 2014,
    runtimeMinutes: 169,
    posterUrl: 'https://picsum.photos/seed/interstellar-poster/400/600',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    averageRating: 4.7,
    reviewCount: 1284,
    embedding: dummyEmbedding(11),
  },
  {
    title: 'Arrival',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    synopsis:
      'When mysterious spacecraft land across the globe, a linguist is recruited to find a way to communicate with the visitors and uncover why they have come.',
    director: 'Denis Villeneuve',
    releaseYear: 2016,
    runtimeMinutes: 116,
    posterUrl: 'https://picsum.photos/seed/arrival-poster/400/600',
    trailerUrl: 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
    averageRating: 4.5,
    reviewCount: 902,
    embedding: dummyEmbedding(23),
  },
  {
    title: 'Parasite',
    genres: ['Thriller', 'Drama', 'Dark Comedy'],
    synopsis:
      'A struggling family infiltrates a wealthy household by posing as unrelated skilled workers, setting off a collision of class, greed, and secrets.',
    director: 'Bong Joon Ho',
    releaseYear: 2019,
    runtimeMinutes: 132,
    posterUrl: 'https://picsum.photos/seed/parasite-poster/400/600',
    trailerUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
    averageRating: 4.6,
    reviewCount: 2104,
    embedding: dummyEmbedding(37),
  },
  {
    title: 'Spirited Away',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    synopsis:
      'A young girl wanders into a spirit world where her parents are transformed, and she must work in a bathhouse for gods to find a way home.',
    director: 'Hayao Miyazaki',
    releaseYear: 2001,
    runtimeMinutes: 125,
    posterUrl: 'https://picsum.photos/seed/spirited-away-poster/400/600',
    trailerUrl: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    averageRating: 4.8,
    reviewCount: 1877,
    embedding: dummyEmbedding(41),
  },
  {
    title: 'The Grand Budapest Hotel',
    genres: ['Comedy', 'Drama', 'Adventure'],
    synopsis:
      'A legendary concierge and his lobby boy become wrapped in a theft, a family fortune, and a whirlwind chase across a fading European republic.',
    director: 'Wes Anderson',
    releaseYear: 2014,
    runtimeMinutes: 99,
    posterUrl: 'https://picsum.photos/seed/grand-budapest-poster/400/600',
    trailerUrl: 'https://www.youtube.com/watch?v=1Fg5iWmQjwk',
    averageRating: 4.3,
    reviewCount: 966,
    embedding: dummyEmbedding(53),
  },
];

async function seed() {
  await connectDatabase();

  await Movie.deleteMany({});
  const inserted = await Movie.insertMany(movies);

  console.log(`Seeded ${inserted.length} movies:`);
  inserted.forEach((movie) => {
    console.log(`- ${movie.title} (${movie._id})`);
  });
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
