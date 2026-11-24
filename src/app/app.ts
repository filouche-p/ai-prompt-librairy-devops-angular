import { Component, inject, OnInit } from '@angular/core';
import { PromptCard } from './components/prompt-card/prompt-card';
import { PromptForm } from './components/prompt-form/prompt-form';
import { AiModelId, PromptPayload } from './models/prompt.model';
import { PromptService } from './services/prompt.service';

@Component({
  selector: 'app-root',
  imports: [PromptForm, PromptCard],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly promptService = inject(PromptService);

  ngOnInit(): void {
    void this.promptService.loadPrompts();
  }

  protected onModelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.promptService.setSelectedModel(select.value as AiModelId);
  }

  protected onPromptSubmitted(payload: PromptPayload): void {
    this.promptService.addPrompt(payload);
  }
}
