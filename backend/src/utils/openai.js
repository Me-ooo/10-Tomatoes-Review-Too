import dotenv from 'dotenv';
dotenv.config();

export async function generateEmbedding(text) {
  const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: text })
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('โมเดล Hugging Face กำลังโหลด (Cold Start) ให้รอประมาณ 10-20 วินาทีแล้วรันคำสั่งใหม่ครับ');
    }
    const errorText = await response.text();
    throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0];
  }
  return result;
}