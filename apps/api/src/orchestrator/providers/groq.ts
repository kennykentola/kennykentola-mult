import { TextProviderAdapter, GenerateTextParams } from './base';

export class GroqAdapter implements TextProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const candidateModels = [
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ];

    let lastError: Error | null = null;
    for (const model of candidateModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: params.prompt }],
            max_tokens: params.maxTokens || 1000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        }

        const errText = await response.text();
        lastError = new Error(`Groq ${model} failed: ${response.status} ${errText}`);
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Groq models failed.');
  }
}
