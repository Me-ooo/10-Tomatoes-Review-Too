import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function TomatoMark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-tomato to-tomato-dark shadow-[0_0_24px_rgba(255,59,59,0.45)]">
      <span className="absolute -top-1 right-2 h-2 w-1.5 rotate-12 rounded-full bg-emerald-400" />
      <span className="font-display text-lg font-bold text-white">10</span>
    </span>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      navigate('/');
      return;
    }
    navigate(`/?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <TomatoMark />
          <div className="leading-tight">
            <p className="font-semibold tracking-wide text-white">10 Tomatoes</p>
            <p className="hidden text-[11px] uppercase tracking-[0.18em] text-zinc-400 sm:block">
              Review Too
            </p>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="relative mx-auto hidden min-w-0 flex-1 max-w-xl md:block">
          <label htmlFor="nav-search" className="sr-only">
            Semantic search
          </label>
          <input
            id="nav-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by feeling… “a sad sci-fi movie about space”"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-24 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-tomato/70 focus:bg-white/10"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            ⌕
          </span>
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-tomato px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-tomato-dark"
          >
            Search
          </button>
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-2">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-medium transition ${
                isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
              }`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-zinc-200"
          >
            Register
          </NavLink>
        </nav>
      </div>

      <form onSubmit={handleSearch} className="px-4 pb-3 md:hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type how you feel…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-tomato/70"
        />
      </form>
    </header>
  );
}
