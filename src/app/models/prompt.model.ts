export interface PromptPayload {
  title: string;
  category: string;
  prompt: string;
}

export interface PromptItem extends PromptPayload {
  id: string;
  addedByUser?: boolean;
}

export type AiModelId = 'chat-gpt';

export interface AiModelOption {
  id: AiModelId;
  label: string;
  baseUrl: string;
}
