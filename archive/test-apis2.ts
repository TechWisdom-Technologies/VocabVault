
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@deepgram/sdk';
import fs from 'fs';

async function main() {
  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    const buf = Buffer.alloc(10);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(buf, { model: 'nova-2' });
    console.log('Deepgram result:', result ? 'Success' : 'Failed', error);
  } catch(e: any) {
    console.log('Deepgram Error Thrown:', e.message);
  }
}
main();
