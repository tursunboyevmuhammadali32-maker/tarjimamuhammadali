import { HistoryItem } from '../types';

const HISTORY_KEY = 'tahrirchi_history_v1';
const THEME_KEY = 'tahrirchi_theme';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveHistoryItem(
  item: Omit<HistoryItem, 'id' | 'timestamp'>
): HistoryItem[] {
  try {
    const current = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    // Filter out potential duplicate of exact same text to keep history rich
    const filtered = current.filter(
      (h) => h.original_text.trim() !== item.original_text.trim()
    );

    const updated = [newItem, ...filtered].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save history item', e);
    return getHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getHistory();
    const updated = current.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item', e);
    return getHistory();
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback
  }
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}
