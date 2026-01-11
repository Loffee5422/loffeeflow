import React, { useRef, useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, TaskStatus } from '../types';
import { format, addDays, isSameMonth, isToday } from 'date-fns';
import { ChevronRight, Maximize2 } from 'lucide-react';

interface TimelineWheelProps {
    onExpand: () => void;
}

export const TimelineWheel: React.FC<TimelineWheelProps> = ({ onExpand }) => {
    const { getTasksByDate } = useTasks();
    const containerRef = useRef<HTMLDivElement>(null);
    const [days, setDays] = useState<Date[]>([]);
    
    // Generate range of dates (e.g., -5 days to +60 days)
    useEffect(() => {
        const d = [];
        const start = addDays(new Date(), -5);
        for (let i = 0; i < 90; i++) {
            d.push(addDays(start, i));
        }
        setDays(d);
    }, []);

    // Scroll to today on mount
    useEffect(() => {
        if (containerRef.current) {
            // Simple timeout to ensure render
            setTimeout(() => {
                const todayEl = containerRef.current?.querySelector('[data-is-today="true"]');
                if (todayEl) {
                    todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [days]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-20">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Timeline</h3>
                <button 
                    onClick={onExpand}
                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Open Full Calendar"
                >
                    <Maximize2 size={18} />
                </button>
            </div>

            {/* Scroll Area */}
            <div 
                ref={containerRef} 
                className="flex-1 overflow-y-auto relative scroll-smooth p-4 space-y-6"
            >
                {days.map((date, index) => {
                    const tasks = getTasksByDate(date);
                    const showMonthHeader = index === 0 || !isSameMonth(date, days[index - 1]);
                    const isCurrent = isToday(date);
                    
                    return (
                        <div key={date.toISOString()} className="relative" data-is-today={isCurrent}>
                            {/* Sticky Month Header */}
                            {showMonthHeader && (
                                <div className="sticky top-0 z-10 py-2 mb-4 bg-gradient-to-b from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900">
                                    <h4 className="text-2xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">
                                        {format(date, 'MMMM yyyy')}
                                    </h4>
                                </div>
                            )}

                            <div className={`flex gap-4 group ${isCurrent ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition-opacity`}>
                                {/* Date Column */}
                                <div className="flex flex-col items-center w-12 shrink-0 pt-1">
                                    <span className={`text-xs font-bold uppercase ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {format(date, 'EEE')}
                                    </span>
                                    <span className={`text-xl font-bold leading-none mt-1 ${isCurrent ? 'text-brand-600 dark:text-brand-400 scale-110' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {format(date, 'd')}
                                    </span>
                                    <div className={`w-0.5 h-full min-h-[2rem] mt-2 rounded-full ${isCurrent ? 'bg-brand-200 dark:bg-brand-900' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                                </div>

                                {/* Tasks Column */}
                                <div className="flex-1 pb-6 space-y-2">
                                    {tasks.length === 0 ? (
                                        <div className="h-8 flex items-center">
                                            <span className="text-xs text-slate-300 dark:text-slate-700 italic">No tasks</span>
                                        </div>
                                    ) : (
                                        tasks.map(task => (
                                            <div 
                                                key={task.id} 
                                                className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${
                                                    task.status === TaskStatus.COMPLETED 
                                                    ? 'bg-slate-50 dark:bg-slate-800/50 opacity-60' 
                                                    : 'bg-white dark:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <span className={`text-sm font-medium line-clamp-2 ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {task.title}
                                                    </span>
                                                    {task.starLevel > 0 && task.status !== TaskStatus.COMPLETED && (
                                                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                                                            task.starLevel === 3 ? 'bg-rose-500' : 
                                                            task.starLevel === 2 ? 'bg-orange-500' : 'bg-yellow-500'
                                                        }`}></span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};