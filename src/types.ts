// Provider types
export type AIProvider = 'openai' | 'google' | 'anthropic' | 'xai';

export type ImageStyle = 'infographic' | 'poster' | 'diagram' | 'mindmap' | 'timeline';

export type PreferredLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de';

// Plugin settings interface
export interface NanoBananaSettings {
  // API Keys
  googleApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  xaiApiKey: string;

  // Prompt Generation
  selectedProvider: AIProvider;
  promptModel: string;

  // Image Generation
  imageModel: string;
  imageStyle: ImageStyle;
  preferredLanguage: PreferredLanguage;

  // UX Settings
  showPreviewBeforeGeneration: boolean;
  attachmentFolder: string;
  autoRetryCount: number;
  showProgressModal: boolean;

  // Advanced
  customPromptPrefix: string;
}

// Progress states
export type ProgressStep =
  | 'analyzing'
  | 'generating-prompt'
  | 'preview'
  | 'generating-image'
  | 'saving'
  | 'embedding'
  | 'complete'
  | 'error';

export interface ProgressState {
  step: ProgressStep;
  progress: number;
  message: string;
  details?: string;
}

// Error types
export type ErrorType =
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'GENERATION_FAILED'
  | 'CONTENT_FILTERED'
  | 'NO_CONTENT'
  | 'SAVE_ERROR'
  | 'UNKNOWN';

export interface GenerationError {
  type: ErrorType;
  message: string;
  details?: string;
  retryable: boolean;
}

// API Response types
export interface PromptGenerationResult {
  prompt: string;
  model: string;
  provider: AIProvider;
}

export interface ImageGenerationResult {
  imageData: string; // base64
  mimeType: string;
  model: string;
}

export interface GenerationResult {
  success: boolean;
  imagePath?: string;
  error?: GenerationError;
}

// Model tier information for UI display
export type ModelTier = 'flagship' | 'balanced' | 'fast' | 'vision';

export interface ModelInfo {
  id: string;
  name: string;
  tier: ModelTier;
  description: string;
  contextWindow?: number;
  supportsVision?: boolean;
}

// Provider configurations
export interface ProviderConfig {
  name: string;
  endpoint: string;
  defaultModel: string;
  models: ModelInfo[];
}

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-5.1',
    models: [
      {
        id: 'gpt-5.1',
        name: 'GPT-5.1',
        tier: 'flagship',
        description: 'Latest flagship with advanced reasoning and coding tools',
        contextWindow: 400000,
        supportsVision: true
      },
      {
        id: 'gpt-5-pro',
        name: 'GPT-5 Pro',
        tier: 'flagship',
        description: 'Highest reasoning level for complex analysis',
        contextWindow: 400000,
        supportsVision: true
      },
      {
        id: 'gpt-5-mini',
        name: 'GPT-5 Mini',
        tier: 'balanced',
        description: 'Cost-optimized reasoning and chat',
        contextWindow: 400000,
        supportsVision: true
      },
      {
        id: 'gpt-5-nano',
        name: 'GPT-5 Nano',
        tier: 'fast',
        description: 'High-throughput, simple instruction-following',
        contextWindow: 400000
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        tier: 'balanced',
        description: 'Reliable multimodal model with vision',
        contextWindow: 128000,
        supportsVision: true
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        tier: 'fast',
        description: 'Fast and cost-effective for simpler tasks',
        contextWindow: 128000,
        supportsVision: true
      },
      {
        id: 'o3-mini',
        name: 'o3 Mini',
        tier: 'balanced',
        description: 'Fast reasoning model for STEM tasks',
        contextWindow: 200000
      }
    ]
  },
  google: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash',
    models: [
      {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro',
        tier: 'flagship',
        description: 'Most powerful agentic model with rich visuals',
        contextWindow: 1048576,
        supportsVision: true
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        tier: 'flagship',
        description: 'Full-featured with thinking and code execution',
        contextWindow: 1048576,
        supportsVision: true
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        tier: 'balanced',
        description: 'Best price-performance ratio with thinking',
        contextWindow: 1048576,
        supportsVision: true
      },
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash-Lite',
        tier: 'fast',
        description: 'Fastest and most cost-effective option',
        contextWindow: 1048576,
        supportsVision: true
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        tier: 'fast',
        description: 'Stable fast model for production',
        contextWindow: 1048576,
        supportsVision: true
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        tier: 'balanced',
        description: 'Ultra long context (2M tokens)',
        contextWindow: 2097152,
        supportsVision: true
      }
    ]
  },
  anthropic: {
    name: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-5-20250929',
    models: [
      {
        id: 'claude-opus-4-5-20251101',
        name: 'Claude 4.5 Opus',
        tier: 'flagship',
        description: 'Most powerful Claude ever, superior reasoning',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude 4.5 Sonnet',
        tier: 'flagship',
        description: 'Best balance of power and speed',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        tier: 'balanced',
        description: 'Excellent for complex tasks',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        tier: 'balanced',
        description: 'Reliable balance of speed and intelligence',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        tier: 'balanced',
        description: 'Powerful for complex analysis',
        contextWindow: 200000,
        supportsVision: true
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        tier: 'fast',
        description: 'Fastest Claude, great for simple tasks',
        contextWindow: 200000,
        supportsVision: true
      }
    ]
  },
  xai: {
    name: 'xAI Grok',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    defaultModel: 'grok-4-1-fast',
    models: [
      {
        id: 'grok-4-1-fast',
        name: 'Grok 4.1 Fast',
        tier: 'flagship',
        description: 'Latest multimodal with function calling, 2M context',
        contextWindow: 2000000
      },
      {
        id: 'grok-4-0709',
        name: 'Grok 4',
        tier: 'flagship',
        description: 'Powerful reasoning model with structured outputs',
        contextWindow: 256000
      },
      {
        id: 'grok-3',
        name: 'Grok 3',
        tier: 'balanced',
        description: 'Capable model with function calling',
        contextWindow: 131072
      },
      {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        tier: 'balanced',
        description: 'Cost-effective with reasoning',
        contextWindow: 131072
      },
      {
        id: 'grok-code-fast-1',
        name: 'Grok Code Fast',
        tier: 'fast',
        description: 'Optimized for coding tasks',
        contextWindow: 256000
      },
      {
        id: 'grok-2-vision-1212',
        name: 'Grok 2 Vision',
        tier: 'vision',
        description: 'Vision-enabled for image understanding',
        contextWindow: 32768,
        supportsVision: true
      }
    ]
  }
};

