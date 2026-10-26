import React from 'react';
import { CheckCircle2, History, Moon, Sun, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tahrirchi
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> AI Imlo & Grammatika
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Matnlarni tezkor va bexato to‘g‘rilash tizimi
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer relative"
            title="Oxirgi tekshiruvlar tarixi"
          >
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Tarix</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center text-[11px] font-semibold bg-blue-600 text-white rounded-full w-5 h-5 ml-0.5">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer"
            aria-label="Rejimni almashtirish"
            title={theme === 'dark' ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
