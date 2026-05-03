
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  // Actually, there is no generic listModels in the new SDK easily accessible without REST, but let's try fetch
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
  const data = await res.json();
  console.log(data.models.map((m:any) => m.name).join('\n'));
}
main();
