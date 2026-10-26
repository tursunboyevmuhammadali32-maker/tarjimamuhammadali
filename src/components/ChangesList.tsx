import React, { useState } from 'react';
import { ChangeItem, ChangeType } from '../types';
import {
  SpellCheck,
  BookOpen,
  Quote,
  Feather,
  ArrowRight,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface ChangesListProps {
  changes: ChangeItem[];
  onHighlightChange?: (change: ChangeItem) => void;
}

export const ChangesList: React.FC<ChangesListProps> = ({ changes, onHighlightChange }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | ChangeType>('all');

  const filteredChanges =
    selectedFilter === 'all'
      ? changes
      : changes.filter((ch) => ch.type === selectedFilter);

  const getBadgeInfo = (type: ChangeType) => {
    switch (type) {
      case 'spelling':
        return {
          label: 'Imlo xatosi',
          icon: <SpellCheck className="w-3.5 h-3.5" />,
          colorClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
        };
      case 'grammar':
        return {
          label: 'Grammatika',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        };
      case 'punctuation':
        return {
          label: 'Tinish belgisi',
          icon: <Quote className="w-3.5 h-3.5" />,
          colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
        };
      case 'style':
        return {
          label: 'Uslub',
          icon: <Feather className="w-3.5 h-3.5" />,
          colorClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
        };
      default:
        return {
          label: 'Tuzatish',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const countByType = {
    all: changes.length,
    spelling: changes.filter((c) => c.type === 'spelling').length,
    grammar: changes.filter((c) => c.type === 'grammar').length,
    punctuation: changes.filter((c) => c.type === 'punctuation').length,
    style: changes.filter((c) => c.type === 'style').length,
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Qilingan tuzatishlar va izohlar ({changes.length})
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Barchasi ({countByType.all})
          </button>
          {countByType.spelling > 0 && (
            <button
              onClick={() => setSelectedFilter('spelling')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'spelling'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Imlo ({countByType.spelling})
            </button>
          )}
          {countByType.punctuation > 0 && (
            <button
              onClick={() => setSelectedFilter('punctuation')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'punctuation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tinish ({countByType.punctuation})
            </button>
          )}
          {countByType.grammar > 0 && (
            <button
              onClick={() => setSelectedFilter('grammar')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'grammar'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Grammatika ({countByType.grammar})
            </button>
          )}
          {countByType.style > 0 && (
            <button
              onClick={() => setSelectedFilter('style')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'style'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Uslub ({countByType.style})
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {filteredChanges.length === 0 ? (
        <div className="p-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
          Tanlangan toifada tuzatishlar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredChanges.map((ch, idx) => {
            const badge = getBadgeInfo(ch.type);
            return (
              <div
                key={idx}
                onClick={() => onHighlightChange && onHighlightChange(ch)}
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.colorClass}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                  </div>

                  {/* Words Diff: Red original -> Green fixed */}
                  <div className="flex items-center flex-wrap gap-2 text-sm my-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 line-through font-mono">
                      {ch.original || '(bo‘sh)'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold font-mono">
                      {ch.fixed || '(olib tashlandi)'}
                    </span>
                  </div>
                </div>

                {/* Reason explanation in Uzbek */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 leading-relaxed font-normal">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Izoh: </span>
                  {ch.reason}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
