import { TextProviderAdapter, GenerateTextParams } from './base';

export class OpenRouterAdapter implements TextProviderAdapter {
  private apiKey: string;
  private siteUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.siteUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const candidateModels = [
      'liquid/lfm-2.5-2.6b:free',
      'nvidia/nemotron-3.5-lightning:free',
      'dots-studio/dots-3-note-preview:free'
    ];

    let lastError: Error | null = null;
    for (const model of candidateModels) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.siteUrl
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: params.prompt }],
            max_tokens: params.maxTokens || 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        }

        const errText = await response.text();
        lastError = new Error(`OpenRouter ${model} failed: ${response.status} ${errText}`);
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('All OpenRouter models failed.');
  }
}
