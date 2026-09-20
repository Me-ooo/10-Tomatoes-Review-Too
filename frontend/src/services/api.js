import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// Auth APIs
// ==========================================
export async function loginUser(credentials) {
  const { data } = await api.post('/api/auth/login', credentials);
  return data;
}

export async function registerUser(userData) {
  const { data } = await api.post('/api/auth/register', userData);
  return data;
}

// ==========================================
// Public Movie APIs
// ==========================================
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

export async function submitReview(movieId, payload) {
  const { data } = await api.post('/api/reviews', {
    movieId,
    rating: payload.rating,
    text: payload.text,
  });
  return data;
}

// ==========================================
// Admin APIs
// ==========================================
export async function getAdminMovies() {
  const { data } = await api.get('/api/admin/movies');
  return data.movies ?? [];
}

export async function createAdminMovie(movieData) {
  const { data } = await api.post('/api/admin/movies', movieData);
  return data;
}

export async function updateAdminMovie(id, movieData) {
  const { data } = await api.put(`/api/admin/movies/${id}`, movieData);
  return data;
}

export async function deleteAdminMovie(id) {
  const { data } = await api.delete(`/api/admin/movies/${id}`);
  return data;
}

export async function getAdminReviews() {
  const { data } = await api.get('/api/admin/reviews');
  return data.reviews ?? [];
}

export async function deleteAdminReview(id) {
  const { data } = await api.delete(`/api/admin/reviews/${id}`);
  return data;
}

export async function getAdminUsers() {
  const { data } = await api.get('/api/admin/users');
  return data.users ?? [];
}

export default api;
