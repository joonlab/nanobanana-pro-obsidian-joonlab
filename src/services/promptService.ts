import { requestUrl } from 'obsidian';
import {
  AIProvider,
  PromptGenerationResult,
  GenerationError,
  PROVIDER_CONFIGS,
  ImageStyle,
  PreferredLanguage,
  IMAGE_STYLES,
  LANGUAGE_NAMES
} from '../types';
import { SYSTEM_PROMPT } from '../settingsData';

// Enhanced user message template for high-quality prompt generation
const USER_MESSAGE_TEMPLATE = `## Task
Analyze the following content and generate a professional image generation prompt for a knowledge poster/infographic.

## Content to Visualize
---
{content}
---

## Style Preference
{style}

## Language Requirement
The poster should use {language} for any text elements (titles, labels, annotations).

## Analysis Instructions
1. First, identify the CORE CONCEPT - what is the single most important idea?
2. Extract 3-5 KEY SUPPORTING POINTS that explain or expand on the core concept
3. Identify any DATA, NUMBERS, or COMPARISONS that could be visualized
4. Consider what VISUAL METAPHORS could represent abstract ideas
5. Determine the optimal VISUAL HIERARCHY for the information

## Output
Generate a single, detailed, professional image generation prompt that will result in a gallery-worthy knowledge poster. The prompt should be comprehensive (200-400 words) and include specific visual, compositional, and stylistic details.

Remember: Generate ONLY the prompt, no explanations or preamble.`;

export class PromptService {
  /**
   * Generate an image prompt from note content using the specified AI provider
   */
  async generatePrompt(
    noteContent: string,
    provider: AIProvider,
    model: string,
    apiKey: string,
    style?: ImageStyle,
    language?: PreferredLanguage
  ): Promise<PromptGenerationResult> {
    if (!apiKey) {
      throw this.createError('INVALID_API_KEY', `${PROVIDER_CONFIGS[provider].name} API key is not configured`);
    }

    if (!noteContent.trim()) {
      throw this.createError('NO_CONTENT', 'Note content is empty');
    }

    // Prepare the enhanced user message
    const userMessage = this.buildUserMessage(noteContent, style, language);

    try {
      const prompt = await this.callProvider(provider, model, apiKey, userMessage);
      
      // Post-process and validate the generated prompt
      const cleanedPrompt = this.postProcessPrompt(prompt);
      
      return {
        prompt: cleanedPrompt,
        model,
        provider
      };
    } catch (error) {
      if ((error as GenerationError).type) {
        throw error;
      }
      throw this.handleApiError(error, provider);
    }
  }

  /**
   * Build an enhanced user message with style and language preferences
   */
  private buildUserMessage(
    content: string,
    style?: ImageStyle,
    language?: PreferredLanguage
  ): string {
    const styleDescription = style ? IMAGE_STYLES[style] : IMAGE_STYLES['infographic'];
    const languageName = language ? LANGUAGE_NAMES[language] : LANGUAGE_NAMES['en'];
    
    // Truncate content if too long (keep most relevant parts)
    const processedContent = this.preprocessContent(content);
    
    return USER_MESSAGE_TEMPLATE
      .replace('{content}', processedContent)
      .replace('{style}', styleDescription)
      .replace('{language}', languageName);
  }

  /**
   * Preprocess content to optimize for prompt generation
   */
  private preprocessContent(content: string): string {
    // Remove excessive whitespace
    let processed = content.replace(/\n{3,}/g, '\n\n').trim();
    
    // Remove markdown image links (they can't be visualized anyway)
    processed = processed.replace(/!\[.*?\]\(.*?\)/g, '');
    
    // Remove HTML comments
    processed = processed.replace(/<!--.*?-->/gs, '');
    
    // Limit content length to prevent token overflow (roughly 8000 chars for ~2000 tokens)
    if (processed.length > 8000) {
      // Keep first 6000 chars and last 2000 chars to preserve structure
      processed = processed.slice(0, 6000) + '\n\n[...content truncated...]\n\n' + processed.slice(-2000);
    }
    
    return processed;
  }

  /**
   * Post-process the generated prompt to ensure quality
   */
  private postProcessPrompt(prompt: string): string {
    // Remove common LLM preambles
    let cleaned = prompt
      .replace(/^(Here's|Here is|Below is|I've created|I have created)[^:]*:/i, '')
      .replace(/^(Sure|Certainly|Of course)[^:]*[.:]/i, '')
      .trim();
    
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
    
    // Ensure prompt starts with a strong visual directive
    if (!cleaned.match(/^(Create|Design|Generate|A |An |The )/i)) {
      cleaned = 'Create ' + cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }
    
    return cleaned.trim();
  }

  private async callProvider(
    provider: AIProvider,
    model: string,
    apiKey: string,
    userMessage: string
  ): Promise<string> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(model, apiKey, userMessage);
      case 'google':
        return this.callGoogle(model, apiKey, userMessage);
      case 'anthropic':
        return this.callAnthropic(model, apiKey, userMessage);
      case 'xai':
        return this.callXAI(model, apiKey, userMessage);
      default:
        throw this.createError('UNKNOWN', `Unknown provider: ${provider}`);
    }
  }

  private async callOpenAI(model: string, apiKey: string, userMessage: string): Promise<string> {
    const response = await requestUrl({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1500,
        temperature: 0.75
      })
    });

    if (response.status !== 200) {
      throw this.handleHttpError(response.status, response.text, 'openai');
    }

    const data = response.json;
    return data.choices[0]?.message?.content?.trim() || '';
  }

  private async callGoogle(model: string, apiKey: string, userMessage: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await requestUrl({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\n${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1500
        }
      })
    });

    if (response.status !== 200) {
      throw this.handleHttpError(response.status, response.text, 'google');
    }

    const data = response.json;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }

  private async callAnthropic(model: string, apiKey: string, userMessage: string): Promise<string> {
    const response = await requestUrl({
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (response.status !== 200) {
      throw this.handleHttpError(response.status, response.text, 'anthropic');
    }

    const data = response.json;
    return data.content?.[0]?.text?.trim() || '';
  }

  private async callXAI(model: string, apiKey: string, userMessage: string): Promise<string> {
    const response = await requestUrl({
      url: 'https://api.x.ai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1500,
        temperature: 0.75
      })
    });

    if (response.status !== 200) {
      throw this.handleHttpError(response.status, response.text, 'xai');
    }

    const data = response.json;
    return data.choices[0]?.message?.content?.trim() || '';
  }

  private handleHttpError(status: number, responseText: string, provider: AIProvider): GenerationError {
    if (status === 401 || status === 403) {
      return this.createError('INVALID_API_KEY', `Invalid ${PROVIDER_CONFIGS[provider].name} API key`);
    }
    if (status === 429) {
      return this.createError('RATE_LIMIT', 'API rate limit exceeded. Please wait and try again.', true);
    }
    if (status >= 500) {
      return this.createError('NETWORK_ERROR', 'Server error. Please try again later.', true);
    }
    return this.createError('GENERATION_FAILED', `API error: ${responseText}`);
  }

  private handleApiError(error: unknown, provider: AIProvider): GenerationError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('net::') || errorMessage.includes('network')) {
      return this.createError('NETWORK_ERROR', 'Network connection error. Check your internet connection.', true);
    }

    return this.createError('GENERATION_FAILED', `${PROVIDER_CONFIGS[provider].name} error: ${errorMessage}`);
  }

  private createError(type: GenerationError['type'], message: string, retryable = false): GenerationError {
    return { type, message, retryable };
  }
}
