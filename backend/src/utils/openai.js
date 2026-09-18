export const generateEmbedding = async (text) => {
  try {
    const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error(`Hugging Face API Error (503): The model is currently loading/cold starting. Please try again in a few moments.`);
      }
      const errorText = await response.text();
      throw new Error(`Hugging Face API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // The API usually returns a 1D array, but could sometimes return a nested array depending on input format.
    // Flatten it to a 1D array if necessary.
    let embedding = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
    
    if (!Array.isArray(embedding)) {
      throw new Error('Unexpected response format from Hugging Face API');
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};
