
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, AlignLeft, Star, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { TaskStatus } from '../types';

export const SmartAdd: React.FC = () => {
  const { t, language } = useTheme();
  const today = new Date();
  const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [starLevel, setStarLevel] = useState<number>(0);
  const [dueDate, setDueDate] = useState(''); // Default to no date
  
  const { addTask } = useTasks();
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (!title.trim()) {
            setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      starLevel: starLevel,
      status: TaskStatus.TODO,
      dueDate: dueDate || undefined, // Send undefined if empty
    });
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStarLevel(0);
    setDueDate('');
    setIsExpanded(false);
  };

  const handleExpand = () => {
      setIsExpanded(true);
  };

  const toggleStarLevel = () => {
      setStarLevel(prev => (prev + 1) % 2);
  };

  const setToday = () => {
      setDueDate(localDateStr);
  };

  const setTomorrow = () => {
      setDueDate(tomorrowDateStr);
  };

  // Format date for display
  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "No Date";
    if (dateStr === localDateStr) return t('common.today');
    if (dateStr === tomorrowDateStr) return t('common.tomorrow');
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(language, { month: 'short', day: 'numeric' });
  };

  const getStarConfig = (level: number) => {
      switch(level) {
          case 1: return { icon: Star, color: 'text-yellow-500 fill-yellow-500', label: t('task.important') };
          default: return { icon: Star, color: 'text-slate-300 dark:text-slate-600', label: 'Normal' };
      }
  };

  const currentStarConfig = getStarConfig(starLevel);
  const StarIcon = currentStarConfig.icon;

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-10 z-20">
        <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className={`group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-black/20 border border-slate-100 dark:border-slate-800 transition-all duration-300 relative overflow-hidden ${isExpanded ? 'p-6 ring-2 ring-brand-100 dark:ring-brand-900/50' : 'p-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)]'}`}
        >
            {/* Main Input Row */}
            <div className="flex items-center gap-3 w-full pl-2">
                <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isExpanded ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-slate-300 dark:border-slate-600'}`}>
                    {isExpanded && <Plus size={14} className="text-brand-600 dark:text-brand-400" />}
                </div>
                <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onFocus={handleExpand}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('smartadd.placeholder')}
                    className="flex-1 h-14 min-w-0 bg-transparent border-none outline-none text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg font-medium"
                />

                {/* Star Toggle - Always Visible */}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleStarLevel(); }}
                    className="p-2 mr-2 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={`${t('task.priority')}: ${currentStarConfig.label}`}
                >
                     <StarIcon size={20} className={`transition-all ${currentStarConfig.color}`} />
                </button>
                
                {!isExpanded && (
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="h-12 w-12 mr-1 shrink-0 flex items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="mt-2 pl-11 pr-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Description */}
                    <div className="relative mb-4">
                        <AlignLeft className="absolute left-0 top-3 text-slate-400 dark:text-slate-500" size={18} />
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('smartadd.description')}
                            className="w-full pl-7 py-2 text-sm text-slate-600 dark:text-slate-300 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-brand-200 dark:focus:border-brand-800 outline-none resize-none min-h-[2.5rem] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            rows={1}
                        />
                    </div>

                    {/* Controls Grid */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        
                        {/* Date Picker */}
                        <div className="relative group/date">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border transition-all ${dueDate ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-600' : 'bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                                <Calendar size={16} className={dueDate ? "text-slate-400 dark:text-slate-500" : "text-current"} />
                                <span>{getFormattedDate(dueDate)}</span>
                                {dueDate && (
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDueDate(''); }}
                                        className="ml-1 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400"
                                    >
                                        <X size={12} />
                                    </div>
                                )}
                            </div>
                            <input 
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0"
                            />
                        </div>

                        {/* Quick Date Buttons - Only show if no date selected */}
                        {!dueDate && (
                            <>
                                <button
                                    type="button"
                                    onClick={setToday}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                                >
                                    {t('common.today')}
                                </button>
                                <button
                                    type="button"
                                    onClick={setTomorrow}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                                >
                                    {t('common.tomorrow')}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                         <button 
                            type="button"
                            onClick={resetForm}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                         >
                             {t('common.cancel')}
                         </button>
                         <button
                            type="submit"
                            className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-brand-200 dark:shadow-none hover:bg-brand-700 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
                         >
                             {t('smartadd.add_task')} <Plus size={18} strokeWidth={3} />
                         </button>
                    </div>
                </div>
            )}
        </form>
    </div>
  );
};
