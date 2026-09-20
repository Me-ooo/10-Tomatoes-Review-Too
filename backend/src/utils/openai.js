import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';

dotenv.config();

export async function generateEmbedding(text) {
  const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

  try {
    const response = await axios.post(url, { inputs: text }, {
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      // บังคับใช้ IPv4 แก้บั๊ก getaddrinfo ENOTFOUND บน Windows
      httpsAgent: new https.Agent({ family: 4 })
    });

    const result = response.data;

    // แปลงผลลัพธ์ให้เป็น 1D Array
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0];
    }
    return result;

  } catch (error) {
    console.error(`Failed to connect to Hugging Face API: ${error.message}`);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}