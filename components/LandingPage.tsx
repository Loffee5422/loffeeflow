import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Calendar, Clock, Book, Settings as SettingsIcon } from 'lucide-react';
import { Settings } from './Settings';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-200 dark:selection:bg-brand-900">
      
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
          <a href="#about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Manifesto</a>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
                <SettingsIcon size={20} />
            </button>
            <button 
            onClick={onEnter}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
            >
            Enter Hub
            </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-32 md:pt-32 md:pb-48 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-8 border border-brand-100 dark:border-brand-800">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          v2.0 Now Live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 dark:text-white leading-[1.1]">
          Find your flow <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-400">in the noise.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          A digital suite designed to help you organize tasks, track habits, and focus on deep work.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onEnter}
            className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
          >
            Launch Suite <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Learn More
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Intentional Tasks</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Organize your day with a clutter-free task list. Prioritize what matters and clear your mind.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Focus Timer</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Built-in Pomodoro timer to help you enter flow state. Track your deep work sessions automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Book size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Journaling</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Capture thoughts, ideas, and reflections. A private space to clear your mind and document your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          © {new Date().getFullYear()} LoffeeFlow. Crafted for focus.
        </p>
      </footer>
    </div>
  );
};