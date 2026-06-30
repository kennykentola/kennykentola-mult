import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// API Keys will be read from process.env inside the route handler

/**
 * AI Tutor Chat Endpoint with Triple-Redundancy Fallback
 */
router.post('/tutor', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Prepend system context to messages
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
      return res.status(200).json({ 
        content: data.choices[0].message.content,
        provider: 'groq'
      });
    } catch (err: any) {
      console.warn('[AI Tutor] Groq failed, falling back to OpenRouter...', err.message);
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
      return res.status(200).json({ 
        content: data.choices[0].message.content,
        provider: 'openrouter'
      });
    } catch (err: any) {
      console.warn('[AI Tutor] OpenRouter failed, falling back to Gemini/OpenAI...', err.message);
      lastError = err;
    }
  }

  // 3. Try Gemini/OpenAI (Tertiary Fallback) - using generic OpenAI compatible endpoint if applicable
  // For Gemini, we use the Google AI Studio endpoint.
  if (GEMINI_API_KEY) {
    try {
      // Convert to Gemini format
      const geminiMessages = apiMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      // Merge system prompt into first user message for simplicity if using older gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages
        })
      });
      if (!response.ok) throw new Error(`Gemini HTTP error! status: ${response.status}`);
      const data = await response.json();
      return res.status(200).json({
        content: data.candidates[0].content.parts[0].text,
        provider: 'gemini'
      });
    } catch (err: any) {
      console.error('[AI Tutor] Gemini failed...', err.message);
      lastError = err;
    }
  }

  return res.status(500).json({ 
    error: 'All AI providers failed or are not configured.',
    details: lastError?.message 
  });
});

export default router;
