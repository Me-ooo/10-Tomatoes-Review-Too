import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-white/10 bg-panel p-8"
      >
        <h1 className="font-display text-3xl text-white">Join the community</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Users can review. Admins can manage the catalog.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-tomato/20 p-3 text-sm text-tomato">
            {error}
          </div>
        )}

        <label className="mt-6 block text-sm text-zinc-300">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-white outline-none focus:border-tomato/70"
            required
          />
        </label>

        <label className="mt-4 block text-sm text-zinc-300">
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
            minLength={8}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-white outline-none focus:border-tomato/70"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
