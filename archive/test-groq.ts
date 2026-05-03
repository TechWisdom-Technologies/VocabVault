import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Groq from 'groq-sdk';

async function main() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in JSON format { "msg": "hello" }' }],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });
    console.log('SUCCESS:', chatCompletion.choices[0]?.message?.content);
  } catch (err: any) {
    console.log('ERROR:', err.message);
  }
}
main();
