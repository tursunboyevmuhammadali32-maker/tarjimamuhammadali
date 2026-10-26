import React, { useState } from 'react';
import { ChangeItem } from '../types';
import { buildDiffSegments } from '../utils/diff';
import {
  Copy,
  Check,
  Split,
  Eye,
  FileCheck,
  Info,
} from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  correctedText: string;
  changes: ChangeItem[];
  onCopy: () => void;
  isCopied: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  correctedText,
  changes,
  onCopy,
  isCopied,
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'clean' | 'split'>('diff');
  const [activeTooltip, setActiveTooltip] = useState<ChangeItem | null>(null);

  const segments = buildDiffSegments(originalText, correctedText, changes);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
      {/* Action and view mode header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-medium">
          <button
            onClick={() => setViewMode('diff')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'diff'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Farqlar (Diff)</span>
          </button>
          <button
            onClick={() => setViewMode('clean')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'clean'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Toza matn</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Yonma-yon</span>
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={onCopy}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            isCopied
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
          title="To'g'rilangan toza matnni nusxalash"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nusxa olindi!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Nusxa olish</span>
            </>
          )}
        </button>
      </div>

      {/* Main Diff Content Container */}
      <div className="flex-1 p-5 overflow-y-auto min-h-[280px] max-h-[500px]">
        {/* Active Tooltip / Reason Banner */}
        {activeTooltip && (
          <div className="mb-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="line-through text-rose-600 dark:text-rose-400 font-mono">
                  {activeTooltip.original}
                </span>
                <span>→</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {activeTooltip.fixed}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-normal">
                {activeTooltip.reason}
              </p>
            </div>
            <button
              onClick={() => setActiveTooltip(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. DIFF VIEW */}
        {viewMode === 'diff' && (
          <div className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans select-text whitespace-pre-wrap">
            {segments.length === 0 ? (
              <span className="text-slate-400">Matn tahriri bu yerda ko‘rinadi...</span>
            ) : (
              segments.map((seg, idx) => {
                if (seg.type === 'unchanged') {
                  return <span key={idx}>{seg.text}</span>;
                }

                const ch = seg.change;
                return (
                  <span
                    key={idx}
                    className="inline-flex flex-wrap items-baseline gap-1 mx-0.5 group relative cursor-pointer"
                    onClick={() => ch && setActiveTooltip(ch)}
                  >
                    {/* Deleted original word (red) */}
                    {seg.original && (
                      <span
                        className="bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 line-through rounded-md px-1.5 py-0.5 font-mono text-[14px] hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
                        title={ch ? `Xato: ${ch.reason}` : undefined}
                      >
                        {seg.original}
                      </span>
                    )}
                    {/* Fixed new word (green) */}
                    {seg.fixed && (
                      <span
                        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold rounded-md px-1.5 py-0.5 font-mono text-[14px] hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors underline decoration-emerald-500/50 decoration-wavy"
                        title={ch ? `Tuzatish: ${ch.reason}` : undefined}
                      >
                        {seg.fixed}
                      </span>
                    )}
                  </span>
                );
              })
            )}
          </div>
        )}

        {/* 2. CLEAN CORRECTED TEXT VIEW */}
        {viewMode === 'clean' && (
          <div className="text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
            {correctedText || (
              <span className="text-slate-400">To‘g‘rilangan matn bu yerda ko‘rinadi...</span>
            )}
          </div>
        )}

        {/* 3. SPLIT VIEW */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Asl matn
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {originalText}
              </p>
            </div>
            <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 overflow-y-auto">
              <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider block mb-2">
                To‘g‘rilangan matn
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {correctedText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Diff legend footer */}
      {viewMode === 'diff' && changes.length > 0 && (
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-200 dark:bg-rose-900 border border-rose-300 dark:border-rose-700 inline-block" />
              <span>O‘chirilgan xato so‘z</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 inline-block" />
              <span>To‘g‘rilangan yangi so‘z</span>
            </span>
          </div>
          <span className="italic text-slate-400">
            Izohni ko‘rish uchun tuzatilgan so‘z ustiga bosing
          </span>
        </div>
      )}
    </div>
  );
};
