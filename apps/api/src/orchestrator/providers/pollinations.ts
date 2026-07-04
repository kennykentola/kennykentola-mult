import { ImageProviderAdapter, GenerateImageParams } from './base';

export class PollinationsAdapter implements ImageProviderAdapter {
  constructor() {}

  async generateImage(params: GenerateImageParams): Promise<string> {
    // Pollinations AI takes a simple GET request and returns the image binary.
    // By returning this URL, the client can use it directly as an image src.
    // We add a random seed to prevent aggressive browser caching.
    const seed = Math.floor(Math.random() * 100000);
    const encodedPrompt = encodeURIComponent(params.prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    // We don't even need to fetch it here since the client just needs the URL!
    // But we could ping it just to make sure it's alive, or just return the URL directly.
    return imageUrl;
  }
}
