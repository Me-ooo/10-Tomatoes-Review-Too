import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-white/10 bg-panel p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
      >
        <h1 className="font-display text-3xl text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sign in to rate films and keep your watchlist.
        </p>

        <label className="mt-6 block text-sm text-zinc-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-white outline-none focus:border-tomato/70"
            required
          />
        </label>

        <label className="mt-4 block text-sm text-zinc-300">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-white outline-none focus:border-tomato/70"
            required
          />
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-tomato py-2.5 text-sm font-semibold text-white hover:bg-tomato-dark"
        >
          Login
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          New here?{' '}
          <Link to="/register" className="text-white hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
