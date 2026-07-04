export interface GenerateTextParams {
  prompt: string;
  maxTokens?: number;
}

export interface GenerateImageParams {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
}

export interface TextProviderAdapter {
  generateText(params: GenerateTextParams): Promise<string>;
}

export interface ImageProviderAdapter {
  generateImage(params: GenerateImageParams): Promise<string>; // returns image URL
}
