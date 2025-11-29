import { App, Modal } from 'obsidian';
import { ProgressState, ProgressStep, GenerationError } from './types';

export class ProgressModal extends Modal {
  private progressContainer: HTMLElement;
  private progressBar: HTMLElement;
  private progressText: HTMLElement;
  private stepsContainer: HTMLElement;
  private cancelButton: HTMLButtonElement;
  private onCancel: (() => void) | null = null;
  private isCancelled = false;

  private steps: { key: ProgressStep; label: string; icon: string }[] = [
    { key: 'analyzing', label: '노트 분석', icon: '📄' },
    { key: 'generating-prompt', label: '프롬프트 생성', icon: '🤖' },
    { key: 'generating-image', label: '이미지 생성', icon: '🎨' },
    { key: 'saving', label: '파일 저장', icon: '💾' },
    { key: 'embedding', label: '노트에 삽입', icon: '📎' }
  ];

  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('nanobanana-progress-modal');

    // Title
    contentEl.createEl('h2', {
      text: '🎨 Knowledge Poster 생성 중...',
      cls: 'nanobanana-progress-title'
    });

    // Progress bar container
    this.progressContainer = contentEl.createDiv({ cls: 'nanobanana-progress-container' });
    this.progressBar = this.progressContainer.createDiv({ cls: 'nanobanana-progress-bar' });
    this.progressText = this.progressContainer.createDiv({
      cls: 'nanobanana-progress-text',
      text: '0%'
    });

    // Steps container
    this.stepsContainer = contentEl.createDiv({ cls: 'nanobanana-steps-container' });
    this.renderSteps();

    // Estimated time
    contentEl.createDiv({
      cls: 'nanobanana-estimated-time',
      text: '⏱️ 예상 소요 시간: 약 15-30초'
    });

    // Cancel button
    const buttonContainer = contentEl.createDiv({ cls: 'nanobanana-button-container' });
    this.cancelButton = buttonContainer.createEl('button', {
      text: '취소',
      cls: 'nanobanana-cancel-button'
    });
    this.cancelButton.addEventListener('click', () => {
      this.isCancelled = true;
      if (this.onCancel) {
        this.onCancel();
      }
      this.close();
    });
  }

  private renderSteps() {
    this.stepsContainer.empty();

    for (const step of this.steps) {
      const stepEl = this.stepsContainer.createDiv({ cls: 'nanobanana-step' });
      stepEl.createSpan({ cls: 'nanobanana-step-icon', text: '⏳' });
      stepEl.createSpan({ cls: 'nanobanana-step-label', text: `${step.icon} ${step.label}` });
      stepEl.dataset.step = step.key;
    }
  }

  updateProgress(state: ProgressState) {
    if (this.isCancelled) return;

    // Update progress bar
    this.progressBar.style.width = `${state.progress}%`;
    this.progressText.setText(`${Math.round(state.progress)}%`);

    // Update steps
    const stepIndex = this.steps.findIndex(s => s.key === state.step);
    const stepElements = this.stepsContainer.querySelectorAll('.nanobanana-step');

    stepElements.forEach((el, index) => {
      const iconEl = el.querySelector('.nanobanana-step-icon');
      if (!iconEl) return;

      if (index < stepIndex) {
        // Completed
        el.addClass('completed');
        el.removeClass('active');
        iconEl.setText('✅');
      } else if (index === stepIndex) {
        // Active
        el.addClass('active');
        el.removeClass('completed');
        iconEl.setText('🔄');
      } else {
        // Pending
        el.removeClass('active', 'completed');
        iconEl.setText('⏳');
      }
    });
  }

  showError(error: GenerationError) {
    const { contentEl } = this;

    // Clear and show error
    contentEl.empty();
    contentEl.addClass('nanobanana-error-state');

    contentEl.createEl('h2', {
      text: '❌ 생성 실패',
      cls: 'nanobanana-error-title'
    });

    const errorBox = contentEl.createDiv({ cls: 'nanobanana-error-box' });
    errorBox.createEl('p', { text: error.message });

    if (error.details) {
      errorBox.createEl('p', {
        text: error.details,
        cls: 'nanobanana-error-details'
      });
    }

    // Suggestions based on error type
    const suggestions = this.getErrorSuggestions(error);
    if (suggestions.length > 0) {
      const suggestionBox = contentEl.createDiv({ cls: 'nanobanana-suggestions' });
      suggestionBox.createEl('p', { text: '💡 해결 방법:' });
      const list = suggestionBox.createEl('ul');
      for (const suggestion of suggestions) {
        list.createEl('li', { text: suggestion });
      }
    }

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'nanobanana-button-container' });

    if (error.retryable) {
      const retryButton = buttonContainer.createEl('button', {
        text: '다시 시도',
        cls: 'nanobanana-retry-button mod-cta'
      });
      retryButton.addEventListener('click', () => {
        if (this.onCancel) {
          // Use onCancel as retry trigger
          this.close();
        }
      });
    }

    const closeButton = buttonContainer.createEl('button', {
      text: '닫기',
      cls: 'nanobanana-close-button'
    });
    closeButton.addEventListener('click', () => this.close());
  }

  showSuccess(imagePath: string) {
    const { contentEl } = this;

    // Clear and show success
    contentEl.empty();
    contentEl.addClass('nanobanana-success-state');

    contentEl.createEl('h2', {
      text: '✅ Knowledge Poster 생성 완료!',
      cls: 'nanobanana-success-title'
    });

    const infoBox = contentEl.createDiv({ cls: 'nanobanana-success-box' });
    infoBox.createEl('p', { text: `📁 저장 위치: ${imagePath}` });

    // Close button with auto-close
    const buttonContainer = contentEl.createDiv({ cls: 'nanobanana-button-container' });
    const closeButton = buttonContainer.createEl('button', {
      text: '확인',
      cls: 'nanobanana-close-button mod-cta'
    });
    closeButton.addEventListener('click', () => this.close());

    // Auto close after 3 seconds
    setTimeout(() => {
      if (!this.isCancelled) {
        this.close();
      }
    }, 3000);
  }

  private getErrorSuggestions(error: GenerationError): string[] {
    switch (error.type) {
      case 'INVALID_API_KEY':
        return [
          '설정에서 API 키를 확인해주세요',
          'API 키가 올바르게 입력되었는지 확인해주세요',
          '해당 서비스의 API 키가 활성화되어 있는지 확인해주세요'
        ];
      case 'RATE_LIMIT':
        return [
          '잠시 후 다시 시도해주세요',
          'API 사용량 한도를 확인해주세요'
        ];
      case 'NETWORK_ERROR':
        return [
          '인터넷 연결을 확인해주세요',
          'VPN이나 프록시 설정을 확인해주세요'
        ];
      case 'GENERATION_FAILED':
        return [
          '다른 스타일로 시도해보세요',
          '노트 내용을 수정하고 다시 시도해주세요'
        ];
      case 'CONTENT_FILTERED':
        return [
          '노트 내용을 수정해주세요',
          '민감한 내용이 포함되어 있을 수 있습니다'
        ];
      case 'NO_CONTENT':
        return [
          '노트에 내용을 추가해주세요'
        ];
      default:
        return [];
    }
  }

  setOnCancel(callback: () => void) {
    this.onCancel = callback;
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
