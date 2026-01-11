
import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight, X, Plus, Star, CheckSquare, Square, Trash2, Pencil, AlignLeft, Calendar as CalendarIcon, CornerDownRight } from 'lucide-react';
import { Task, TaskStatus, SubTask } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { RecursiveSubTaskItem } from './RecursiveSubTaskItem';
import { updateSubtaskInTree, deleteSubtaskFromTree, addSubtaskToParent, toggleSubtaskInTree, generateId, updateSubtaskInTree as updateSubTitle } from '../utils/taskUtils';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, addTask, toggleTaskStatus, deleteTask, updateTask, getTasksByDate } = useTasks();
  const { t, language } = useTheme();

  // --- Modal States ---
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Derived state for viewing
  const viewingTask = tasks.find(t => t.id === viewingTaskId);
  
  // Quick Add State (Inside View Modal)
  const [quickTitle, setQuickTitle] = useState("");

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const totalSlots = firstDay + daysInMonth;
  const totalRows = Math.ceil(totalSlots / 7);

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }
  const remainingSlots = (totalRows * 7) - totalSlots;
  for (let i = 0; i < remainingSlots; i++) {
    daysArray.push(null);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const toLocalDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleOpenDayView = (date: Date) => {
    setSelectedDate(date);
    setQuickTitle("");
  };

  const handleQuickAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!quickTitle.trim() || !selectedDate) return;
      addTask({
          title: quickTitle,
          dueDate: toLocalDateStr(selectedDate),
          status: TaskStatus.TODO,
          starLevel: 0
      });
      setQuickTitle("");
  };

  const monthName = currentDate.toLocaleDateString(language, { month: 'long' });
  // Localized days of week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2023, 0, i + 1); // Jan 2023 started on Sunday
      return d.toLocaleDateString(language, { weekday: 'short' });
  });

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 relative bg-white dark:bg-slate-900">
      <header className="flex items-center justify-between py-4 shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight capitalize">
            {monthName} <span className="text-slate-400 dark:text-slate-500 font-medium">{year}</span>
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={handlePrevMonth} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
                <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button 
                onClick={handleNextMonth} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
                <ChevronRight size={20} strokeWidth={2.5} />
            </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 md:mb-4 shrink-0">
        {weekDays.map(d => (
            <div key={d} className="text-center text-[0.65rem] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {d}
            </div>
        ))}
      </div>

      <div 
        className="flex-1 grid grid-cols-7 gap-1 md:gap-4 min-h-0 pb-2 overflow-y-auto px-1"
        style={{ gridTemplateRows: `repeat(${Math.max(totalRows, 5)}, minmax(7.5rem, 1fr))` }}
      >
        {daysArray.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg md:rounded-2xl" />;
            
            const dayTasks = getTasksByDate(date);
            const dateStr = toLocalDateStr(date);
            const todayStr = toLocalDateStr(new Date());
            const isToday = dateStr === todayStr;

            return (
                <div 
                    key={date.toISOString()} 
                    onClick={() => handleOpenDayView(date)}
                    className={`relative p-1 md:p-3 rounded-lg md:rounded-2xl flex flex-col gap-1 md:gap-2 transition-all cursor-pointer group outline-none ring-offset-2 dark:ring-offset-slate-900 ${
                        isToday 
                        ? 'bg-brand-50/30 dark:bg-brand-900/20 ring-2 ring-brand-500 dark:ring-brand-400' 
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md'
                    }`}
                >
                    <div className="flex justify-between items-start shrink-0">
                        <span className={`text-xs md:text-sm font-semibold w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors ${
                            isToday 
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                            : 'text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                        }`}>
                            {date.getDate()}
                        </span>
                        
                        <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                             <Plus size={16} className="text-slate-400 hover:text-brand-500" />
                        </div>
                    </div>

                    {/* Task Pills (Desktop) */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0 px-1 py-0.5">
                        {dayTasks.slice(0, 3).map(task => (
                            <div 
                                key={task.id}
                                onClick={(e) => { e.stopPropagation(); setViewingTaskId(task.id); }}
                                className={`hidden md:flex w-full items-center gap-1.5 px-2 py-1 rounded-md text-[0.7rem] font-semibold transition-colors border shadow-sm ${
                                    task.status === TaskStatus.COMPLETED
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700 line-through'
                                    : task.starLevel > 0
                                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                                        : 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800'
                                }`}
                            >
                                {task.starLevel > 0 && <Star size={10} className="shrink-0" fill="currentColor" />}
                                <span className="truncate flex-1 text-left leading-tight">{task.title}</span>
                            </div>
                        ))}
                        {dayTasks.length > 3 && (
                            <div className="hidden md:block text-[0.65rem] text-slate-400 pl-1 font-medium">
                                +{dayTasks.length - 3} more
                            </div>
                        )}

                        {/* Mobile Dots */}
                        <div className="md:hidden flex flex-wrap gap-1 content-start mt-1">
                            {dayTasks.slice(0, 5).map(task => (
                                <div 
                                    key={task.id} 
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        task.status === TaskStatus.COMPLETED ? 'bg-slate-300 dark:bg-slate-700' :
                                        task.starLevel > 0 ? 'bg-amber-500' : 'bg-brand-500'
                                    }`}
                                />
                            ))}
                            {dayTasks.length > 5 && <span className="text-[0.6rem] text-slate-400 leading-none">+</span>}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Day View Modal */}
      {selectedDate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDate(null)}>
              <div 
                  className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                              {selectedDate.toLocaleDateString(language, { weekday: 'long' })}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                              {selectedDate.toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                      </div>
                      <button onClick={() => setSelectedDate(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50 dark:bg-slate-950/50">
                        {getTasksByDate(selectedDate).map(task => (
                            <div 
                                key={task.id} 
                                className={`flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all ${
                                    task.status === TaskStatus.COMPLETED 
                                    ? 'border-transparent opacity-60' 
                                    : 'border-slate-100 dark:border-slate-800 shadow-sm'
                                }`}
                            >
                                <button 
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className={`shrink-0 ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'}`}
                                >
                                    {task.status === TaskStatus.COMPLETED ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                                <div className="flex-1 min-w-0" onClick={() => setViewingTaskId(task.id)}>
                                    <p className={`text-sm font-medium truncate cursor-pointer ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {task.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {getTasksByDate(selectedDate).length === 0 && (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                                <p className="text-sm">{t('calendar.no_tasks')}</p>
                            </div>
                        )}
                  </div>

                  <form onSubmit={handleQuickAdd} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-2">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder={t('calendar.quick_add')} 
                                value={quickTitle}
                                onChange={(e) => setQuickTitle(e.target.value)}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none outline-none px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!quickTitle.trim()}
                                className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-200 dark:shadow-none disabled:opacity-50 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                  </form>
              </div>
          </div>
      )}

      {/* Task Detail View (Checklist Mode) */}
      {viewingTask && (
          <TaskDetailModal 
              task={viewingTask}
              onClose={() => setViewingTaskId(null)}
              onEdit={() => { setViewingTaskId(null); setEditingTask(viewingTask); }}
              onToggleStatus={() => toggleTaskStatus(viewingTask.id)}
              onDelete={() => { deleteTask(viewingTask.id); setViewingTaskId(null); }}
              onUpdate={(updates) => updateTask(viewingTask.id, updates)}
          />
      )}

      {/* Full Edit Modal */}
      <EditTaskModal 
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={(id, updates) => updateTask(id, updates)}
      />
    </div>
  );
};

// Internal component for the detailed view
const TaskDetailModal: React.FC<{
    task: Task;
    onClose: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<Task>) => void;
}> = ({ task, onClose, onEdit, onToggleStatus, onDelete, onUpdate }) => {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { t, language } = useTheme();

    const handleSubtaskToggle = (subId: string) => {
        onUpdate({ subtasks: toggleSubtaskInTree(task.subtasks || [], subId) });
    };

    const handleSubtaskEdit = (subId: string, title: string) => {
        onUpdate({ subtasks: updateSubTitle(task.subtasks || [], subId, { title }) });
    };

    const handleSubtaskDelete = (subId: string) => {
        onUpdate({ subtasks: deleteSubtaskFromTree(task.subtasks || [], subId) });
    };

    const handleAddNested = (parentId: string, title: string) => {
        const newSub: SubTask = { id: generateId(), title, completed: false };
        onUpdate({ subtasks: addSubtaskToParent(task.subtasks || [], parentId, newSub) });
    };

    const handleAddRoot = () => {
        if(!newSubtaskTitle.trim()) return;
        const newSub: SubTask = { id: generateId(), title: newSubtaskTitle.trim(), completed: false };
        onUpdate({ subtasks: [...(task.subtasks || []), newSub] });
        setNewSubtaskTitle("");
    };

    const isCompleted = task.status === TaskStatus.COMPLETED;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-100 dark:ring-slate-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex gap-4 pr-4">
                        <button 
                            onClick={onToggleStatus}
                            className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-500 text-transparent'
                            }`}
                        >
                            <CheckSquare size={16} strokeWidth={3} />
                        </button>
                        <div>
                            <h3 className={`text-xl font-bold leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                {task.title}
                            </h3>
                            {task.dueDate && (
                                <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    <CalendarIcon size={14} />
                                    <span>{new Date(task.dueDate).toLocaleDateString(language, { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 p-6 space-y-6">
                    {task.description && (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <AlignLeft size={12} /> {t('task.description')}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('task.checklist')}</h4>
                            <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                {task.subtasks?.filter(s => s.completed).length || 0} / {task.subtasks?.length || 0}
                            </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-2 space-y-1">
                                {task.subtasks?.map((sub, index) => (
                                    <RecursiveSubTaskItem 
                                        key={sub.id}
                                        index={index}
                                        subtask={sub}
                                        variant="simple"
                                        onToggle={handleSubtaskToggle}
                                        onEdit={handleSubtaskEdit}
                                        onDelete={handleSubtaskDelete}
                                        onAdd={handleAddNested}
                                    />
                                ))}
                                {(!task.subtasks || task.subtasks.length === 0) && (
                                    <p className="text-center text-sm text-slate-400 italic py-4">{t('task.no_subtasks')}</p>
                                )}
                            </div>
                            
                            {/* Quick Add Subtask */}
                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3">
                                <div className="flex items-center gap-2">
                                    <CornerDownRight size={16} className="text-slate-400 ml-2" />
                                    <input 
                                        ref={inputRef}
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRoot()}
                                        placeholder={t('task.add_step')}
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                    />
                                    <button 
                                        onClick={handleAddRoot}
                                        disabled={!newSubtaskTitle.trim()}
                                        className="p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <button 
                        onClick={onDelete}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <Trash2 size={16} /> {t('common.delete')}
                    </button>
                    
                    <button 
                        onClick={onEdit}
                        className="py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                        <Pencil size={16} /> {t('task.edit_details')}
                    </button>
                </div>
            </div>
        </div>
    );
};
