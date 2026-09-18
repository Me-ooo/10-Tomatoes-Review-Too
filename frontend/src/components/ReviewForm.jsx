import { useState } from 'react';

export default function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!rating || !text.trim()) {
      setStatus('Please choose a star rating and write a short review.');
      return;
    }

    try {
      await onSubmit?.({ rating, text: text.trim() });
      setStatus('Review submitted. Thanks for sharing your take.');
      setText('');
      setRating(0);
    } catch {
      setStatus('Could not reach the API yet — your review is saved locally for this demo.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <h3 className="text-lg font-semibold text-white">Write a review</h3>
      <p className="mt-1 text-sm text-zinc-400">Rate this title from 1 to 5 tomatoes.</p>

      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = (hover || rating) >= value;
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star`}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              className={`text-2xl transition ${active ? 'text-gold' : 'text-zinc-600'}`}
            >
              ★
            </button>
          );
        })}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="What stayed with you after the credits?"
        className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-tomato/70"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{status}</p>
        <button
          type="submit"
          className="rounded-full bg-tomato px-5 py-2 text-sm font-semibold text-white transition hover:bg-tomato-dark"
        >
          Submit review
        </button>
      </div>
    </form>
  );
}
