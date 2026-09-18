export const sampleMovies = [
  {
    _id: 'interstellar',
    title: 'Interstellar',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    synopsis:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival, wrestling with time, love, and the physics of hope.',
    director: 'Christopher Nolan',
    releaseYear: 2014,
    averageRating: 4.7,
    reviewCount: 1284,
    posterUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  },
  {
    _id: 'arrival',
    title: 'Arrival',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    synopsis:
      'A linguist is recruited by the military to communicate with alien visitors, discovering that language can reshape how we experience time.',
    director: 'Denis Villeneuve',
    releaseYear: 2016,
    averageRating: 4.5,
    reviewCount: 902,
    posterUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
  },
  {
    _id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    genres: ['Sci-Fi', 'Thriller'],
    synopsis:
      'A young blade runner unearths a long-buried secret that has the potential to plunge what’s left of society into chaos.',
    director: 'Denis Villeneuve',
    releaseYear: 2017,
    averageRating: 4.4,
    reviewCount: 1103,
    posterUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
  },
  {
    _id: 'her',
    title: 'Her',
    genres: ['Romance', 'Drama', 'Sci-Fi'],
    synopsis:
      'In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.',
    director: 'Spike Jonze',
    releaseYear: 2013,
    averageRating: 4.3,
    reviewCount: 744,
    posterUrl:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=ne6p6MfLBxc',
  },
  {
    _id: 'gravity',
    title: 'Gravity',
    genres: ['Sci-Fi', 'Thriller'],
    synopsis:
      'Two astronauts work together to survive after an accident leaves them adrift in space, stranded from home by a silent, hostile void.',
    director: 'Alfonso Cuarón',
    releaseYear: 2013,
    averageRating: 4.1,
    reviewCount: 688,
    posterUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=OiTiKOy59o4',
  },
  {
    _id: 'the-martian',
    title: 'The Martian',
    genres: ['Sci-Fi', 'Adventure', 'Comedy'],
    synopsis:
      'An astronaut becomes stranded on Mars after his team assumes him dead, and must rely on his ingenuity to find a way to signal Earth.',
    director: 'Ridley Scott',
    releaseYear: 2015,
    averageRating: 4.2,
    reviewCount: 831,
    posterUrl:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=ej3ioOneTy8',
  },
];

export function youtubeEmbedUrl(trailerUrl = '') {
  try {
    const parsed = new URL(trailerUrl);
    const id =
      parsed.searchParams.get('v') || parsed.pathname.replace('/', '');
    return id ? `https://www.youtube.com/embed/${id}` : '';
  } catch {
    return '';
  }
}
