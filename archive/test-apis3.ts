
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await geminiFlash.generateContent('Evaluate my speech: Hello.');
    console.log('Gemini OK:', res.response.text());
  } catch(e: any) {
    console.log('Gemini Error Thrown:', e.message);
  }
}
main();
