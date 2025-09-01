
export interface Thumbnail {
  id: string;
  imageDataUrl: string;
  format: string; // e.g., 'YouTube (16:9)'
  aspectRatio: '16/9' | '9/16' | '1/1' | '4/3' | '3/4';
}

export interface QuestionnaireData {
  videoType: string;
  style: string;
  placement: string;
  customText: string;
  aspectRatios: string[];
  proMode: boolean;
  customPrompt: string;
  enhancedPrompts?: string[] | null;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
