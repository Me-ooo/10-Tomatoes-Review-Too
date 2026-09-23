const MODEL =
  process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
const EXPECTED_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS || 384);

function getHuggingFaceToken() {
  return process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '';
}

function meanPool(tokenVectors) {
  const dimensions = tokenVectors[0].length;
  const sums = new Array(dimensions).fill(0);

  for (const token of tokenVectors) {
    for (let i = 0; i < dimensions; i += 1) {
      sums[i] += token[i];
    }
  }

  return sums.map((value) => value / tokenVectors.length);
}

function toSentenceVector(payload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('Hugging Face returned an empty embedding');
  }

  if (typeof payload[0] === 'number') {
    return payload;
  }

  if (Array.isArray(payload[0]) && typeof payload[0][0] === 'number') {
    return meanPool(payload);
  }

  if (Array.isArray(payload[0]) && Array.isArray(payload[0][0])) {
    return meanPool(payload[0]);
  }

  throw new Error('Hugging Face returned an unexpected embedding shape');
}

async function embedText(text) {
  const input = String(text || '').trim();

  if (!input) {
    throw new Error('Cannot embed empty text');
  }

  const token = getHuggingFaceToken();

  if (!token) {
    throw new Error('HF_TOKEN is not set');
  }

  const url = `https://router.huggingface.co/hf-inference/models/${MODEL}/pipeline/feature-extraction`;
  let response;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: input,
        normalize: true,
      }),
    });

    if (response.status !== 503) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Hugging Face embedding failed (${response.status}): ${detail}`);
  }

  const vector = toSentenceVector(await response.json());

  if (vector.length !== EXPECTED_DIMENSIONS) {
    throw new Error(
      `Expected a ${EXPECTED_DIMENSIONS}-dimension embedding, received ${vector.length}`
    );
  }

  return vector;
}

function movieEmbeddingText(movie) {
  const genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : '';
  return `${movie.title}. Genres: ${genres}. ${movie.synopsis}`;
}

module.exports = {
  embedText,
  movieEmbeddingText,
  EXPECTED_DIMENSIONS,
};
