export type ChangeType = 'spelling' | 'grammar' | 'punctuation' | 'style';

export interface ChangeItem {
  original: string;
  fixed: string;
  reason: string;
  type: ChangeType;
}

export interface ProofreadResult {
  detected_language: string;
  language_label: string;
  corrected_text: string;
  changes: ChangeItem[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  original_text: string;
  result: ProofreadResult;
  language: string;
  mode: 'errors_only' | 'improve_style';
  error_count: number;
}

export type LanguageCode = 'auto' | 'uz-latn' | 'uz-cyrl' | 'ru' | 'en';
export type ModeCode = 'errors_only' | 'improve_style';
