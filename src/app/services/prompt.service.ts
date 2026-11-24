import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AiModelId, AiModelOption, PromptItem, PromptPayload } from '../models/prompt.model';

export const AI_MODELS: readonly AiModelOption[] = [
  {
    id: 'chat-gpt',
    label: 'Chat GPT',
    baseUrl: 'https://chatgpt.com/?q=',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private readonly http = inject(HttpClient);

  readonly models = AI_MODELS;
  readonly selectedModelId = signal<AiModelId>('chat-gpt');
  readonly prompts = signal<PromptItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly selectedModel = computed(
    () => this.models.find((m) => m.id === this.selectedModelId()) ?? this.models[0],
  );

  readonly promptCountLabel = computed(() => {
    const count = this.prompts().length;
    return `${count} ${count > 1 ? 'prompts' : 'prompt'}`;
  });

  async loadPrompts(jsonPath = 'prompts.json'): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.http.get<unknown>(jsonPath));
      if (!Array.isArray(data)) {
        throw new Error('Format JSON invalide : un tableau de prompts était attendu.');
      }

      const existingIds = new Set(
        this.prompts()
          .filter((item) => item.addedByUser)
          .map((item) => item.id),
      );
      const loadedItems: PromptItem[] = [];

      for (const entry of data) {
        if (!this.isValidPromptPayload(entry)) {
          console.error(
            'Il semble impossible de récupérer les éléments depuis le json, sa structure doit ressembler à : [{"title": "Exemple de prompt", "category": "Education", "prompt": "Mon super prompt ici."}]',
          );
          continue;
        }

        const id = this.createUniqueId(entry.title, existingIds);
        existingIds.add(id);
        loadedItems.push({
          id,
          title: entry.title,
          category: entry.category,
          prompt: entry.prompt,
          addedByUser: false,
        });
      }

      const userPrompts = this.prompts().filter((item) => item.addedByUser);
      this.prompts.set([...loadedItems, ...userPrompts]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la récupération du fichier JSON.';
      console.error(`Erreur lors de la lecture de '${jsonPath}' :`, err);
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  addPrompt(payload: PromptPayload): PromptItem {
    const title = payload.title.trim();
    const category = payload.category.trim();
    const prompt = payload.prompt.trim();

    const existingIds = new Set(this.prompts().map((item) => item.id));
    const id = this.createUniqueId(title, existingIds);

    const newItem: PromptItem = {
      id,
      title,
      category,
      prompt,
      addedByUser: true,
    };

    this.prompts.update((items) => [...items, newItem]);
    return newItem;
  }

  setSelectedModel(modelId: AiModelId): void {
    this.selectedModelId.set(modelId);
  }

  buildModelUrl(promptText: string): string {
    return `${this.selectedModel().baseUrl}${encodeURIComponent(promptText)}`;
  }

  private isValidPromptPayload(value: unknown): value is PromptPayload {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
      typeof candidate['title'] === 'string' &&
      candidate['title'].trim().length > 0 &&
      typeof candidate['category'] === 'string' &&
      candidate['category'].trim().length > 0 &&
      typeof candidate['prompt'] === 'string' &&
      candidate['prompt'].trim().length > 0
    );
  }

  private createUniqueId(title: string, existingIds: Set<string>): string {
    const slug = title
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .join('-');
    const baseId = `card-${slug || 'prompt'}`;

    if (!existingIds.has(baseId)) {
      return baseId;
    }

    let suffix = 2;
    while (existingIds.has(`${baseId}-${suffix}`)) {
      suffix++;
    }
    return `${baseId}-${suffix}`;
  }
}
