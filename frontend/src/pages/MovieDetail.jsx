import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm.jsx';
import { getMovieById, submitReview, getMovieReviews } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function youtubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function MovieDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  async function loadReviews() {
    try {
      const data = await getMovieReviews(id);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getMovieById(id);
        if (!cancelled) setMovie(data);
        if (!cancelled) loadReviews();
      } catch {
        if (!cancelled) setMovie(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-zinc-400">
        Loading title…
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-white">Movie not found</h1>
        <Link to="/" className="mt-4 inline-block text-tomato hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  const embed = youtubeEmbedUrl(movie.trailerUrl);

  async function handleReview(payload) {
    if (!user) {
      throw new Error('Please login to submit a review');
    }
    await submitReview(movie._id, payload);
    await loadReviews();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <img
          src={movie.posterUrl || `https://via.placeholder.com/500x750/101014/FFFFFF?text=${encodeURIComponent(movie.title)}`}
          alt={movie.title}
          className="w-full rounded-2xl object-cover ring-1 ring-white/10"
        />
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold">
            {movie.releaseYear} · {movie.director}
          </p>
          <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
            {movie.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {(movie.genres ?? []).map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-zinc-300">{movie.synopsis}</p>
          <p className="mt-4 text-gold">
            ★ {Number(movie.averageRating || 0).toFixed(1)}
            <span className="text-zinc-500">
              {' '}
              · {movie.reviewCount ?? reviews.length} reviews
            </span>
          </p>
        </div>
      </div>

      {embed ? (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl text-white">Trailer</h2>
          <div className="aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10">
            <iframe
              title={`${movie.title} trailer`}
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {user ? (
          <ReviewForm onSubmit={handleReview} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="font-display text-xl text-white">Join the conversation</h3>
            <p className="mt-2 text-zinc-400">Please sign in to write a review.</p>
            <Link to="/login" className="mt-4 inline-block rounded-full bg-tomato px-6 py-2 text-sm font-semibold text-white transition hover:bg-tomato-dark">
              Login
            </Link>
          </div>
        )}
        
        <div>
          <h2 className="font-display text-2xl text-white">Community takes</h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">
              Be the first to rate this title.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {reviews.map((review) => (
                <li
                  key={review._id || Math.random()}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm text-gold">
                    {'★'.repeat(review.rating)}
                    <span className="ml-2 text-zinc-400">{review.user?.username || 'Anonymous'}</span>
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">{review.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
