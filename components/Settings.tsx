
import React from 'react';
import { useTheme, Language } from '../context/ThemeContext';
import { X, Moon, Sun, Monitor, Type, LayoutTemplate, Globe, Check, EyeOff } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
];

export const Settings: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, uiSize, setUiSize, snapEnabled, toggleSnap, language, setLanguage, autoHideControls, toggleAutoHide, autoHideDuration, setAutoHideDuration, t } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-200 dark:ring-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('settings.title')}</h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50 space-y-6">
                
                {/* Theme Toggle */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Monitor size={20} className="text-slate-400" /> {t('settings.theme')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => theme === 'dark' && toggleTheme()}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-slate-800 dark:border-brand-400 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            <Sun size={28} />
                            <span className="font-bold text-sm">{t('common.light_mode')}</span>
                        </button>
                        <button 
                            onClick={() => theme === 'light' && toggleTheme()}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-slate-800 dark:border-brand-400 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            <Moon size={28} />
                            <span className="font-bold text-sm">{t('common.dark_mode')}</span>
                        </button>
                    </div>
                </div>

                {/* Map Settings */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <LayoutTemplate size={20} className="text-slate-400" /> {t('settings.map_interface')}
                    </h3>

                    {/* Window Snapping */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{t('settings.snap')}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {t('settings.snap_desc')}
                            </p>
                        </div>
                        <div 
                            onClick={toggleSnap}
                            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${snapEnabled ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${snapEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Auto Hide Controls */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    {t('settings.autohide')} <EyeOff size={14} className="text-slate-400" />
                                </span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {t('settings.autohide_desc')}
                                </p>
                            </div>
                            <div 
                                onClick={toggleAutoHide}
                                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${autoHideControls ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${autoHideControls ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {autoHideControls && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                {[5000, 15000, 30000, 60000].map(ms => (
                                    <button
                                        key={ms}
                                        onClick={() => setAutoHideDuration(ms)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${autoHideDuration === ms ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        {ms / 1000}s
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Language */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-slate-400" /> {t('settings.language')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    language === lang.code 
                                    ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-900' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                            >
                                {lang.label}
                                {language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* UI Size */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Type size={20} className="text-slate-400" /> {t('settings.text_size')}
                    </h3>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['small', 'medium', 'large'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setUiSize(s)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all capitalize ${uiSize === s ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-slate-600 dark:text-slate-300">
                            The quick brown fox jumps over the lazy dog.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Backdrop Close Trigger */}
        <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
