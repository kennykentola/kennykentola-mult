import { TextProviderAdapter, GenerateTextParams } from './base';

export class XaiAdapter implements TextProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`xAI Grok Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
