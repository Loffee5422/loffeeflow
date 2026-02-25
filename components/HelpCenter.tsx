import React, { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Mail, BookOpen, MessageCircle } from 'lucide-react';

interface HelpCenterProps {
  onNavigate: (screen: 'landing' | 'app' | 'pricing' | 'help' | 'feedback') => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
        q: "How does the offline mode work?",
        a: "LoffeeFlow is designed " + "offline-first" + ". All your data is stored locally on your device instantly. If you are on the Pro plan, it syncs to the cloud whenever you reconnect to the internet."
    },
    {
        q: "Can I use LoffeeFlow on mobile?",
        a: "Yes! LoffeeFlow is a Progressive Web App (PWA). You can install it on your home screen from your browser menu for a native-like experience on iOS and Android."
    },
    {
        q: "How do I reset my data?",
        a: "You can clear your local data by clearing your browser cache. If you are synced to the cloud, you can delete your account from the Profile settings."
    },
    {
        q: "Is the Focus Timer accurate?",
        a: "Yes, the timer works even if you switch tabs (on most modern browsers). However, for the best reliability, keep the app open in a separate window."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
       <nav className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
        <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
        >
            <ArrowLeft size={20} /> Back
        </button>
        <div className="font-bold text-lg">Help Center</div>
        <div className="w-16"></div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">How can we help?</h1>
        
        <div className="relative mb-12">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <BookOpen className="text-brand-600 mb-3" size={32} />
                <h3 className="font-bold mb-1">Guides</h3>
                <p className="text-sm text-slate-500">Learn the basics</p>
            </div>
             <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <MessageCircle className="text-purple-600 mb-3" size={32} />
                <h3 className="font-bold mb-1">Community</h3>
                <p className="text-sm text-slate-500">Join the discord</p>
            </div>
             <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <Mail className="text-rose-600 mb-3" size={32} />
                <h3 className="font-bold mb-1">Email Us</h3>
                <p className="text-sm text-slate-500">Get direct support</p>
            </div>
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
            {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <button 
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left font-medium py-2 hover:text-brand-600 transition-colors"
                    >
                        {faq.q}
                        {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openFaq === idx && (
                        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed animate-in slide-in-from-top-2">
                            {faq.a}
                        </p>
                    )}
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};