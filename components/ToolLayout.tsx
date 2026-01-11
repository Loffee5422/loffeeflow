import React, { useState } from 'react';
import { ArrowLeft, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Settings } from './Settings';

interface ToolLayoutProps {
  title: string;
  icon: React.ElementType;
  color: string;
  onExit: () => void;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ title, icon: Icon, color, onExit, children }) => {
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
             <button 
                onClick={onExit} 
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
             >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={20} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
             </div>
        </div>

        <div className="flex items-center gap-2">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
             >
                 <SettingsIcon size={20} />
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><UserIcon size={16} /></div>}
             </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};