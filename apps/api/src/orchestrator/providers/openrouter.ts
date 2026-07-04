import { TextProviderAdapter, GenerateTextParams } from './base';

export class OpenRouterAdapter implements TextProviderAdapter {
  private apiKey: string;
  private siteUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.siteUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': this.siteUrl
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Text Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
