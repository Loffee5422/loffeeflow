
import React from 'react';
import { useTheme, Language } from '../context/ThemeContext';
import { X, Moon, Sun, Monitor, Type, LayoutTemplate, Globe, Check, EyeOff, Trash2 } from 'lucide-react';

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
  const { theme, toggleTheme, uiSize, setUiSize, language, setLanguage, autoDeleteOverdue, toggleAutoDeleteOverdue, t } = useTheme();
  
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

                {/* Auto Delete Toggle */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                         <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Trash2 size={20} className="text-slate-400" /> {t('settings.auto_delete')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('settings.auto_delete_hint')}</p>
                         </div>
                         <button 
                            onClick={toggleAutoDeleteOverdue}
                            className={`w-12 h-7 rounded-full transition-colors relative ${autoDeleteOverdue ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                         >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoDeleteOverdue ? 'left-6' : 'left-1'}`}></div>
                         </button>
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
