
import React, { useState, useEffect } from 'react';
import { X, Calendar, AlignLeft, Save, CheckSquare, Plus, CornerDownRight, Star } from 'lucide-react';
import { Task, SubTask } from '../types';
import { useTheme } from '../context/ThemeContext';
import { updateSubtaskInTree, deleteSubtaskFromTree, addSubtaskToParent, toggleSubtaskInTree, generateId } from '../utils/taskUtils';
import { RecursiveSubTaskItem } from './RecursiveSubTaskItem';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const { t } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [starLevel, setStarLevel] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  
  // Local state for adding root subtasks
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingRoot, setIsAddingRoot] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStarLevel(task.starLevel);
      setDueDate(task.dueDate || '');
      setSubtasks(task.subtasks || []);
      setNewSubtaskTitle("");
      setIsAddingRoot(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      starLevel,
      dueDate: dueDate || undefined,
      subtasks
    });
    onClose();
  };

  const toggleSubtask = (subId: string) => {
      setSubtasks(prev => toggleSubtaskInTree(prev, subId));
  };

  const deleteSubtask = (subId: string) => {
      setSubtasks(prev => deleteSubtaskFromTree(prev, subId));
  };

  const addRootSubtask = () => {
      if (!newSubtaskTitle.trim()) return;
      const newSub: SubTask = {
          id: generateId(),
          title: newSubtaskTitle.trim(),
          completed: false
      };
      setSubtasks(prev => [...prev, newSub]);
      setNewSubtaskTitle("");
      setIsAddingRoot(false);
  };

  const addNestedSubtask = (parentId: string, title: string) => {
      const newSub: SubTask = {
          id: generateId(),
          title: title,
          completed: false
      };
      setSubtasks(prev => addSubtaskToParent(prev, parentId, newSub));
  };

  const editSubtask = (subId: string, title: string) => {
      setSubtasks(prev => updateSubtaskInTree(prev, subId, { title }));
  };

  const toggleStarLevel = () => {
      setStarLevel(prev => (prev + 1) % 2);
  };

  const getStarConfig = (level: number) => {
      switch(level) {
          case 1: return { icon: Star, color: 'text-yellow-500 fill-yellow-500', label: t('task.important') };
          default: return { icon: Star, color: 'text-slate-400', label: t('task.priority') };
      }
  };

  const currentStarConfig = getStarConfig(starLevel);
  const StarIcon = currentStarConfig.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
          className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('task.edit_title')}</h3>
                <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900">
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('task.name')}</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-lg font-semibold bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-500 outline-none py-1 text-slate-800 dark:text-white transition-colors"
                        placeholder={t('task.placeholder')}
                        autoFocus
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlignLeft size={12} /> {t('task.description')}
                    </label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add details..."
                        rows={3}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/50 resize-none"
                    />
                </div>

                {/* Subtasks */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CheckSquare size={12} /> {t('task.subtasks')}
                    </label>
                    
                    <div className="space-y-1 mb-3">
                        {subtasks.map((sub, index) => (
                            <RecursiveSubTaskItem 
                                key={sub.id}
                                index={index}
                                subtask={sub}
                                variant="simple"
                                onToggle={toggleSubtask}
                                onDelete={deleteSubtask}
                                onEdit={editSubtask}
                                onAdd={addNestedSubtask}
                            />
                        ))}
                    </div>

                    {/* Add Root Subtask Input */}
                    {!isAddingRoot ? (
                        <button 
                            type="button"
                            onClick={() => setIsAddingRoot(true)}
                            className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline p-1"
                        >
                            <Plus size={14} /> {t('task.add_item')}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-brand-300 dark:focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900 transition-all">
                            <CornerDownRight size={16} className="text-slate-400 ml-1" />
                            <input 
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') { e.preventDefault(); addRootSubtask(); }
                                    if(e.key === 'Escape') setIsAddingRoot(false);
                                }}
                                placeholder={t('task.add_new_step')}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                autoFocus
                            />
                            <button 
                                type="button"
                                onClick={addRootSubtask}
                                disabled={!newSubtaskTitle.trim()}
                                className="p-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg disabled:opacity-50 transition-all hover:bg-brand-200 dark:hover:bg-brand-900/50"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Calendar size={12} /> {t('task.due_date')}
                        </label>
                        <input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/50"
                        />
                    </div>

                    {/* Star Tag */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <StarIcon size={12} className={currentStarConfig.color} /> {t('task.importance')}
                        </label>
                        <button
                            type="button"
                            onClick={toggleStarLevel}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${starLevel > 0 ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                        >
                            <StarIcon size={16} className={currentStarConfig.color} />
                            {currentStarConfig.label}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                 <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                 >
                     {t('common.cancel')}
                 </button>
                 <button
                    type="submit"
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-200 dark:shadow-none transition-all flex items-center gap-2"
                 >
                     <Save size={16} /> {t('common.save')}
                 </button>
            </div>
        </form>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
