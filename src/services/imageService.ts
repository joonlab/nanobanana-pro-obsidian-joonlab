import { requestUrl } from 'obsidian';
import { ImageGenerationResult, GenerationError, ImageStyle, PreferredLanguage, ImageQuality, IMAGE_STYLES, LANGUAGE_NAMES } from '../types';
import { IMAGE_GENERATION_PROMPT_TEMPLATE } from '../settingsData';

// Aspect ratio to imageConfig mapping
const ASPECT_RATIO_CONFIG: Record<ImageStyle, string> = {
  infographic: '2:3',   // Vertical infographic
  poster: '2:3',        // Vertical poster
  diagram: '4:3',       // Slightly wide diagram
  mindmap: '1:1',       // Square mindmap
  timeline: '16:9'      // Wide timeline
};

export class ImageService {
  /**
   * Generate an infographic image using Google Gemini
   */
  async generateImage(
    prompt: string,
    apiKey: string,
    model: string,
    style: ImageStyle,
    preferredLanguage: PreferredLanguage,
    quality: ImageQuality = 'high'
  ): Promise<ImageGenerationResult> {
    if (!apiKey) {
      throw this.createError('INVALID_API_KEY', 'Google API key is not configured');
    }

    if (!prompt.trim()) {
      throw this.createError('NO_CONTENT', 'Prompt is empty');
    }

    try {
      // Language instruction mapping
      const languageInstructions: Record<PreferredLanguage, string> = {
        ko: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in Korean (한국어). This includes the main title, all headings, labels, annotations, descriptions, and any other text elements. Do NOT use English or any other language for any text.',
        en: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in English. This includes the main title, all headings, labels, annotations, descriptions, and any other text elements.',
        ja: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in Japanese (日本語). This includes the main title, all headings, labels, annotations, descriptions, and any other text elements. Do NOT use English or any other language for any text.',
        zh: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in Chinese (中文). This includes the main title, all headings, labels, annotations, descriptions, and any other text elements. Do NOT use English or any other language for any text.',
        es: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in Spanish (Español). This includes the main title, all headings, labels, annotations, descriptions, and any other text elements. Do NOT use English or any other language for any text.',
        fr: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in French (Français). This includes the main title, all headings, labels, annotations, descriptions, and any other text elements. Do NOT use English or any other language for any text.',
        de: 'CRITICAL LANGUAGE REQUIREMENT: ALL visible text in the image MUST be written in German (Deutsch). This includes the main title, all headings, labels, annotations, descriptions, and any other text elements. Do NOT use English or any other language for any text.'
      };

      // Determine image size based on quality
      const imageSizeMap: Record<ImageQuality, string> = {
        standard: '1K',   // 1024px
        high: '2K',       // 2048px  
        ultra: '4K'       // 4096px (Gemini 3 Pro only)
      };

      // Get aspect ratio based on style
      const aspectRatio = ASPECT_RATIO_CONFIG[style];
      const imageSize = imageSizeMap[quality];

      // Format the prompt with style and language
      const fullPrompt = IMAGE_GENERATION_PROMPT_TEMPLATE
        .replace('{style}', IMAGE_STYLES[style])
        .replace('{prompt}', prompt) + '\n\n' + languageInstructions[preferredLanguage];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Build generation config with proper image settings
      const generationConfig: any = {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: aspectRatio
        }
      };

      // Add imageSize for Gemini 3 Pro models (supports 2K, 4K)
      if (model.includes('gemini-3') || model.includes('gemini-2.5')) {
        generationConfig.imageConfig.imageSize = imageSize;
      }

      console.log('Image generation config:', JSON.stringify(generationConfig, null, 2));

      const response = await requestUrl({
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig
        })
      });

      if (response.status !== 200) {
        throw this.handleHttpError(response.status, response.text);
      }

      const data = response.json;

      // Extract image from response
      const imageData = this.extractImageFromResponse(data);

      if (!imageData) {
        throw this.createError('GENERATION_FAILED', 'No image was generated. Try a different prompt or style.');
      }

      return {
        imageData: imageData.data,
        mimeType: imageData.mimeType,
        model
      };
    } catch (error) {
      if ((error as GenerationError).type) {
        throw error;
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * Extract base64 image data from Gemini API response
   */
  private extractImageFromResponse(data: any): { data: string; mimeType: string } | null {
    try {
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        return null;
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        return null;
      }

      // Look for inline_data (image) in parts
      for (const part of content.parts) {
        if (part.inline_data) {
          return {
            data: part.inline_data.data,
            mimeType: part.inline_data.mime_type || 'image/png'
          };
        }
      }

      // Check for image in different response format
      if (content.parts[0]?.inlineData) {
        return {
          data: content.parts[0].inlineData.data,
          mimeType: content.parts[0].inlineData.mimeType || 'image/png'
        };
      }

      return null;
    } catch (e) {
      console.error('Error extracting image from response:', e);
      return null;
    }
  }

  private handleHttpError(status: number, responseText: string): GenerationError {
    if (status === 401 || status === 403) {
      return this.createError('INVALID_API_KEY', 'Invalid Google API key');
    }
    if (status === 429) {
      return this.createError('RATE_LIMIT', 'API rate limit exceeded. Please wait and try again.', true);
    }
    if (status === 400) {
      // Check for content filtering
      if (responseText.includes('SAFETY') || responseText.includes('blocked')) {
        return this.createError('CONTENT_FILTERED', 'Content was blocked by safety filters. Try modifying your prompt.');
      }
      return this.createError('GENERATION_FAILED', `Bad request: ${responseText}`);
    }
    if (status >= 500) {
      return this.createError('NETWORK_ERROR', 'Server error. Please try again later.', true);
    }
    return this.createError('GENERATION_FAILED', `API error (${status}): ${responseText}`);
  }

  private handleApiError(error: unknown): GenerationError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('net::') || errorMessage.includes('network')) {
      return this.createError('NETWORK_ERROR', 'Network connection error. Check your internet connection.', true);
    }

    return this.createError('GENERATION_FAILED', `Image generation error: ${errorMessage}`);
  }

  private createError(type: GenerationError['type'], message: string, retryable = false): GenerationError {
    return { type, message, retryable };
  }
}
