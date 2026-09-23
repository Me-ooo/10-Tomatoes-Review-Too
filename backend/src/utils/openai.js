import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

export async function generateEmbedding(text, isQuery = false) {
  try {
    const formattedText = (isQuery ? 'query: ' : 'passage: ') + text;
    const result = await hf.featureExtraction({
      model: 'intfloat/multilingual-e5-small',
      inputs: formattedText,
    });

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