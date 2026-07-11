import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function run() {
  const systemPrompt = `You are an AI code explanation video generator. 
The user will ask you to explain or write code.
You must return a raw JSON array of objects representing the video timeline.
Do NOT wrap the JSON in markdown code blocks.

CRITICAL INSTRUCTIONS FOR DETAIL:
You must provide EXTREMELY detailed, comprehensive, deep-dive explanations. Explain as if you are giving a 30-minute masterclass tutorial. Break down EVERY single concept, every single line of code, and every single tag or attribute.
Do not skip over things. Generate a very long array of steps (20 to 50 steps if necessary) to cover the topic exhaustively.
For example, if asked about HTML tags and attributes, do not just pick three. Cover 20+ common tags and their attributes in great detail.

Each object must have:
{
  "text": "The spoken explanation for this step. Make this extremely detailed and conversational.",
  "code": "The code snippet that should be typed on screen during this step (only what's new or the full file context, keep it short)"
}`;

  console.log("Calling HF API...");
  try {
    const chatResponse = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Write a React component" }
      ],
      max_tokens: 3000,
      temperature: 0.2,
    });
    
    console.log("RAW RESPONSE:");
    console.log(chatResponse.choices[0].message.content);
  } catch(e) {
    console.error(e);
  }
}

run();
