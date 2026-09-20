import dotenv from 'dotenv';

dotenv.config();

export async function generateEmbedding(text) {
  const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';

  try {
    // Native fetch uses the global Node.js fetch which handles DNS resolution better on platforms like Render
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      throw new Error(`API returned status ${response.status}: ${errorDetails}`);
    }

    const result = await response.json();

    // Convert multi-dimensional array to 1D Array if necessary
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0];
    }
    return result;

  } catch (error) {
    console.error(`Failed to connect to Hugging Face API or generate embedding: ${error.message}`);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}