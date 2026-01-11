
import React, { useState } from 'react';
import { LayoutGrid, Settings as SettingsIcon, CheckCircle2, User as UserIcon, Crown, ArrowLeft, Cloud, Check, AlertCircle, RefreshCw, CloudOff, Network, List, Calendar } from 'lucide-react';
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
  onExit: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, onExit }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, subscriptionTier } = useAuth();
  const { isCloudSynced, syncStatus } = useTasks();
  const { t } = useTheme();

  const navItems = [
    { id: 'dashboard', label: t('nav.list'), icon: List },
    { id: 'calendar', label: t('nav.calendar'), icon: Calendar },
    { id: 'map', label: t('nav.map'), icon: Network },
  ] as const;

  // Sync Indicator Helper
  const getSyncStatusContent = () => {
     if (!isCloudSynced) {
         return { icon: CloudOff, color: 'text-slate-400', label: t('nav.sync_local') };
     }
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
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onExit={onExit} />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-white dark:bg-slate-900 m-4 rounded-3xl shadow-soft border border-slate-100/50 dark:border-slate-800 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-transparent">
            <button 
                onClick={onExit}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title={t('common.back')}
            >
                <ArrowLeft size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <CheckCircle2 size={18} className="text-white" />
                </div>
                <div>
                    <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white block leading-none">{t('nav.focus')}</span>
                </div>
            </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 flex flex-col items-center lg:items-stretch">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-12 h-12 lg:w-full lg:h-auto flex items-center justify-center lg:justify-start gap-4 px-0 lg:px-5 py-0 lg:py-3.5 rounded-2xl transition-all duration-300 group ${
                currentView === item.id 
                ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-semibold shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon 
                size={22} 
                className={`transition-colors ${currentView === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} 
                strokeWidth={currentView === item.id ? 2.5 : 2}
              />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 mt-auto space-y-3 flex flex-col items-center lg:items-stretch">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-12 h-12 lg:w-full lg:h-auto flex items-center justify-center lg:justify-start gap-4 px-0 lg:px-5 py-0 lg:py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
                title={t('nav.settings')}
            >
                <SettingsIcon size={22} />
                <span className="hidden lg:inline font-medium">{t('nav.settings')}</span>
            </button>

            <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-12 h-12 lg:w-full lg:h-auto flex items-center justify-center lg:justify-start gap-3 p-0 lg:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700 group text-left relative"
            >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={20} className="text-slate-400" />
                    )}
                    {subscriptionTier === 'PRO' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Crown size={14} className="text-amber-400 drop-shadow-sm" fill="currentColor" />
                        </div>
                    )}
                    
                    {/* Condensed Status Indicator for Small Sidebar */}
                    <div className="lg:hidden absolute bottom-0 right-0 w-3 h-3 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                         <div className={`w-2 h-2 rounded-full ${isCloudSynced && syncStatus === 'SYNCING' ? 'bg-brand-500 animate-pulse' : isCloudSynced && syncStatus === 'ERROR' ? 'bg-rose-500' : isCloudSynced ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                </div>
                <div className="hidden lg:block flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {user ? (user.displayName || user.email) : "Guest"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <syncInfo.icon size={10} className={syncInfo.color} />
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{syncInfo.label}</span>
                    </div>
                </div>
            </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 px-4 flex items-center justify-between shadow-sm transition-colors">
         <div className="flex items-center gap-3">
            <button 
                onClick={onExit}
                className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <CheckCircle2 size={18} />
                </div>
                <span className="font-bold text-lg text-slate-800 dark:text-white">{t('nav.focus')}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
             <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
             >
                 <span className={`text-[10px] font-bold uppercase ${syncInfo.color}`}>{syncInfo.label === 'Saved' ? 'Sync' : syncInfo.label}</span>
                 <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-slate-500" />}
                 </div>
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                <LayoutGrid size={20} />
             </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-24 px-6 animate-in fade-in slide-in-from-top-10 duration-200 flex flex-col pb-6">
            <nav className="space-y-3 flex-1">
                 {navItems.map(item => (
                    <button
                    key={item.id}
                    onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-lg transition-colors ${
                        currentView === item.id 
                        ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-semibold' 
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    }`}
                    >
                    <item.icon size={24} className={currentView === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'} />
                    <span className="">{item.label}</span>
                    </button>
                ))}
            </nav>
            
            <button
                onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 mt-4"
            >
                <SettingsIcon size={24} className="text-slate-400" />
                <span>{t('nav.settings')}</span>
            </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:py-4 md:pr-4 pt-16 relative">
        <div className="h-full w-full md:bg-white md:dark:bg-slate-900 md:rounded-3xl md:shadow-soft md:border md:border-slate-100/50 md:dark:border-slate-800 overflow-hidden transition-colors duration-300 relative">
            {children}
        </div>
      </main>
    </div>
  );
};