// Helper function to get model IDs for a provider
export function getModelIds(provider: AIProvider): string[] {
  return PROVIDER_CONFIGS[provider].models.map(m => m.id);
}

// Helper function to get model info by ID
export function getModelInfo(provider: AIProvider, modelId: string): ModelInfo | undefined {
  return PROVIDER_CONFIGS[provider].models.find(m => m.id === modelId);
}

export const IMAGE_STYLES: Record<ImageStyle, string> = {
  infographic: `Modern data-driven infographic style:
- Clean geometric shapes and data visualization elements
- Icon-based explanations with connecting lines
- Statistical charts, graphs, and comparison tables
- Flat design with strategic 3D accents
- Bold section dividers and visual categorization
- Number callouts and percentage indicators
- Professional corporate aesthetic with editorial polish`,

  poster: `Bold editorial poster design:
- Dramatic typography as the primary visual element
- High-contrast color blocking
- Powerful central imagery or abstract visualization
- Magazine-quality layout and composition
- Artistic negative space utilization
- Statement-making visual hierarchy
- Museum exhibition-worthy aesthetic`,

  diagram: `Technical explanatory diagram style:
- Clean flowchart and process visualization
- Annotated components with leader lines
- Isometric or orthographic projections where applicable
- Blueprint/schematic aesthetic with modern refinement
- Step-by-step visual sequences
- Cross-sections and exploded views
- Engineering precision with design elegance`,

  mindmap: `Organic mind map visualization:
- Central concept with radiating branches
- Organic, flowing connection lines
- Hierarchical node sizing based on importance
- Color-coded categories and groupings
- Illustrated icons at key nodes
- Natural growth pattern aesthetic
- Brain-friendly visual organization`,

  timeline: `Elegant chronological timeline design:
- Horizontal or vertical progression axis
- Milestone markers with visual distinction
- Period/era color coding
- Event illustrations or icons
- Clear date/time annotations
- Historical document aesthetic with modern clarity
- Museum exhibition panel quality`
};

export const LANGUAGE_NAMES: Record<PreferredLanguage, string> = {
  ko: '한국어 (Korean)',
  en: 'English',
  ja: '日本語 (Japanese)',
  zh: '中文 (Chinese)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  de: 'Deutsch (German)'
};
