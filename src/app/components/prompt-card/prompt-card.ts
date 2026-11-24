import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { PromptItem } from '../../models/prompt.model';

type CopyState = 'idle' | 'copied' | 'failed';

let lastAnnouncedCopyMessage = '';

@Component({
  selector: 'app-prompt-card',
  imports: [],
  templateUrl: './prompt-card.html',
})
export class PromptCard {
  private readonly destroyRef = inject(DestroyRef);

  readonly prompt = input.required<PromptItem>();
  readonly promptUrl = input.required<string>();

  readonly copyState = signal<CopyState>('idle');
  readonly statusMessage = signal('');

  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.resetTimer !== null) {
        clearTimeout(this.resetTimer);
      }
    });
  }

  async copyPrompt(): Promise<void> {
    const text = this.prompt().prompt;
    if (!text) {
      return;
    }

    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = this.legacyCopy(text);
      }
    } catch {
      ok = this.legacyCopy(text);
    }

    this.reportCopy(ok);
  }

  private reportCopy(ok: boolean): void {
    if (this.resetTimer !== null) {
      clearTimeout(this.resetTimer);
    }

    let message = ok ? 'Copié' : 'Échec de copie';
    if (message === lastAnnouncedCopyMessage) {
      message += '\u00A0';
    }
    lastAnnouncedCopyMessage = message;

    this.copyState.set(ok ? 'copied' : 'failed');
    this.statusMessage.set(message);

    this.resetTimer = setTimeout(() => {
      this.copyState.set('idle');
      this.statusMessage.set('');
      this.resetTimer = null;
    }, 2000);
  }

  private legacyCopy(text: string): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
    document.body.append(field);
    field.select();

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
    }
  }
}
