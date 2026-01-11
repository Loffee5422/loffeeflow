
import React, { useRef, useEffect, useState } from 'react';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SubTask } from '../types';

interface SubTaskRowProps {
    subtask: SubTask;
    depth?: number;
    index?: number;
    variant?: 'default' | 'simple';
    
    // Common
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;

    // Default (Outline Mode)
    onChange?: (id: string, title: string) => void;
    onInsertAfter?: (id: string) => void;
    onIndent?: (id: string) => void;
    onOutdent?: (id: string) => void;
    
    // Simple (Modal/View Mode)
    onEdit?: (id: string, title: string) => void;
    onAdd?: (parentId: string, title: string) => void;

    // Focus
    autoFocusId?: string;
}

export const RecursiveSubTaskItem: React.FC<SubTaskRowProps> = ({ 
    subtask, 
    depth = 0,
    index,
    variant = 'default',
    onToggle,
    onChange,
    onDelete,
    onInsertAfter,
    onIndent,
    onOutdent,
    onEdit,
    onAdd,
    autoFocusId
}) => {
    const { t } = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const isComposingRef = useRef(false);
    
    // Local state to handle IME composition (Chinese/Japanese) without causing 
    // re-renders that break the input buffer.
    const [localTitle, setLocalTitle] = useState(subtask.title);

    // Sync local state with prop when prop changes externally (e.g. undo/redo or initial load)
    // We skip this if we are currently composing to prevent cursor jumping
    useEffect(() => {
        if (subtask.title !== localTitle && !isComposingRef.current) {
            setLocalTitle(subtask.title);
        }
    }, [subtask.title]);
    
    useEffect(() => {
        if (autoFocusId === subtask.id && inputRef.current) {
            inputRef.current.focus();
            // Move cursor to end of text
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
        }
    }, [autoFocusId, subtask.id]);

    // Handler for Text Change (Unifies onChange and onEdit)
    const commitChange = (val: string) => {
        if (variant === 'default' && onChange) {
            onChange(subtask.id, val);
        } else if (variant === 'simple' && onEdit) {
            onEdit(subtask.id, val);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value);
        // Only commit to parent if NOT composing via IME
        if (!isComposingRef.current) {
            commitChange(e.target.value);
        }
    };

    const handleCompositionStart = () => {
        isComposingRef.current = true;
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        // Commit the final composed string
        commitChange(e.currentTarget.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Ignore key commands during IME composition
        if (isComposingRef.current || e.nativeEvent.isComposing) return;

        if (variant === 'default') {
            if (e.key === 'Enter') {
                e.preventDefault();
                onInsertAfter?.(subtask.id);
            }
            if (e.key === 'Backspace' && localTitle === '') {
                e.preventDefault();
                onDelete(subtask.id);
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) {
                    onOutdent?.(subtask.id);
                } else {
                    onIndent?.(subtask.id);
                }
            }
        } else {
            // Simple mode key handling (Enter to blur)
            if (e.key === 'Enter') {
                e.currentTarget.blur();
            }
        }
    };

    return (
        <div className="flex flex-col w-full">
            <div 
                className="group flex items-start gap-2 py-1 min-h-[32px]"
                style={{ paddingLeft: `${depth * 1.5}rem` }}
            >
                {/* Visual Connector Lines for deep nesting in simple mode too? */}
                {depth > 0 && variant === 'default' && (
                    <div className="absolute left-0 w-px bg-slate-200 dark:bg-slate-800" style={{ left: `${(depth * 1.5) - 0.75}rem`, height: '32px' }}></div>
                )}

                <button 
                    onClick={() => onToggle(subtask.id)}
                    tabIndex={-1}
                    className={`mt-0.5 shrink-0 transition-colors ${subtask.completed ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'}`}
                >
                    {subtask.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                <div className="flex-1 relative flex flex-col">
                    <input 
                        ref={inputRef}
                        value={localTitle}
                        onChange={handleInputChange}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        onKeyDown={handleKeyDown}
                        placeholder={t('task.placeholder')}
                        className={`w-full bg-transparent border-none outline-none text-sm p-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 ${subtask.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}
                    />
                    
                    {/* Action buttons for simple variant */}
                    {variant === 'simple' && onAdd && (
                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onAdd(subtask.id, "New item")}
                                className="text-[10px] text-brand-600 flex items-center gap-1 hover:underline"
                            >
                                <Plus size={10} /> {t('task.add_item')}
                            </button>
                            <button 
                                onClick={() => onDelete(subtask.id)}
                                className="text-[10px] text-rose-500 flex items-center gap-1 hover:underline"
                            >
                                <Trash2 size={10} /> {t('common.delete')}
                            </button>
                        </div>
                    )}
                    
                    {/* Hover Actions for Default Variant */}
                    {variant === 'default' && (
                        <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center absolute right-0 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pl-4 h-full top-0">
                            <button 
                                onClick={() => onDelete(subtask.id)}
                                className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                tabIndex={-1}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursion */}
            {subtask.subtasks && subtask.subtasks.length > 0 && subtask.subtasks.map((child, i) => (
                <RecursiveSubTaskItem 
                    key={child.id}
                    index={i}
                    subtask={child}
                    depth={depth + 1}
                    variant={variant}
                    onToggle={onToggle}
                    onChange={onChange}
                    onDelete={onDelete}
                    onInsertAfter={onInsertAfter}
                    onIndent={onIndent}
                    onOutdent={onOutdent}
                    onEdit={onEdit}
                    onAdd={onAdd}
                    autoFocusId={autoFocusId}
                />
            ))}
        </div>
    );
};
