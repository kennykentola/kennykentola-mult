import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = Router();

// Helper function to call AI providers with fallback
async function generateAIResponse(apiMessages: any[]) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  let lastError = null;

  // 1. Try Groq (Primary, ultra-fast)
  if (GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: apiMessages,
          temperature: 0.7,
        })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Groq HTTP error! status: ${response.status}, body: ${text}`);
      }
      const data = await response.json();
      return { 
        content: data.choices[0].message.content,
        provider: 'groq'
      };
    } catch (err: any) {
      console.warn('[AI] Groq failed, falling back to OpenRouter...', err.message);
      lastError = err;
    }
  }

  // 2. Try OpenRouter (Secondary)
  if (OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({
          model: 'google/gemma-2-9b-it:free',
          messages: apiMessages,
          temperature: 0.7,
        })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenRouter HTTP error! status: ${response.status}, body: ${text}`);
      }
      const data = await response.json();
      return { 
        content: data.choices[0].message.content,
        provider: 'openrouter'
      };
    } catch (err: any) {
      console.warn('[AI] OpenRouter failed, falling back to Gemini...', err.message);
      lastError = err;
    }
  }

  // 3. Try Gemini (Tertiary Fallback)
  if (GEMINI_API_KEY) {
    try {
      const geminiMessages = apiMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages
        })
      });
      if (!response.ok) throw new Error(`Gemini HTTP error! status: ${response.status}`);
      const data = await response.json();
      return {
        content: data.candidates[0].content.parts[0].text,
        provider: 'gemini'
      };
    } catch (err: any) {
      console.error('[AI] Gemini failed...', err.message);
      lastError = err;
    }
  }

  throw new Error(`All AI providers failed or are not configured. Details: ${lastError?.message}`);
}

/**
 * AI Tutor Chat Endpoint with Triple-Redundancy Fallback
 */
router.post('/tutor', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemPrompt = `You are a helpful and expert AI learning assistant for an online academy. 
Current Course Context: ${context || 'General programming and development'}. 
Provide concise, educational, and accurate answers.`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    const result = await generateAIResponse(apiMessages);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * AI Content Generation Endpoint for Blog and Newsletter
 */
router.post('/generate-content', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { topic, type, instructions } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    let systemPrompt = '';
    if (type === 'blog') {
      systemPrompt = `You are an expert copywriter and content creator. Write a compelling, high-quality blog post about the following topic.
Use markdown formatting where appropriate (headers, bold, lists). The tone should be engaging and professional.
${instructions ? `Additional instructions: ${instructions}` : ''}`;
    } else if (type === 'newsletter') {
      systemPrompt = `You are an expert email marketer and newsletter author. Write a compelling, engaging newsletter about the following topic.
IMPORTANT: You MUST output ONLY raw, clean HTML that is ready to be sent in an email body. Do not include markdown blocks like \`\`\`html. Use inline styles sparingly if needed, but standard HTML tags (<h1>, <p>, <ul>) are best. The tone should be engaging and professional.
${instructions ? `Additional instructions: ${instructions}` : ''}`;
    } else {
      return res.status(400).json({ error: 'Invalid content type. Must be "blog" or "newsletter".' });
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Topic: ${topic}` }
    ];

    const result = await generateAIResponse(apiMessages);
    
    // For newsletter, if the AI includes markdown code blocks, strip them out
    if (type === 'newsletter' && result.content.startsWith('```')) {
      result.content = result.content.replace(/^```(html)?/, '').replace(/```$/, '').trim();
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * AI Image Generation Endpoint (Admins only)
 * Uses Pollinations.ai (free, open source model)
 */
router.post('/generate-image', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    // Only allow Admins and Super Admins
    if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access denied. Image generation is restricted to administrators.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Use pollinations.ai for free AI image generation
    const encodedPrompt = encodeURIComponent(prompt);
    // Add seed and nologo parameter for a cleaner image
    const seed = Math.floor(Math.random() * 100000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;

    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to generate image. Status: ${response.status}`);
    }

    // Convert the image arrayBuffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary so we have a permanent URL
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'kennykentola/blog_ai',
      resource_type: 'image'
    });

    res.status(200).json({ success: true, url: result.secure_url });
  } catch (error: any) {
    console.error('[AI] Image generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

export default router;
