import React, { useState } from 'react';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';

interface FeedbackProps {
  onNavigate: (screen: 'landing' | 'app' | 'pricing' | 'help' | 'feedback') => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      // In a real app, send to API here
      setTimeout(() => {
          onNavigate('landing');
      }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
       <nav className="w-full px-6 h-20 flex items-center shrink-0">
        <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
        >
            <ArrowLeft size={20} /> Back
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            {submitted ? (
                <div className="text-center py-12 animate-in fade-in zoom-in">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                    <p className="text-slate-500">Thanks for helping us improve.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Feedback</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">We read every message.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                            <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50">
                                <option>General Feedback</option>
                                <option>Bug Report</option>
                                <option>Feature Request</option>
                                <option>Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                            <textarea 
                                required
                                rows={5}
                                placeholder="Tell us what you think..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            Send Feedback <Send size={18} />
                        </button>
                    </form>
                </>
            )}
        </div>
      </main>
    </div>
  );
};