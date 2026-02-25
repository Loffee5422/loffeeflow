import React from 'react';
import { Github, Mail, Phone, MessageCircle, Instagram, ArrowRight, BookOpen, Briefcase, Cpu } from 'lucide-react';

interface PersonalCVPageProps {
  onNavigate: (screen: 'cv' | 'loffee') => void;
}

export const PersonalCVPage: React.FC<PersonalCVPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold tracking-tight text-lg">Andy Sun · 孙熙腾</div>
          <button
            onClick={() => onNavigate('loffee')}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:opacity-90 flex items-center gap-2"
          >
            Loffee Focus
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-14 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Andy Sun (孙熙腾) aka Loffee</h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium">
            Software Engineering Student – University of Auckland (Second Year)
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            I am a second-year Software Engineering student at the University of Auckland, seeking internship
            opportunities. I&apos;m eager to contribute to a real-world data / AI / Software development team while
            rapidly building new skills on the job.
          </p>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Mail size={22} className="text-brand-600" />
            Contact
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm md:text-base">
            <a href="mailto:lunl3458@gmail.com" className="flex items-center gap-2 hover:text-brand-600">
              <Mail size={18} />
              lunl3458@gmail.com (preferred)
            </a>
            <a href="tel:+6402108811816" className="flex items-center gap-2 hover:text-brand-600">
              <Phone size={18} />
              NZ: +64 02108811816
            </a>
            <a href="tel:+8613666061463" className="flex items-center gap-2 hover:text-brand-600">
              <Phone size={18} />
              CN: +86 13666061463
            </a>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              Discord: lmfao6
            </div>
            <a href="https://instagram.com/andysun2509937854" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-600">
              <Instagram size={18} />
              Instagram: andysun2509937854
            </a>
            <a href="https://github.com/Loffee5422" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-600">
              <Github size={18} />
              github.com/Loffee5422
            </a>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-brand-600" />
              Education
            </h2>
            <p className="font-semibold">University of Auckland</p>
            <p className="text-slate-600 dark:text-slate-300">Bachelor of Engineering (Hons), Software Engineering</p>
            <p className="text-slate-600 dark:text-slate-300">Second Year Undergraduate</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Cpu size={20} className="text-brand-600" />
              Technical Skills
            </h2>
            <ul className="space-y-2 text-slate-700 dark:text-slate-200 text-sm md:text-base">
              <li><span className="font-semibold">Languages &amp; Tools:</span> Python, SQL, Git</li>
              <li><span className="font-semibold">Data Science Libraries:</span> NumPy, Pandas, scikit-learn</li>
              <li><span className="font-semibold">Machine Learning &amp; Deep Learning:</span> PyTorch, Hugging Face Transformers</li>
              <li><span className="font-semibold">LLM Application Engineering:</span> LangChain</li>
              <li><span className="font-semibold">Dev/Ops:</span> Docker</li>
            </ul>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Briefcase size={22} className="text-brand-600" />
            Portfolio &amp; Projects
          </h2>
          <p className="mb-3">
            GitHub: <a className="text-brand-600 hover:underline" href="https://github.com/Loffee5422" target="_blank" rel="noreferrer">https://github.com/Loffee5422</a>
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-200">
            <li>Image classifier with PyTorch</li>
            <li>AI chatbot using LangChain + Hugging Face Transformers</li>
          </ul>
        </section>

        <section className="bg-brand-50 dark:bg-slate-900 border border-brand-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Loffee Focus</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Explore my productivity tool as a sub part of this website.
            </p>
          </div>
          <button
            onClick={() => onNavigate('loffee')}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:opacity-90 flex items-center gap-2"
          >
            Open Loffee Focus
            <ArrowRight size={18} />
          </button>
        </section>
      </main>
    </div>
  );
};
