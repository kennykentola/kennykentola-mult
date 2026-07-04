import { Router, Request, Response } from 'express';
import { RotationManager } from '../orchestrator/core/rotation';
import { OpenAIAdapter } from '../orchestrator/providers/openai';
import { GeminiAdapter } from '../orchestrator/providers/gemini';
import { StabilityAdapter } from '../orchestrator/providers/stability';
import { XaiAdapter } from '../orchestrator/providers/xai';
import { databases } from '../services/appwrite';
import { ID } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// In a real scenario, these would be populated from the database securely.
// For the initial build, we use environment variables.
const textManager = new RotationManager();
const imageManager = new RotationManager();

// Setup adapters
if (process.env.ORCH_OPENAI_API_KEY) {
  const openAiAdapter = new OpenAIAdapter(process.env.ORCH_OPENAI_API_KEY);
  textManager.addProvider('openai_text', 'OpenAI', 1, 10, openAiAdapter);
  imageManager.addProvider('openai_img', 'OpenAI DALL-E 3', 1, 5, openAiAdapter);
}

if (process.env.ORCH_GEMINI_API_KEY) {
  const geminiAdapter = new GeminiAdapter(process.env.ORCH_GEMINI_API_KEY);
  textManager.addProvider('gemini_text', 'Gemini', 2, 10, geminiAdapter);
}

if (process.env.ORCH_XAI_API_KEY) {
  const xaiAdapter = new XaiAdapter(process.env.ORCH_XAI_API_KEY);
  textManager.addProvider('grok_text', 'Grok', 3, 10, xaiAdapter);
}

if (process.env.ORCH_STABILITY_API_KEY) {
  const stabilityAdapter = new StabilityAdapter(process.env.ORCH_STABILITY_API_KEY);
  imageManager.addProvider('stability_img', 'Stability AI', 2, 10, stabilityAdapter);
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    // 1. Generate text via RotationManager
    const textPrompt = `Write a detailed, educational tech blog post explanation about: ${topic}. Format it nicely in Markdown.`;
    const textResult = await textManager.execute<string>('generateText', { prompt: textPrompt, maxTokens: 1500 });

    // 2. Generate image via RotationManager
    const imagePrompt = `A high quality, modern, flat vector illustration representing the technology topic: ${topic}. Vibrant colors, no text.`;
    const imageResult = await imageManager.execute<string>('generateImage', { prompt: imagePrompt });

    // 3. Save to Appwrite `ai_generated_assets` collection
    // We assume initAppwrite ran and 'ai_generated_assets' exists
    const dbId = 'kennykentolamult'; // Assuming from your main config
    const savedAsset = await databases.createDocument(
      dbId,
      'ai_generated_assets',
      ID.unique(),
      {
        imageUrl: imageResult.result,
        contentText: textResult.result,
        status: 'preview',
        providerUsed: `Text: ${textResult.providerUsed}, Image: ${imageResult.providerUsed}`,
        createdAt: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      asset: savedAsset
    });
  } catch (error: any) {
    console.error('[Orchestrator Generation Error]', error);
    res.status(500).json({ error: 'Generation failed', details: error.message });
  }
});

router.post('/post/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbId = 'kennykentolamult';
    
    // 1. Get the asset
    const asset = await databases.getDocument(dbId, 'ai_generated_assets', id) as any;
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // 2. Create actual blog post
    const blogPost = await databases.createDocument(
      dbId,
      'blog_posts', // Assuming this is your blog collection ID
      ID.unique(),
      {
        title: `Tech Insights: AI Generated`,
        content: asset.contentText,
        coverImage: asset.imageUrl,
        published: true,
        createdAt: new Date().toISOString()
      }
    );

    // 3. Mark asset as published
    await databases.updateDocument(dbId, 'ai_generated_assets', id, { status: 'published' });

    res.json({ success: true, blogPost });
  } catch (error: any) {
    console.error('[Orchestrator Post Error]', error);
    res.status(500).json({ error: 'Failed to post asset', details: error.message });
  }
});

router.delete('/asset/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbId = 'kennykentolamult';
    await databases.deleteDocument(dbId, 'ai_generated_assets', id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Orchestrator Delete Error]', error);
    res.status(500).json({ error: 'Failed to delete asset', details: error.message });
  }
});

export default router;
