import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard.jsx';
import { getMovies } from '../services/api.js';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moodQuery = searchParams.get('q') ?? '';

  const [heroQuery, setHeroQuery] = useState(moodQuery);
  const [movies, setMovies] = useState([]);
  const [cacheSource, setCacheSource] = useState('mongodb');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setHeroQuery(moodQuery);
  }, [moodQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      setLoading(true);
      setError('');
      try {
        const result = await getMovies();
        if (cancelled) return;
        setMovies(result.movies);
        setCacheSource(result.source);
      } catch {
        if (!cancelled) {
          setMovies([]);
          setError('Could not load movies. Start the backend, then refresh.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleMovies = useMemo(() => {
    if (!moodQuery) return movies;
    const tokens = moodQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2 && !['the', 'and', 'for', 'about', 'like', 'movie', 'film'].includes(token));

    if (tokens.length === 0) return movies;

    return movies.filter((movie) => {
      const haystack = [movie.title, movie.synopsis, ...(movie.genres ?? [])]
        .join(' ')
        .toLowerCase();
      return tokens.some((token) => haystack.includes(token));
    });
  }, [movies, moodQuery]);

  function handleHeroSearch(event) {
    event.preventDefault();
    const q = heroQuery.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  }

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,59,59,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,197,24,0.08),transparent_28%),linear-gradient(180deg,#070708_0%,#101014_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-6 md:pt-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-tomato" />
            Semantic vector search
          </p>
          <h1 className="max-w-4xl font-display text-4xl leading-tight text-white md:text-6xl">
            Find a film for how you{' '}
            <span className="italic text-tomato">feel</span>, not just what it’s called.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-zinc-400 md:text-lg">
            Describe a mood, a memory, or a scene. We turn your words into embeddings and match them against our movie collection in MongoDB Atlas.
          </p>

          <form
            onSubmit={handleHeroSearch}
            className="mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center"
          >
            <input
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Type how you feel... like 'a sad sci-fi movie about space'"
              className="flex-1 rounded-xl bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-tomato px-6 py-3 text-sm font-semibold text-white transition hover:bg-tomato-dark"
            >
              Search by feeling
            </button>
          </form>

          {moodQuery ? (
            <p className="mt-4 text-sm text-zinc-400">
              Showing matches for{' '}
              <span className="text-white">“{moodQuery}”</span>
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-white">Trending movies</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Loaded from MongoDB via GET /api/movies.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            cache: {loading ? 'loading' : cacheSource}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-2/3 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-zinc-400">
            {error}
          </p>
        ) : visibleMovies.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-zinc-400">
            {moodQuery
              ? 'No titles matched that mood yet. Try another feeling.'
              : 'No movies in the database yet. Run npm run seed in backend.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {visibleMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
