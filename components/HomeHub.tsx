
import React, { useState } from 'react';
import { CheckCircle2, Lightbulb, HardDrive, Dices, User as UserIcon, LogOut, ArrowLeft, Crown, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ProfileModal } from './ProfileModal';
import { Settings } from './Settings';

interface HomeHubProps {
  onLaunchApp: (appId: 'focus' | 'brainstorm' | 'storage' | 'tools') => void;
  onBack: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({ onLaunchApp, onBack }) => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const apps = [
    {
      id: 'focus',
      name: 'Loffee Focus',
      description: t('hub.app.focus'),
      icon: CheckCircle2,
      color: 'bg-indigo-600',
      active: true,
    },
    {
      id: 'brainstorm',
      name: 'Brainstorm',
      description: t('hub.app.brainstorm'),
      icon: Lightbulb,
      color: 'bg-amber-500',
      active: true,
    },
    {
      id: 'storage',
      name: 'Loffee Vault',
      description: t('hub.app.vault'),
      icon: HardDrive,
      color: 'bg-emerald-500',
      active: true,
    },
    {
      id: 'tools',
      name: 'Mini Tools',
      description: t('hub.app.tools'),
      icon: Dices,
      color: 'bg-rose-500',
      active: true,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onExit={onBack} />
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft size={20} />
             </button>
             <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="14.31" y1="8" x2="20.05" y2="17.94"/>
                    <line x1="9.69" y1="8" x2="21.17" y2="8"/>
                    <line x1="7.38" y1="12" x2="13.12" y2="2.06"/>
                    <line x1="9.69" y1="16" x2="3.95" y2="6.06"/>
                    <line x1="14.31" y1="16" x2="2.83" y2="16"/>
                    <line x1="16.62" y1="12" x2="10.88" y2="21.94"/>
                    </svg>
                </div>
                LoffeeFlow
             </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title={t('nav.settings')}
            >
                 <SettingsIcon size={20} />
             </button>

             <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-sm group"
             >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden md:block">
                    {user ? (user.displayName || 'Account') : 'Guest'}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-slate-500" />}
                </div>
             </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                {t('hub.welcome')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t('hub.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
                <button
                    key={app.id}
                    disabled={!app.active}
                    onClick={() => app.active && onLaunchApp(app.id as any)}
                    className={`group relative flex flex-col p-6 rounded-3xl border text-left transition-all duration-300 ${
                        app.active 
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-xl hover:-translate-y-1' 
                        : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 opacity-70 cursor-not-allowed'
                    }`}
                >
                    <div className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                        <app.icon size={28} strokeWidth={2.5} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        {app.name}
                        {!app.active && <span className="text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full tracking-wide">{t('hub.soon')}</span>}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {app.description}
                    </p>

                    {app.active && (
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 dark:text-slate-600">
                             <ArrowLeft className="rotate-180" size={24} />
                        </div>
                    )}
                </button>
            ))}
        </div>
      </main>
      
    </div>
  );
};
