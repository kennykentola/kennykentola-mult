import { GeminiAdapter } from './src/orchestrator/providers/gemini';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
  const key = process.env.ORCH_GEMINI_API_KEY;
  if (!key) {
    console.log('No key found in .env');
    return;
  }
  console.log('Key starts with:', key.substring(0, 10));
  const adapter = new GeminiAdapter(key);
  try {
    const res = await adapter.generateText({ prompt: 'Hello', maxTokens: 10 });
    console.log('Success:', res);
  } catch (err: any) {
    console.error('Failed:', err.message);
  }
}

test();
