import React from 'react';
import { Check, X, ArrowLeft, Coffee, Crown } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (screen: 'landing' | 'app' | 'pricing' | 'help' | 'feedback') => void;
  onEnter: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
        >
            <ArrowLeft size={20} /> Back
        </button>
        <div className="font-bold text-xl tracking-tight">LoffeeFlow Pricing</div>
        <div className="w-16"></div> {/* Spacer */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white">Simple, transparent pricing.</h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Start for free, upgrade for sync. No hidden fees.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="mb-8">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-600 dark:text-slate-300">
                        <Coffee size={24} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Barista</h2>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold">$0</span>
                        <span className="text-slate-500 font-medium">/ forever</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4">Perfect for local use on a single device.</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                        <Check className="text-emerald-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Unlimited Local Tasks</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="text-emerald-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Focus Timer & Stats</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="text-emerald-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Basic Journaling</span>
                    </li>
                    <li className="flex items-start gap-3 opacity-50">
                        <X className="text-slate-300 shrink-0" size={20} />
                        <span className="text-sm text-slate-400">Cloud Sync</span>
                    </li>
                </ul>

                <button 
                    onClick={onEnter}
                    className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                    Use for Free
                </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-brand-500 dark:border-brand-500 shadow-xl shadow-brand-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                <div className="mb-8">
                    <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                        <Crown size={24} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Connoisseur</h2>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold">$4</span>
                        <span className="text-slate-500 font-medium">/ month</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4">Sync across all your devices.</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                        <Check className="text-brand-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Everything in Free</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="text-brand-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Multi-device Cloud Sync</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="text-brand-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Priority Support</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="text-brand-500 shrink-0" size={20} />
                        <span className="text-sm font-medium">Early Access Features</span>
                    </li>
                </ul>

                <button 
                    onClick={onEnter}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-lg shadow-brand-500/20"
                >
                    Start 14-Day Trial
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};