import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Link
      to={`/movies/${movie._id}`}
      className="group relative block overflow-hidden rounded-2xl bg-panel ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:ring-tomato/60"
    >
      <div className="aspect-2/3 overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gold">
          {movie.genres?.[0] ?? 'Film'}
        </p>
        <h3 className="mt-1 font-semibold text-white">{movie.title}</h3>
        <p className="mt-1 text-sm text-zinc-300">
          ★ {Number(movie.averageRating || 0).toFixed(1)}
          <span className="text-zinc-500">
            {' '}
            · {movie.releaseYear ?? ''}
          </span>
        </p>
      </div>
    </Link>
  );
}
