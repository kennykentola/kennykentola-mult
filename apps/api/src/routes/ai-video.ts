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

CRITICAL INSTRUCTIONS FOR DETAIL:
You must provide EXTREMELY detailed explanations. Break down EVERY concept and every line of code.
Do not skip over things. Generate a long array of steps to cover the topic exhaustively.
CRITICAL: The "code" field MUST NOT BE EMPTY in any step. Even if you are just explaining a concept, write bullet points, pseudo-code, or visual notes in the "code" field so the screen is never blank.

Each object must have:
{
  "text": "The spoken explanation for this step.",
  "code": "The code snippet or visual text to show on screen. MUST NOT BE EMPTY. Do not use markdown backticks like \`\`\` around the code."
}`;

    const chatResponse = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct", // excellent coding model with fast free API
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 3000,
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
      // If the model hits the max_tokens limit, it might truncate the JSON array.
      // We can try to salvage it by finding the last valid closing brace and appending a bracket.
      const lastBraceIndex = scriptRaw.lastIndexOf('}');
      if (lastBraceIndex !== -1) {
        try {
          const salvaged = scriptRaw.substring(0, lastBraceIndex + 1) + ']';
          scriptData = JSON.parse(salvaged);
        } catch (e2) {
          console.error('Failed to parse and salvage HF script JSON:', scriptRaw);
          return res.status(500).json({ error: 'Failed to generate valid script format. The code might be too long to explain in one video.' });
        }
      } else {
        console.error('Failed to parse HF script JSON:', scriptRaw);
        return res.status(500).json({ error: 'Failed to generate valid script format.' });
      }
    }

    // Clean up markdown inside the code field of each step
    scriptData = scriptData.map((step: any) => {
      let cleanedCode = step.code || '';
      // Remove ```javascript, ```typescript, ```, etc.
      cleanedCode = cleanedCode.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '').trim();
      return {
        ...step,
        code: cleanedCode || '// Explaining concept...' // Ensure it's never completely blank
      };
    });

    // Combine all text for the voiceover
    const fullText = scriptData.map((step: any) => step.text).join('. ');

    // 2. Generate Audio (TTS)
    // The HF serverless API frequently unloads TTS models if not used. 
    // We will attempt to generate audio, but if it fails, we will gracefully degrade.
    let audioBase64 = null;
    try {
      const audioBlob = await hf.textToSpeech({
        model: "suno/bark-small",
        inputs: fullText,
      });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      audioBase64 = `data:audio/wav;base64,${buffer.toString('base64')}`;
    } catch (ttsError) {
      console.warn('[AIVideo] TTS Generation failed, falling back to browser synthesis:', ttsError);
      // We don't throw, we just proceed without audioBase64
    }

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
