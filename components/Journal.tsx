
import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, Search, Trash2, Calendar as CalendarIcon, Edit3, Maximize2 } from 'lucide-react';
import { Note } from '../types';

interface JournalProps {
    variant?: 'full' | 'mini';
    onExpand?: () => void;
}

export const Journal: React.FC<JournalProps> = ({ variant = 'full', onExpand }) => {
  const { notes, addNote, updateNote, deleteNote } = useTasks();
  const { t, language } = useTheme();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Derived state
  const sortedNotes = notes
    .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Sync editor with selected note
  useEffect(() => {
    if (selectedNote) {
        setEditTitle(selectedNote.title);
        setEditContent(selectedNote.content);
    } else {
        setEditTitle('');
        setEditContent('');
    }
  }, [selectedNoteId, notes]); // Depend on notes to update if external sync happens

  const handleCreateNote = () => {
      addNote({
          title: 'Untitled Note',
          content: ''
      });
  };

  const handleSave = () => {
      if (selectedNoteId) {
          updateNote(selectedNoteId, {
              title: editTitle,
              content: editContent
          });
      }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(t('common.delete') + "?")) {
        deleteNote(id);
        if (selectedNoteId === id) setSelectedNoteId(null);
      }
  };

  // MINI MODE RENDER
  if (variant === 'mini') {
      return (
          <div className="h-full flex flex-col bg-white dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-20">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('journal.quick_notes')}</h3>
                <div className="flex gap-2">
                    <button onClick={handleCreateNote} className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-200">
                        <Plus size={18} />
                    </button>
                    <button onClick={onExpand} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {sortedNotes.slice(0, 5).map(note => (
                    <div 
                        key={note.id}
                        onClick={onExpand} // In mini mode, clicking a note opens full view
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all group"
                    >
                         <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-1 truncate">{note.title || "Untitled"}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{note.content || "No content..."}</p>
                         <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-slate-400">{new Date(note.updatedAt).toLocaleDateString(language)}</span>
                         </div>
                    </div>
                ))}
                {sortedNotes.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">{t('journal.no_notes')}</div>
                )}
            </div>
          </div>
      )
  }

  // FULL MODE RENDER
  return (
    <div className="h-full flex flex-col md:flex-row bg-white dark:bg-slate-900 md:rounded-3xl overflow-hidden transition-colors duration-300">
        
        {/* Left Sidebar: Note List */}
        <div className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 ${selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('journal.title')}</h2>
                <button 
                    onClick={handleCreateNote}
                    className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-200 dark:shadow-none"
                >
                    <Plus size={20} />
                </button>
            </div>
            
            <div className="p-4 pb-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('journal.search')} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:border-brand-300 dark:focus:border-brand-700 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sortedNotes.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Edit3 size={48} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('journal.not_found')}</p>
                    </div>
                )}
                {sortedNotes.map(note => (
                    <div 
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`group p-4 rounded-xl cursor-pointer border transition-all hover:shadow-sm ${
                            selectedNoteId === note.id 
                            ? 'bg-white dark:bg-slate-800 border-brand-200 dark:border-brand-900 shadow-sm ring-1 ring-brand-100 dark:ring-brand-900/50' 
                            : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800'
                        }`}
                    >
                        <h3 className={`font-semibold text-sm truncate mb-1 ${selectedNoteId === note.id ? 'text-brand-700 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {note.title || "Untitled Note"}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-2">
                            {note.content || "No additional text"}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded">
                                {new Date(note.updatedAt).toLocaleDateString(language)}
                            </span>
                            <button 
                                onClick={(e) => handleDelete(note.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Editor */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 h-full relative ${!selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
            {selectedNoteId ? (
                <>
                    {/* Editor Toolbar (Mobile Back Button) */}
                    <div className="md:hidden p-4 border-b border-slate-100 dark:border-slate-800 flex items-center shrink-0">
                        <button onClick={() => setSelectedNoteId(null)} className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1">
                            ← {t('common.back')}
                        </button>
                        <span className="ml-auto text-xs text-slate-300 dark:text-slate-600">
                            {editContent !== selectedNote?.content || editTitle !== selectedNote?.title ? t('journal.unsaved') : t('journal.saved')}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col">
                        <div className="max-w-3xl w-full mx-auto p-6 md:p-12 flex flex-col flex-1 h-full">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleSave}
                                placeholder={t('journal.title_placeholder')}
                                className="w-full text-3xl md:text-4xl font-bold text-slate-800 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-700 border-none outline-none bg-transparent mb-6 shrink-0"
                            />
                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-8 font-medium shrink-0">
                                <CalendarIcon size={14} />
                                <span>
                                    Last edited {new Date(selectedNote?.updatedAt || Date.now()).toLocaleString(language)}
                                </span>
                            </div>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onBlur={handleSave}
                                placeholder={t('journal.content_placeholder')}
                                className="w-full flex-1 resize-none text-lg text-slate-600 dark:text-slate-300 placeholder:text-slate-200 dark:placeholder:text-slate-700 leading-relaxed border-none outline-none bg-transparent min-h-0"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Edit3 size={32} />
                    </div>
                    <p className="text-lg font-medium">{t('journal.select')}</p>
                    <p className="text-sm">{t('journal.create_prompt')}</p>
                </div>
            )}
        </div>

    </div>
  );
};
