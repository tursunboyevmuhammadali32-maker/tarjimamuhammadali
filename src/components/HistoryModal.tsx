import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ArrowRight, RotateCcw, FileText } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (isToday) {
      return `Bugun, ${hours}:${minutes}`;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}, ${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tekshiruvlar tarixi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Oxirgi 10 ta matn tahriri (brauzer xotirasida)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Barcha tarixni o'chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tozalash</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Hozircha tarix mavjud emas</p>
              <p className="text-xs mt-1">
                Matn kiritib "To‘g‘rilash" tugmasini bosing va natijalar bu yerda saqlanadi.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {formatDate(item.timestamp)}
                    </span>
                    <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {item.result.language_label || item.language}
                    </span>
                    <span className="text-[11px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {item.mode === 'improve_style' ? 'Uslubni yaxshilash' : 'Faqat xatolar'}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.error_count > 0
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {item.error_count > 0 ? `${item.error_count} ta tuzatish` : 'Xatosiz'}
                    </span>
                  </div>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview text */}
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-3 font-normal">
                  {item.original_text}
                </p>

                {/* Action button */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Matnni qayta yuklash</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Jami saqlangan: {items.length} / 10 ta</span>
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
