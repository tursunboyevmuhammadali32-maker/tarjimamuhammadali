import { ChangeItem } from '../types';

export interface DiffSegment {
  type: 'unchanged' | 'change';
  text?: string;
  original?: string;
  fixed?: string;
  change?: ChangeItem;
}

/**
 * Builds aligned segments for visual diff rendering based on the AI's list of changes.
 */
export function buildDiffSegments(
  originalText: string,
  _correctedText: string,
  changes: ChangeItem[]
): DiffSegment[] {
  if (!changes || changes.length === 0) {
    return [{ type: 'unchanged', text: originalText }];
  }

  // Find occurrences of changes in originalText sequentially
  interface MatchPos {
    start: number;
    end: number;
    change: ChangeItem;
  }

  const matches: MatchPos[] = [];
  let searchCursor = 0;

  for (const ch of changes) {
    if (!ch.original) continue;
    const idx = originalText.indexOf(ch.original, searchCursor);
    if (idx !== -1) {
      matches.push({
        start: idx,
        end: idx + ch.original.length,
        change: ch,
      });
      searchCursor = idx + ch.original.length;
    } else {
      // Try search from beginning if not found from cursor
      const idxFromStart = originalText.indexOf(ch.original);
      if (idxFromStart !== -1 && !matches.some(m => (idxFromStart >= m.start && idxFromStart < m.end))) {
        matches.push({
          start: idxFromStart,
          end: idxFromStart + ch.original.length,
          change: ch,
        });
      }
    }
  }

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Filter overlapping matches
  const validMatches: MatchPos[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      validMatches.push(m);
      lastEnd = m.end;
    }
  }

  const segments: DiffSegment[] = [];
  let currentPos = 0;

  for (const m of validMatches) {
    if (m.start > currentPos) {
      segments.push({
        type: 'unchanged',
        text: originalText.slice(currentPos, m.start),
      });
    }

    segments.push({
      type: 'change',
      original: m.change.original,
      fixed: m.change.fixed,
      change: m.change,
    });

    currentPos = m.end;
  }

  if (currentPos < originalText.length) {
    segments.push({
      type: 'unchanged',
      text: originalText.slice(currentPos),
    });
  }

  return segments;
}
