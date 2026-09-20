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

export async function getMovieReviews(id) {
  const { data } = await api.get(`/api/movies/${id}/reviews`);
  return data.reviews ?? [];
}

export async function semanticSearch(query) {
  const { data } = await api.get('/api/movies/search', {
    params: { q: query },
  });
  return data.movies ?? [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginUser(credentials) {
  const { data } = await api.post('/api/auth/login', credentials);
  return data;
}

export async function registerUser(userData) {
  const { data } = await api.post('/api/auth/register', userData);
  return data;
}

export async function submitReview(movieId, payload) {
  const { data } = await api.post(`/api/reviews`, { movieId, ...payload });
  return data;
}

export default api;
