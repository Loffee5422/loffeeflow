
import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Calendar, Timer, Settings as SettingsIcon } from 'lucide-react';
import { Settings } from './Settings';

interface LandingPageProps {
  onEnter: () => void;
  onNavigate: (screen: 'pricing' | 'help' | 'feedback' | 'landing') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onNavigate }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-200">
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white"><CheckCircle2 size={20} /></div>
          LoffeeFlow
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button onClick={() => onNavigate('pricing')} className="hover:text-brand-600 transition-colors">Pricing</button>
          <button onClick={() => onNavigate('help')} className="hover:text-brand-600 transition-colors">Help</button>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-slate-800 transition-all"><SettingsIcon size={20} /></button>
            <button onClick={onEnter} className="px-5 py-2.5 bg-brand-600 text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">Login</button>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Find your flow <br className="hidden md:block" />
          <span className="text-brand-600">in the noise.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">Dedicated daily planning for deep work. Organize tasks and find focus without the clutter.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onEnter} className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
            Launch App <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <section className="bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <FeatureCard icon={CheckCircle2} color="text-indigo-600" title="Smart Tasks" desc="Manual and intuitive task entry with nested sub-steps." />
            <FeatureCard icon={Timer} color="text-brand-600" title="Focus Timer" desc="Built-in session tracking to eliminate distractions." />
            <FeatureCard icon={Calendar} color="text-indigo-600" title="Calendar Sync" desc="Visualize your month and manage deadlines visually." />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, color, title, desc }: any) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-800 ${color}`}><Icon size={24} /></div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);
