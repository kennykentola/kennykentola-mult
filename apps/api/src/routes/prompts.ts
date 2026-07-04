import { Router, Request, Response } from 'express';
import { textManager } from './orchestrator';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';

const router = Router();
const dbId = 'multicompany';
const collectionId = 'ai_prompts';

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    // Generate prompt text
    const promptInstructions = `You are a world-class AI Prompt Engineer. Create an educational, high-quality coding prompt example about: ${topic}. 
Format your response exactly like this:
TITLE: [A short, catchy title for the prompt]
CATEGORY: [e.g., Debugging, Refactoring, Boilerplate, Explanation]
PROMPT_TEXT: [The actual prompt the user should copy/paste]
EXPLANATION: [A brief explanation of why this prompt is effective and what the AI will do]`;

    let rawResponse = '';
    try {
      const execResult = await textManager.execute<string>('generateText', { prompt: promptInstructions, maxTokens: 1000 });
      rawResponse = execResult.result;
    } catch (e: any) {
      console.warn('AI providers failed. Using fallback mock data.', e.message);
      rawResponse = `TITLE: Mock ${topic} Prompt
CATEGORY: General Coding
PROMPT_TEXT: I need help understanding ${topic}. Can you explain it simply and provide a short code example?
EXPLANATION: This is a fallback explanation because the AI providers are currently unavailable or missing API keys.`;
    }
    
    // Parse the response
    const titleMatch = rawResponse.match(/TITLE:\s*(.*)/i);
    const categoryMatch = rawResponse.match(/CATEGORY:\s*(.*)/i);
    const promptTextMatch = rawResponse.match(/PROMPT_TEXT:\s*(.*?)(?=EXPLANATION:|$)/is);
    const explanationMatch = rawResponse.match(/EXPLANATION:\s*(.*)/is);

    const title = titleMatch ? titleMatch[1].trim() : `${topic} Prompt`;
    const category = categoryMatch ? categoryMatch[1].trim() : 'General Coding';
    const promptText = promptTextMatch ? promptTextMatch[1].trim() : `Can you help me with ${topic}?`;
    const aiResponse = explanationMatch ? explanationMatch[1].trim() : rawResponse;

    // Save to Appwrite
    const savedPrompt = await databases.createDocument(
      dbId,
      collectionId,
      ID.unique(),
      {
        title,
        category,
        promptText,
        aiResponse,
        isPublished: true,
      }
    );

    res.json({ success: true, prompt: savedPrompt });
  } catch (error: any) {
    console.error('Error generating AI prompt:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
