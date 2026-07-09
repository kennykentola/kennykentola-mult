import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { HfInference } from '@huggingface/inference';

const router = Router();

// Endpoint to generate video script and TTS audio
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // 1. Generate Script (Code + Explanation) using a fast LLM on HF
    // We prompt the model to return a JSON array of events.
    const systemPrompt = `You are an AI code explanation video generator. 
The user will ask you to explain or write code.
You must return a raw JSON array of objects representing the video timeline.
Do NOT wrap the JSON in markdown code blocks.
Each object must have:
{
  "text": "The spoken explanation for this step",
  "code": "The code snippet that should be typed on screen during this step (only what's new or the full file context, keep it short)"
}`;

    const chatResponse = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct", // excellent coding model with fast free API
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.2,
    });

    let scriptRaw = chatResponse.choices[0].message.content || '[]';
    // Clean up potential markdown formatting
    scriptRaw = scriptRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let scriptData;
    try {
      scriptData = JSON.parse(scriptRaw);
      if (!Array.isArray(scriptData)) {
        scriptData = [scriptData];
      }
    } catch (e) {
      console.error('Failed to parse HF script JSON:', scriptRaw);
      return res.status(500).json({ error: 'Failed to generate valid script format.' });
    }

    // Combine all text for the voiceover
    const fullText = scriptData.map(step => step.text).join('. ');

    // 2. Generate Audio (TTS)
    // We use a high quality open source English TTS model available on the free serverless tier
    const audioBlob = await hf.textToSpeech({
      model: "espnet/kan-bayashi_ljspeech_vits",
      inputs: fullText,
    });

    // Convert the audio Blob to a base64 string to send to the frontend
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioBase64 = `data:audio/wav;base64,${buffer.toString('base64')}`;

    return res.json({
      script: scriptData,
      audioBase64
    });

  } catch (error: any) {
    console.error('[AIVideo] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
