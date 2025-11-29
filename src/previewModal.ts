import { App, Modal, Setting } from 'obsidian';
import { NanoBananaSettings, PROVIDER_CONFIGS, IMAGE_STYLES } from './types';

export interface PreviewModalResult {
  confirmed: boolean;
  prompt: string;
  regenerate: boolean;
}

export class PreviewModal extends Modal {
  private prompt: string;
  private settings: NanoBananaSettings;
  private onConfirm: (result: PreviewModalResult) => void;
  private promptTextarea: HTMLTextAreaElement;

  constructor(
    app: App,
    prompt: string,
    settings: NanoBananaSettings,
    onConfirm: (result: PreviewModalResult) => void
  ) {
    super(app);
    this.prompt = prompt;
    this.settings = settings;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('nanobanana-preview-modal');

    // Title
    contentEl.createEl('h2', {
      text: '📝 프롬프트 미리보기',
      cls: 'nanobanana-preview-title'
    });

    // Info section
    const infoSection = contentEl.createDiv({ cls: 'nanobanana-preview-info' });

    infoSection.createDiv({
      cls: 'nanobanana-preview-info-item',
      text: `🤖 프롬프트 모델: ${PROVIDER_CONFIGS[this.settings.selectedProvider].name} - ${this.settings.promptModel}`
    });

    infoSection.createDiv({
      cls: 'nanobanana-preview-info-item',
      text: `🖼️ 이미지 모델: ${this.settings.imageModel}`
    });

    infoSection.createDiv({
      cls: 'nanobanana-preview-info-item',
      text: `📊 스타일: ${IMAGE_STYLES[this.settings.imageStyle]}`
    });

    // Prompt textarea
    const textareaContainer = contentEl.createDiv({ cls: 'nanobanana-textarea-container' });
    textareaContainer.createEl('label', {
      text: '생성된 프롬프트 (수정 가능):',
      cls: 'nanobanana-textarea-label'
    });

    this.promptTextarea = textareaContainer.createEl('textarea', {
      cls: 'nanobanana-prompt-textarea'
    });
    this.promptTextarea.value = this.prompt;
    this.promptTextarea.rows = 10;

    // Character count
    const charCount = textareaContainer.createDiv({ cls: 'nanobanana-char-count' });
    charCount.setText(`${this.prompt.length} 자`);

    this.promptTextarea.addEventListener('input', () => {
      charCount.setText(`${this.promptTextarea.value.length} 자`);
    });

    // Tips section
    const tipsSection = contentEl.createDiv({ cls: 'nanobanana-tips' });
    tipsSection.createEl('p', { text: '💡 팁:' });
    const tipsList = tipsSection.createEl('ul');
    tipsList.createEl('li', { text: '프롬프트를 수정하여 원하는 스타일로 조정할 수 있습니다' });
    tipsList.createEl('li', { text: '구체적인 색상, 레이아웃, 요소를 추가하면 더 좋은 결과를 얻을 수 있습니다' });
    tipsList.createEl('li', { text: '"다시 생성" 버튼으로 새로운 프롬프트를 생성할 수 있습니다' });

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'nanobanana-button-container' });

    // Generate Image button
    const generateButton = buttonContainer.createEl('button', {
      text: '🎨 이미지 생성',
      cls: 'mod-cta'
    });
    generateButton.addEventListener('click', () => {
      this.onConfirm({
        confirmed: true,
        prompt: this.promptTextarea.value,
        regenerate: false
      });
      this.close();
    });

    // Regenerate Prompt button
    const regenerateButton = buttonContainer.createEl('button', {
      text: '🔄 다시 생성'
    });
    regenerateButton.addEventListener('click', () => {
      this.onConfirm({
        confirmed: true,
        prompt: '',
        regenerate: true
      });
      this.close();
    });

    // Cancel button
    const cancelButton = buttonContainer.createEl('button', {
      text: '취소'
    });
    cancelButton.addEventListener('click', () => {
      this.onConfirm({
        confirmed: false,
        prompt: '',
        regenerate: false
      });
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
