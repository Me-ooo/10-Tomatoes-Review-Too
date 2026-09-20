import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard.jsx';
import { semanticSearch } from '../services/api.js';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function doSearch() {
      if (!query) {
        setMovies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const results = await semanticSearch(query);
        if (cancelled) return;
        setMovies(results || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to search movies. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doSearch();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Search Results
        </h1>
        <p className="mt-2 text-zinc-400">
          Showing semantic matches for: <span className="font-semibold text-white">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-zinc-500">Searching the universe...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-tomato/20 p-4 text-center text-tomato">
          {error}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
          No matches found for "{query}". Try another feeling!
        </div>
      )}
    </main>
  );
}
