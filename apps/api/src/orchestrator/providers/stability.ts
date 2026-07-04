import { ImageProviderAdapter, GenerateImageParams } from './base';

export class StabilityAdapter implements ImageProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: GenerateImageParams): Promise<string> {
    // Stability AI SD3 API
    const formData = new FormData();
    formData.append('prompt', params.prompt);
    formData.append('output_format', 'png');

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'image/*'
      },
      body: formData as any
    });

    if (!response.ok) {
      throw new Error(`Stability AI Error: ${response.status} ${response.statusText}`);
    }

    // Stability API v2 returns the raw image bytes if Accept: image/* is set,
    // or JSON with base64 if Accept: application/json.
    // For simplicity, we can fetch JSON base64 and upload to Cloudinary or similar,
    // but the current orchestrator expects a URL returned. Let's assume we handle base64.
    // Actually, to keep it simple, we'll fetch JSON and construct a data URI.

    const jsonResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      },
      body: formData as any
    });

    if (!jsonResponse.ok) {
      throw new Error(`Stability AI Error: ${jsonResponse.status} ${jsonResponse.statusText}`);
    }

    const data = await jsonResponse.json();
    return `data:image/png;base64,${data.image}`;
  }
}
