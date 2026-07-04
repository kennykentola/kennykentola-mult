import { TextProviderAdapter, GenerateTextParams } from './base';

export class GeminiAdapter implements TextProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: params.prompt }]
        }],
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Text Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
