import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getTrendingMovies() {
  const { data } = await api.get('/api/movies/trending', { timeout: 2500 });
  return {
    movies: data.movies ?? [],
    source: data.source ?? 'api',
  };
}

export async function getMovieById(id) {
  const { data } = await api.get(`/api/movies/${id}`, { timeout: 2500 });
  if (!data?.title) {
    throw new Error('Movie payload was empty');
  }
  return data;
}

export async function semanticSearch(query) {
  const { data } = await api.get('/api/movies/search', {
    params: { q: query },
  });
  return data.movies ?? [];
}

export async function submitReview(movieId, payload) {
  const { data } = await api.post(`/api/movies/${movieId}/reviews`, payload, {
    timeout: 2500,
  });
  return data;
}

export default api;
