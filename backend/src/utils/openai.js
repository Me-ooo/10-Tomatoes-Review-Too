import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';

dotenv.config();

export async function generateEmbedding(text) {
  // Revert back to api-inference.huggingface.co to resolve "Model not supported by provider hf-inference" error
  const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';

  try {
    const response = await axios.post(
      url, 
      { inputs: text }, 
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        // Force IPv4 to resolve getaddrinfo ENOTFOUND on some environments
        httpsAgent: new https.Agent({ family: 4, keepAlive: true }),
        // Set timeout to 15 seconds to prevent hanging requests
        timeout: 15000 
      }
    );

    const result = response.data;

    // Convert multi-dimensional array to 1D Array if necessary
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0];
    }
    return result;

  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'EAI_AGAIN') {
      console.error(`Network error connecting to Hugging Face API: ${error.message}`);
      throw new Error('Network error: Unable to reach the Hugging Face API server. Please check your DNS or connection.');
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error(`Timeout error connecting to Hugging Face API: ${error.message}`);
      throw new Error('Timeout error: The API request took too long. The model might be loading.');
    } else {
      console.error(`Failed to connect to Hugging Face API: ${error.message}`);
      throw new Error(`Embedding generation failed: ${error.response?.data?.error || error.message}`);
    }
  }
}