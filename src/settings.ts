import { App, PluginSettingTab, Setting } from 'obsidian';
import NanoBananaPlugin from './main';
import { AIProvider, ImageStyle, PreferredLanguage, ImageQuality, PROVIDER_CONFIGS, IMAGE_STYLES, LANGUAGE_NAMES, QUALITY_LABELS, ModelInfo, getModelInfo } from './types';

export class NanoBananaSettingTab extends PluginSettingTab {
  plugin: NanoBananaPlugin;

  constructor(app: App, plugin: NanoBananaPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Format context window size for display
   */
  private formatContextWindow(tokens?: number): string {
    if (!tokens) return 'N/A';
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M tokens`;
    }
    return `${(tokens / 1000).toFixed(0)}K tokens`;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h1', { text: '🍌 NanoBanana PRO Settings' });

    // ==================== API Keys Section ====================
    containerEl.createEl('h2', { text: '🔑 API Keys' });

    new Setting(containerEl)
      .setName('Google API Key')
      .setDesc('Required for image generation. Get your key from Google AI Studio.')
      .addText(text => text
        .setPlaceholder('Enter your Google API key')
        .setValue(this.plugin.settings.googleApiKey)
        .onChange(async (value) => {
          this.plugin.settings.googleApiKey = value;
          await this.plugin.saveSettings();
        })
      )
      .addExtraButton(button => button
        .setIcon('external-link')
        .setTooltip('Get API Key')
        .onClick(() => {
          window.open('https://aistudio.google.com/apikey');
        })
      );

    new Setting(containerEl)
      .setName('OpenAI API Key')
      .setDesc('Optional. Used for prompt generation if OpenAI is selected.')
      .addText(text => text
        .setPlaceholder('Enter your OpenAI API key')
        .setValue(this.plugin.settings.openaiApiKey)
        .onChange(async (value) => {
          this.plugin.settings.openaiApiKey = value;
          await this.plugin.saveSettings();
        })
      )
      .addExtraButton(button => button
        .setIcon('external-link')
        .setTooltip('Get API Key')
        .onClick(() => {
          window.open('https://platform.openai.com/api-keys');
        })
      );

    new Setting(containerEl)
      .setName('Anthropic API Key')
      .setDesc('Optional. Used for prompt generation if Anthropic is selected.')
      .addText(text => text
        .setPlaceholder('Enter your Anthropic API key')
        .setValue(this.plugin.settings.anthropicApiKey)
        .onChange(async (value) => {
          this.plugin.settings.anthropicApiKey = value;
          await this.plugin.saveSettings();
        })
      )
      .addExtraButton(button => button
        .setIcon('external-link')
        .setTooltip('Get API Key')
        .onClick(() => {
          window.open('https://console.anthropic.com/settings/keys');
        })
      );

    new Setting(containerEl)
      .setName('xAI API Key')
      .setDesc('Optional. Used for prompt generation if xAI is selected.')
      .addText(text => text
        .setPlaceholder('Enter your xAI API key')
        .setValue(this.plugin.settings.xaiApiKey)
        .onChange(async (value) => {
          this.plugin.settings.xaiApiKey = value;
          await this.plugin.saveSettings();
        })
      )
      .addExtraButton(button => button
        .setIcon('external-link')
        .setTooltip('Get API Key')
        .onClick(() => {
          window.open('https://console.x.ai/');
        })
      );

    // ==================== Prompt Generation Section ====================
    containerEl.createEl('h2', { text: '🤖 Prompt Generation' });

    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('Select which AI provider to use for generating image prompts.')
      .addDropdown(dropdown => dropdown
        .addOptions({
          'google': '🌐 Google Gemini',
          'openai': '🤖 OpenAI',
          'anthropic': '🧠 Anthropic Claude',
          'xai': '⚡ xAI Grok'
        })
        .setValue(this.plugin.settings.selectedProvider)
        .onChange(async (value: AIProvider) => {
          this.plugin.settings.selectedProvider = value;
          // Set default model for selected provider
          this.plugin.settings.promptModel = PROVIDER_CONFIGS[value].defaultModel;
          await this.plugin.saveSettings();
          this.display(); // Refresh to update model dropdown
        })
      );

    const providerConfig = PROVIDER_CONFIGS[this.plugin.settings.selectedProvider];
    const currentModelInfo = getModelInfo(this.plugin.settings.selectedProvider, this.plugin.settings.promptModel);
    
    // Build model options with tier indicators
    const modelOptions: Record<string, string> = {};
    providerConfig.models.forEach((model: ModelInfo) => {
      const tierEmoji = model.tier === 'flagship' ? '⭐' : 
                        model.tier === 'balanced' ? '⚖️' : 
                        model.tier === 'vision' ? '👁️' : '⚡';
      modelOptions[model.id] = `${tierEmoji} ${model.name}`;
    });

    const modelSetting = new Setting(containerEl)
      .setName('Prompt Model')
      .setDesc(currentModelInfo ? 
        `${currentModelInfo.description} • Context: ${this.formatContextWindow(currentModelInfo.contextWindow)}` :
        'Select a model for prompt generation')
      .addDropdown(dropdown => dropdown
        .addOptions(modelOptions)
        .setValue(this.plugin.settings.promptModel)
        .onChange(async (value) => {
          this.plugin.settings.promptModel = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to update description
        })
      );

    // Add model tier legend
    const legendDiv = containerEl.createDiv({ cls: 'nanobanana-model-legend' });
    legendDiv.innerHTML = `
      <small style="color: var(--text-muted); display: flex; gap: 12px; margin-top: -8px; margin-bottom: 16px;">
        <span>⭐ Flagship</span>
        <span>⚖️ Balanced</span>
        <span>⚡ Fast</span>
        <span>👁️ Vision</span>
      </small>
    `;

    // ==================== Image Generation Section ====================
    containerEl.createEl('h2', { text: '🖼️ Image Generation' });

    new Setting(containerEl)
      .setName('Image Model')
      .setDesc('Google Gemini model for image generation. Must support image output.')
      .addText(text => text
        .setPlaceholder('gemini-3-pro-image-preview')
        .setValue(this.plugin.settings.imageModel)
        .onChange(async (value) => {
          this.plugin.settings.imageModel = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Image Style')
      .setDesc('Default style for generated posters.')
      .addDropdown(dropdown => dropdown
        .addOptions({
          'infographic': '📊 Infographic - Charts, icons, visual hierarchy',
          'poster': '🎨 Poster - Bold typography, strong imagery',
          'diagram': '📐 Diagram - Technical, clear connections',
          'mindmap': '🧠 Mind Map - Central concept with branches',
          'timeline': '📅 Timeline - Progression and milestones'
        })
        .setValue(this.plugin.settings.imageStyle)
        .onChange(async (value: ImageStyle) => {
          this.plugin.settings.imageStyle = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Preferred Language')
      .setDesc('Language for text in generated images (e.g., titles, labels, descriptions).')
      .addDropdown(dropdown => dropdown
        .addOptions({
          'ko': '🇰🇷 한국어 (Korean)',
          'en': '🇺🇸 English',
          'ja': '🇯🇵 日本語 (Japanese)',
          'zh': '🇨🇳 中文 (Chinese)',
          'es': '🇪🇸 Español (Spanish)',
          'fr': '🇫🇷 Français (French)',
          'de': '🇩🇪 Deutsch (German)'
        })
        .setValue(this.plugin.settings.preferredLanguage)
        .onChange(async (value: PreferredLanguage) => {
          this.plugin.settings.preferredLanguage = value;
          await this.plugin.saveSettings();
        })
      );

    const currentQuality = QUALITY_LABELS[this.plugin.settings.imageQuality];
    new Setting(containerEl)
      .setName('Image Quality')
      .setDesc(currentQuality ? currentQuality.description : 'Select image resolution.')
      .addDropdown(dropdown => dropdown
        .addOptions({
          'standard': '📱 Standard (1K) - Fast',
          'high': '🖥️ High (2K) - Recommended',
          'ultra': '🎨 Ultra (4K) - Maximum quality'
        })
        .setValue(this.plugin.settings.imageQuality)
        .onChange(async (value: ImageQuality) => {
          this.plugin.settings.imageQuality = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to update description
        })
      );

    // ==================== UX Settings Section ====================
    containerEl.createEl('h2', { text: '⚙️ User Experience' });

    new Setting(containerEl)
      .setName('Show Preview Before Generation')
      .setDesc('Show the generated prompt and allow editing before creating the image.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showPreviewBeforeGeneration)
        .onChange(async (value) => {
          this.plugin.settings.showPreviewBeforeGeneration = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Show Progress Modal')
      .setDesc('Display a progress indicator during generation.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showProgressModal)
        .onChange(async (value) => {
          this.plugin.settings.showProgressModal = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Attachment Folder')
      .setDesc('Folder to save generated images. Will be created if it doesn\'t exist.')
      .addText(text => text
        .setPlaceholder('999-Attachments')
        .setValue(this.plugin.settings.attachmentFolder)
        .onChange(async (value) => {
          this.plugin.settings.attachmentFolder = value || '999-Attachments';
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Auto-Retry Count')
      .setDesc('Number of automatic retries on transient failures (0-5).')
      .addSlider(slider => slider
        .setLimits(0, 5, 1)
        .setValue(this.plugin.settings.autoRetryCount)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.autoRetryCount = value;
          await this.plugin.saveSettings();
        })
      );

    // ==================== Advanced Section ====================
    containerEl.createEl('h2', { text: '🔧 Advanced' });

    new Setting(containerEl)
      .setName('Custom Prompt Prefix')
      .setDesc('Optional text to prepend to all generated prompts.')
      .addTextArea(textarea => textarea
        .setPlaceholder('e.g., "Create in a minimalist style with blue color scheme..."')
        .setValue(this.plugin.settings.customPromptPrefix)
        .onChange(async (value) => {
          this.plugin.settings.customPromptPrefix = value;
          await this.plugin.saveSettings();
        })
      );

    // ==================== About Section ====================
    containerEl.createEl('h2', { text: 'ℹ️ About' });

    const aboutDiv = containerEl.createDiv({ cls: 'nanobanana-about' });
    aboutDiv.createEl('p', {
      text: 'NanoBanana PRO v1.0.0'
    });
    aboutDiv.createEl('p', {
      text: 'Generate beautiful Knowledge Posters from your notes using AI.'
    });

    const linksDiv = aboutDiv.createDiv({ cls: 'nanobanana-links' });
    linksDiv.createEl('a', {
      text: '📖 Documentation',
      href: 'https://github.com/username/nanobanana-pro-obsidian#readme'
    });
    linksDiv.createEl('span', { text: ' | ' });
    linksDiv.createEl('a', {
      text: '🐛 Report Issue',
      href: 'https://github.com/username/nanobanana-pro-obsidian/issues'
    });
  }
}
