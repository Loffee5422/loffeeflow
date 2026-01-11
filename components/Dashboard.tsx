
import React, { useMemo, useState, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { SmartAdd } from './SmartAdd';
import { EditTaskModal } from './EditTaskModal';
import { Check, Trash2, Calendar as CalendarIcon, Repeat, Pencil, CheckSquare, ChevronRight, ChevronDown, Plus, Star, Trophy } from 'lucide-react';
import { Task, TaskStatus, SubTask } from '../types';
import { RecursiveSubTaskItem } from './RecursiveSubTaskItem';
import { 
    updateSubtaskInTree, 
    deleteSubtaskFromTree, 
    countSubtasks, 
    toggleSubtaskInTree, 
    generateId,
    insertSiblingAfter,
    indentSubtask,
    outdentSubtask,
    findPredecessor
} from '../utils/taskUtils';

// --- Components ---

export const Dashboard: React.FC = () => {
  const { tasks, toggleTaskStatus, deleteTask, updateTask } = useTasks();
  const { t } = useTheme();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Get Today's Date String (YYYY-MM-DD)
  const today = new Date();
  const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const { todayTodos, otherTodos, completedTasks, isTodayCelebration } = useMemo(() => {
      const active = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
      const done = tasks.filter(t => t.status === TaskStatus.COMPLETED);
      
      // Sort logic
      const sortFn = (a: Task, b: Task) => {
        if (a.starLevel !== b.starLevel) return b.starLevel - a.starLevel;
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        if (dateA !== dateB) return dateA - dateB;
        return b.createdAt - a.createdAt;
      };

      const sortedActive = [...active].sort(sortFn);
      
      const today = sortedActive.filter(t => t.dueDate === localDateStr);
      const other = sortedActive.filter(t => t.dueDate !== localDateStr);
      
      // Check for Celebration: 
      // 1. There are tasks assigned to today (completed or active).
      // 2. ZERO are active.
      const allTodayAssigned = tasks.filter(t => t.dueDate === localDateStr);
      const isTodayCelebration = allTodayAssigned.length > 0 && today.length === 0;

      return {
          todayTodos: today,
          otherTodos: other,
          completedTasks: [...done].sort((a, b) => b.createdAt - a.createdAt),
          isTodayCelebration
      };
  }, [tasks, localDateStr]);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleSaveEdit = useCallback((id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  }, [updateTask]);

  return (
    <div className="w-full px-4 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">{t('dashboard.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('dashboard.subtitle')}</p>
      </header>

      <SmartAdd />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN (2/3): Today's Focus - Most Obvious Area */}
        <div className="lg:col-span-2">
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2">
                        {t('dashboard.today_section')}
                    </h2>
                    {todayTodos.length > 0 && (
                        <span className="bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded-full">{todayTodos.length}</span>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border-2 border-brand-100 dark:border-brand-900/50 shadow-soft dark:shadow-none min-h-[150px] flex flex-col justify-center">
                    {isTodayCelebration ? (
                        <div className="text-center py-8 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200 dark:shadow-amber-900/20 text-white">
                                <Trophy size={32} fill="currentColor" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{t('dashboard.all_done')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px] mx-auto leading-relaxed">
                                {t('dashboard.all_done_desc')}
                            </p>
                        </div>
                    ) : todayTodos.length > 0 ? (
                        <div className="space-y-2">
                            {todayTodos.map(task => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    onToggle={toggleTaskStatus} 
                                    onDelete={deleteTask} 
                                    onEdit={handleEdit}
                                    onUpdate={updateTask}
                                    highlight
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl m-2">
                            <p className="text-sm font-medium">{t('calendar.no_tasks')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>

        {/* RIGHT COLUMN (1/3): Sidebar for Upcoming & Done */}
        <div className="space-y-8">
            {/* INBOX / UPCOMING */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.upcoming')}</h2>
                 {otherTodos.length > 0 && (
                     <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{otherTodos.length}</span>
                 )}
              </div>
              
              <div className="space-y-3">
                {otherTodos.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="text-slate-300 dark:text-slate-700 text-xs font-medium italic">{t('dashboard.no_active')}</p>
                    </div>
                )}
                {otherTodos.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTaskStatus} 
                    onDelete={deleteTask} 
                    onEdit={handleEdit}
                    onUpdate={updateTask}
                  />
                ))}
              </div>
            </section>

            {/* DONE */}
            {completedTasks.length > 0 && (
              <section className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">{t('dashboard.done')}</h2>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={toggleTaskStatus} 
                        onDelete={deleteTask} 
                        onEdit={handleEdit}
                        onUpdate={updateTask}
                    />
                  ))}
                </div>
              </section>
            )}
        </div>

      </div>

      <EditTaskModal 
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

// --- Main Task Item Component ---

const TaskItem: React.FC<{ 
    task: Task; 
    onToggle: (id: string) => void; 
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    highlight?: boolean;
}> = React.memo(({ task, onToggle, onDelete, onEdit, onUpdate, highlight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoFocusId, setAutoFocusId] = useState<string | undefined>(undefined);
  const { t } = useTheme();

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const subtasks = task.subtasks || [];
  
  const { total: totalSub, completed: completedSub } = countSubtasks(subtasks);
  const hasSubtasks = subtasks.length > 0;

  // --- Handlers for "Outliner" Logic ---

  const handleSubtaskChange = (id: string, title: string) => {
      onUpdate(task.id, { subtasks: updateSubtaskInTree(subtasks, id, { title }) });
  };

  const handleSubtaskToggle = (id: string) => {
      onUpdate(task.id, { subtasks: toggleSubtaskInTree(subtasks, id) });
  };

  const handleSubtaskDelete = (id: string) => {
      const prevId = findPredecessor(subtasks, id);
      onUpdate(task.id, { subtasks: deleteSubtaskFromTree(subtasks, id) });
      if (prevId) {
          setAutoFocusId(prevId);
      }
  };

  const handleInsertAfter = (targetId: string) => {
      const { newTree, newId } = insertSiblingAfter(subtasks, targetId);
      onUpdate(task.id, { subtasks: newTree });
      setAutoFocusId(newId);
  };

  const handleIndent = (targetId: string) => {
      const newTree = indentSubtask(subtasks, targetId);
      if (JSON.stringify(newTree) !== JSON.stringify(subtasks)) {
        onUpdate(task.id, { subtasks: newTree });
        setAutoFocusId(targetId);
      }
  };

  const handleOutdent = (targetId: string) => {
      const newTree = outdentSubtask(subtasks, targetId);
      if (JSON.stringify(newTree) !== JSON.stringify(subtasks)) {
        onUpdate(task.id, { subtasks: newTree });
        setAutoFocusId(targetId);
      }
  };

  const startAddingFirstSubtask = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(true);
      const newId = generateId();
      const newSub: SubTask = { id: newId, title: "", completed: false };
      onUpdate(task.id, { subtasks: [...subtasks, newSub] });
      setAutoFocusId(newId);
  };

  // --- Star Logic ---
  const handleStarToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdate(task.id, { starLevel: task.starLevel === 1 ? 0 : 1 });
  };

  const getStarConfig = (level: number) => {
    switch(level) {
        case 1: return { icon: Star, color: 'text-yellow-500 fill-yellow-500' };
        default: return { icon: Star, color: 'text-slate-300 dark:text-slate-600' };
    }
  };

  const starConfig = getStarConfig(task.starLevel);
  const StarIcon = starConfig.icon;

  const getContainerClasses = () => {
      if (isCompleted) return 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800';
      
      // Special style for Today Highlight
      if (highlight) {
          return 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800';
      }

      switch(task.starLevel) {
          case 1: return 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50 shadow-sm';
          default: return 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-100 dark:hover:border-brand-900';
      }
  };
  
  return (
    <div className={`group relative transition-all duration-300 ${isCompleted ? 'opacity-75' : ''}`}>
        <div className={`relative z-10 flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${getContainerClasses()}`}>
            
            {/* Main Task Row */}
            <div className="flex items-start gap-3 p-4 relative z-10">
                {/* Tree Toggle */}
                <div className="mt-1 -ml-1 flex-shrink-0">
                    {hasSubtasks ? (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <div className="w-5 h-5" /> 
                    )}
                </div>

                {/* Checkbox */}
                <button 
                    onClick={() => onToggle(task.id)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : highlight 
                            ? 'border-brand-400 dark:border-brand-500 hover:border-brand-600 hover:bg-brand-50 text-transparent'
                            : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-500 text-transparent'
                    }`}
                >
                    <Check size={12} strokeWidth={3} />
                </button>
            
                <div className="flex-1 min-w-0" onClick={() => (hasSubtasks) && !isExpanded && setIsExpanded(true)}>
                    <div className="flex items-start justify-between gap-2">
                         <h3 className={`font-semibold text-sm md:text-base leading-snug break-words cursor-pointer ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'} ${task.starLevel > 0 ? 'text-lg' : ''}`}>
                             {task.title}
                         </h3>
                         
                         {/* Interactive Star Toggle */}
                         <button 
                             onClick={handleStarToggle}
                             className={`shrink-0 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${task.starLevel > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                             title={t('task.priority')}
                         >
                             <StarIcon size={16} className={starConfig.color} />
                         </button>
                    </div>
                    
                    {task.description && (
                        <p className={`text-xs mt-1 truncate cursor-pointer ${isCompleted ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2 cursor-default">
                        
                        {task.recurrence && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center gap-1">
                            <Repeat size={10} />
                            {task.recurrence.type}
                        </span>
                        )}

                        {totalSub > 0 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-all ${completedSub === totalSub ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <CheckSquare size={10} />
                                <span>{completedSub}/{totalSub}</span>
                            </button>
                        )}

                        {task.dueDate && (
                            <div className={`flex items-center gap-1 text-[10px] font-medium ml-auto ${highlight ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                <CalendarIcon size={12} />
                                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(task)} 
                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    >
                        <Pencil size={14} />
                    </button>
                    <button 
                        onClick={() => onDelete(task.id)} 
                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            
            {/* Recursive Subtasks Tree */}
            {isExpanded && hasSubtasks && (
                <div className="bg-slate-50/30 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/50 pb-2 relative animate-in slide-in-from-top-2 duration-200">
                    <div className="pl-10 pr-4 py-2 relative">
                        {subtasks.map((sub, index) => (
                            <RecursiveSubTaskItem 
                                key={sub.id}
                                subtask={sub}
                                onToggle={handleSubtaskToggle}
                                onChange={handleSubtaskChange}
                                onDelete={handleSubtaskDelete}
                                onInsertAfter={handleInsertAfter}
                                onIndent={handleIndent}
                                onOutdent={handleOutdent}
                                autoFocusId={autoFocusId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Add Subtask Trigger (Only if no subtasks exist yet, to start the chain) */}
        {!isCompleted && !hasSubtasks && (
            <button 
                onClick={startAddingFirstSubtask}
                className="absolute -bottom-2 right-4 z-20 px-2 py-1 rounded-full bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 translate-y-2 group-hover:translate-y-0 flex items-center gap-1"
                title={t('task.add_step')}
            >
                <Plus size={12} strokeWidth={3} />
                <span className="hidden sm:inline">{t('task.add_step')}</span>
            </button>
        )}
    </div>
  );
});
