import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DiffViewer } from './components/DiffViewer';
import { ChangesList } from './components/ChangesList';
import { HistoryModal } from './components/HistoryModal';
import {
  ProofreadResult,
  HistoryItem,
  LanguageCode,
  ModeCode,
} from './types';
import {
  getHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory,
  getInitialTheme,
  saveTheme,
} from './utils/storage';
import { SAMPLE_TEXTS } from './data/samples';
import {
  Wand2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Languages,
  Sliders,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('auto');
  const [mode, setMode] = useState<ModeCode>('errors_only');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [lastOriginalText, setLastOriginalText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // History state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize theme and history on load
  useEffect(() => {
    saveTheme(theme);
    setHistoryItems(getHistory());
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    saveTheme(next);
  };

  // Text statistics
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const isTooLong = charCount > 5000;
  const isEmpty = inputText.trim().length === 0;

  // Handle proofread request
  const handleProofread = async () => {
    if (isEmpty) {
      setErrorMessage('Iltimos, avval tekshirish uchun matn kiriting!');
      return;
    }

    if (isTooLong) {
      setErrorMessage(
        `Matn 5000 belgidan oshmasligi kerak (hozirda: ${charCount} ta belgi). Iltimos, matnni qisqartiring.`
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/proofread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          language,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Serverda matnni tekshirishda xatolik yuz berdi.');
      }

      const proofreadData: ProofreadResult = data.data;
      setResult(proofreadData);
      setLastOriginalText(inputText);

      // Save to history
      const updatedHistory = saveHistoryItem({
        original_text: inputText,
        result: proofreadData,
        language: proofreadData.language_label || language,
        mode,
        error_count: proofreadData.changes?.length || 0,
      });
      setHistoryItems(updatedHistory);
    } catch (err: any) {
      console.error('Proofread failed:', err);
      setErrorMessage(
        err.message ||
          'Server bilan aloqada xatolik yuz berdi. Iltimos, internet aloqasi va sozlamalarni tekshirib qayta urining.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy corrected text to clipboard
  const handleCopy = () => {
    if (!result?.corrected_text) return;
    navigator.clipboard.writeText(result.corrected_text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Clear text
  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMessage(null);
  };

  // Load sample text
  const handleLoadSample = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    setInputText(sample.text);
    if (sample.lang !== 'auto') {
      setLanguage(sample.lang as LanguageCode);
    }
    setResult(null);
    setErrorMessage(null);
  };

  // Restore item from history
  const handleRestoreHistory = (item: HistoryItem) => {
    setInputText(item.original_text);
    setLastOriginalText(item.original_text);
    setResult(item.result);
    setMode(item.mode);
    setErrorMessage(null);
  };

  // Delete history item
  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
  };

  // Clear all history
  const handleClearHistory = () => {
    clearHistory();
    setHistoryItems([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Controls Toolbar: Language & Mode Selectors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          {/* Language Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Matn tili:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {[
                { id: 'auto', label: 'Avtomatik aniqlash' },
                { id: 'uz-latn', label: "O'zbek (lotin)" },
                { id: 'uz-cyrl', label: "Ўзбек (кирилл)" },
                { id: 'ru', label: 'Ruscha' },
                { id: 'en', label: 'Inglizcha' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLanguage(opt.id as LanguageCode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    language === opt.id
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Rejim:</span>
            </div>
            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setMode('errors_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  mode === 'errors_only'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
                title="Faqat orfografiya, grammatika va tinish belgilarini tuzatadi"
              >
                Faqat xatolarni tuzat
              </button>
              <button
                onClick={() => setMode('improve_style')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  mode === 'improve_style'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
                title="Xatolardan tashqari gaplarning ravonligi va uslubini ham sayqallaydi"
              >
                Uslubni ham yaxshila
              </button>
            </div>
          </div>
        </div>

        {/* Quick Sample Text Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="shrink-0 font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Sinab ko‘rish uchun namuna:
          </span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(sample)}
              className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                Xatolik yuz berdi
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Work Area: Input Textarea + Results Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: Input Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col gap-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kiritilgan matn
                </h2>
              </div>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Matnni tozalash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Tozalash</span>
                </button>
              )}
            </div>

            {/* Big Textarea */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Bu yerga tekshirilishi kerak bo‘lgan matnni kiriting yoki yuqoridagi namunalardan birini tanlang..."
                rows={11}
                className={`w-full p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base resize-y transition-all leading-relaxed ${
                  isTooLong
                    ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              />

              {/* Character Limit Warning Banner */}
              {isTooLong && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Diqqat! Matn 5000 belgidan oshmasligi kerak (ortiqcha:{' '}
                    {charCount - 5000} ta belgi).
                  </span>
                </div>
              )}
            </div>

            {/* Bottom bar of Input: Counters & Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span
                  className={
                    isTooLong
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : ''
                  }
                >
                  {charCount} / 5000 belgi
                </span>
                <span>•</span>
                <span>{wordCount} ta so‘z</span>
              </div>

              {/* Main Submit Button: To'g'rilash */}
              <button
                onClick={handleProofread}
                disabled={isLoading || isEmpty || isTooLong}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-md cursor-pointer ${
                  isLoading || isEmpty || isTooLong
                    ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-98'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Tahlil qilinmoqda...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>To‘g‘rilash</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Output Section (Diff, Clean text, Split view) */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[380px] text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 animate-pulse">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Matn tahlil qilinmoqda...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Sun’iy intellekt imlo, punktuatsiya va grammatik me’yorlarni tekshirmoqda.
                </p>
                <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : result ? (
              /* Results Container */
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                {/* Stats Summary Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                        result.changes.length > 0
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {result.changes.length > 0 ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{result.changes.length} ta xato topildi</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Xato topilmadi (matn toza)</span>
                        </>
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      <Languages className="w-3.5 h-3.5" />
                      <span>{result.language_label || result.detected_language}</span>
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    To‘g‘rilangan belgilar: {result.corrected_text.length} ta
                  </span>
                </div>

                {/* Visual Diff & Text Viewer */}
                <DiffViewer
                  originalText={lastOriginalText}
                  correctedText={result.corrected_text}
                  changes={result.changes}
                  onCopy={handleCopy}
                  isCopied={isCopied}
                />
              </div>
            ) : (
              /* Empty Placeholder */
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[380px] text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-3">
                  <Wand2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Natija bu yerda paydo bo‘ladi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Chap tarafdagi maydonga matn kiriting va "To‘g‘rilash" tugmasini bosing.
                  Imlo va tinish belgilari xatolari ranglar bilan ajratib ko‘rsatiladi.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: Detailed Changes List (if results exist) */}
        {result && result.changes && result.changes.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
            <ChangesList changes={result.changes} />
          </div>
        )}
      </main>

      {/* History Slide-over Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelect={handleRestoreHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Tahrirchi © {new Date().getFullYear()} — O‘zbek, rus va ingliz tillarida aqlli matn tekshiruvi
        </p>
      </footer>
    </div>
  );
}
