import { TextProviderAdapter, ImageProviderAdapter, GenerateTextParams, GenerateImageParams } from './base';

export class OpenAIAdapter implements TextProviderAdapter, ImageProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI Text Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateImage(params: GenerateImageParams): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: params.prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI Image Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
  }
}
