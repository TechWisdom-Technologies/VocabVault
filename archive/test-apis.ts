
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@deepgram/sdk';
import fs from 'fs';

async function main() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await geminiFlash.generateContent('Hello');
    console.log('Gemini OK:', res.response.text());
  } catch (e: any) {
    console.log('Gemini Error:', e.message);
  }

  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    console.log('Deepgram Client Created');
  } catch(e: any) {
    console.log('Deepgram Error:', e.message);
  }
}
main();
