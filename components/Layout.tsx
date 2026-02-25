
import React, { useState } from 'react';
import { Settings as SettingsIcon, CheckCircle2, User as UserIcon, Crown, Cloud, Check, AlertCircle, RefreshCw, CloudOff, List, Calendar, Timer } from 'lucide-react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Settings } from './Settings';
import { ProfileModal } from './ProfileModal';

interface LayoutProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, subscriptionTier } = useAuth();
  const { isCloudSynced, syncStatus } = useTasks();
  const { t } = useTheme();

  const navItems = [
    { id: 'dashboard', label: t('nav.list'), icon: List },
    { id: 'calendar', label: t('nav.calendar'), icon: Calendar },
    { id: 'focus', label: t('nav.focus'), icon: Timer },
  ] as const;

  const getSyncStatusContent = () => {
     if (!isCloudSynced) return { icon: CloudOff, color: 'text-slate-400', label: t('nav.sync_local') };
     switch(syncStatus) {
         case 'SYNCING': return { icon: RefreshCw, color: 'text-brand-500 animate-spin', label: t('nav.sync_syncing') };
         case 'SAVED': return { icon: Check, color: 'text-emerald-500', label: t('nav.sync_saved') };
         case 'ERROR': return { icon: AlertCircle, color: 'text-rose-500', label: t('nav.sync_error') };
         default: return { icon: Cloud, color: 'text-slate-400', label: t('nav.sync_synced') };
     }
  };

  const syncInfo = getSyncStatusContent();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-white dark:bg-slate-900 m-4 rounded-3xl shadow-soft border border-slate-100/50 dark:border-slate-800 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={20} />
            </div>
            <div className="hidden lg:block"><span className="text-lg font-bold tracking-tight">LoffeeFlow</span></div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 flex flex-col items-center lg:items-stretch">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-12 h-12 lg:w-full lg:h-auto flex items-center justify-center lg:justify-start gap-4 px-0 lg:px-5 py-0 lg:py-3.5 rounded-2xl transition-all duration-300 group ${
                currentView === item.id 
                ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-semibold' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={22} className={currentView === item.id ? 'text-brand-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-3 flex flex-col items-center lg:items-stretch">
            <button onClick={() => setIsSettingsOpen(true)} className="w-12 h-12 lg:w-full lg:h-auto flex items-center justify-center lg:justify-start gap-4 px-0 lg:px-5 py-0 lg:py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all">
                <SettingsIcon size={22} />
                <span className="hidden lg:inline font-medium">{t('nav.settings')}</span>
            </button>

            <button onClick={() => setIsProfileOpen(true)} className="w-12 h-12 lg:w-full lg:h-auto flex items-center justify-center lg:justify-start gap-3 p-0 lg:p-3 rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all group relative">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-slate-400" />}
                    {subscriptionTier === 'PRO' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Crown size={14} className="text-amber-400" fill="currentColor" /></div>}
                </div>
                <div className="hidden lg:block flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold truncate text-slate-700 dark:text-slate-200">{user ? (user.displayName || user.email) : "Guest"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5"><syncInfo.icon size={10} className={syncInfo.color} /><span className="text-xs text-slate-500 dark:text-slate-400 truncate">{syncInfo.label}</span></div>
                </div>
            </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto md:py-4 md:pr-4 pt-16 relative">
        <div className="h-full w-full md:bg-white md:dark:bg-slate-900 md:rounded-3xl md:shadow-soft md:border md:border-slate-100/50 md:dark:border-slate-800 overflow-hidden transition-colors duration-300 relative">
            {children}
        </div>
      </main>
    </div>
  );
};
