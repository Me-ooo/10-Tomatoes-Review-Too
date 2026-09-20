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
      httpsAgent: new https.Agent({ family: 4 }),
      timeout: 10000 // เพิ่ม Timeout 10 วินาที
    });

    const result = response.data;

    // แปลงผลลัพธ์ให้เป็น 1D Array
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0];
    }
    return result;

  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(`Network error connecting to Hugging Face API: ${error.message}`);
      throw new Error('Network error: Unable to reach the API server.');
    } else if (error.code === 'ECONNABORTED') {
      console.error(`Timeout error connecting to Hugging Face API: ${error.message}`);
      throw new Error('Timeout error: The API request took too long.');
    } else {
      console.error(`Failed to connect to Hugging Face API: ${error.message}`);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }
}