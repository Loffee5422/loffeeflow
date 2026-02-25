
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  Calendar as CalendarIcon, 
  Edit3, 
  Maximize2, 
  GripVertical, 
  ChevronLeft, 
  X, 
  Save, 
  FileText, 
  Clock,
  MoreVertical
} from 'lucide-react';
import { Note } from '../types';

interface JournalProps {
    variant?: 'full' | 'mini';
    onExpand?: () => void;
}

export const Journal: React.FC<JournalProps> = ({ variant = 'full', onExpand }) => {
  const { notes, addNote, updateNote, deleteNote } = useTasks();
  const { t, language } = useTheme();
  
  // Navigation & Selection
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor Buffers (Prevent direct context updates on every keystroke)
  const [titleBuffer, setTitleBuffer] = useState('');
  const [contentBuffer, setContentBuffer] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Refs for race condition management
  const editorRef = useRef<HTMLDivElement>(null);

  // --- Data Processing ---
  const filteredNotes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return notes
      .filter(n => 
        (n.title || "").toLowerCase().includes(query) || 
        (n.content || "").toLowerCase().includes(query)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === selectedNoteId), 
    [notes, selectedNoteId]
  );

  // --- Effects ---
  // Load note into buffers when selection changes
  useEffect(() => {
    if (activeNote) {
      setTitleBuffer(activeNote.title || '');
      setContentBuffer(activeNote.content || '');
      setIsDirty(false);
    } else {
      setTitleBuffer('');
      setContentBuffer('');
      setIsDirty(false);
    }
  }, [selectedNoteId, activeNote?.id]);

  // --- Handlers ---
  const handleBufferChange = (field: 'title' | 'content', value: string) => {
    if (field === 'title') setTitleBuffer(value);
    else setContentBuffer(value);
    setIsDirty(true);
  };

  const handleCreateNote = () => {
    const id = addNote({
      title: '',
      content: ''
    });
    setSelectedNoteId(id);
    if (variant === 'mini' && onExpand) onExpand();
  };

  const persistChanges = () => {
    if (selectedNoteId && isDirty) {
      updateNote(selectedNoteId, {
        title: titleBuffer,
        content: contentBuffer
      });
      setIsDirty(false);
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    // CRITICAL: preventDefault here stops the focus from shifting, 
    // which prevents the blur event from firing on the inputs.
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`${t('common.delete')}?`);
    if (confirmed) {
      // If we are deleting the note we are looking at, clear selection first
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
      deleteNote(id);
    }
  };

  // --- Sub-components ---
  const NoteListItem = ({ note }: { note: Note }) => (
    <div 
      onClick={() => setSelectedNoteId(note.id)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(note));
      }}
      className={`group relative p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${
        selectedNoteId === note.id 
          ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-brand-100 dark:hover:border-brand-900 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={`text-sm font-bold truncate pr-6 ${selectedNoteId === note.id ? 'text-brand-700 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {note.title || "Untitled Note"}
        </h3>
        <button 
          onMouseDown={e => e.preventDefault()} // Block blur
          onClick={e => confirmDelete(note.id, e)}
          className="absolute top-3 right-3 p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg md:opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-2 leading-relaxed">
        {note.content || "No content yet..."}
      </p>
      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
        <Clock size={10} />
        {new Date(note.updatedAt).toLocaleDateString(language, { month: 'short', day: 'numeric' })}
      </div>
    </div>
  );

  // --- Renders ---

  // Mini Variant (Floating Panel Mode)
  if (variant === 'mini') {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Edit3 size={18} className="text-brand-500" /> {t('journal.quick_notes')}
          </h3>
          <div className="flex gap-1">
            <button onClick={handleCreateNote} className="p-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-xl transition-colors">
              <Plus size={20} />
            </button>
            <button onClick={onExpand} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-colors">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <FileText size={32} className="opacity-20 mb-2" />
              <p className="text-xs font-medium">{t('journal.no_notes')}</p>
            </div>
          ) : (
            filteredNotes.map(note => <NoteListItem key={note.id} note={note} />)
          )}
        </div>
      </div>
    );
  }

  // Full Variant (Main App View)
  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Sidebar: Note List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-all duration-300 ${selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">{t('journal.title')}</h2>
          <button 
            onClick={handleCreateNote}
            className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="p-4 px-6 border-b border-slate-50 dark:border-slate-800/50">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('journal.search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none ring-2 ring-transparent focus:ring-brand-500/10 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {filteredNotes.map(note => <NoteListItem key={note.id} note={note} />)}
          {filteredNotes.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <FileText size={48} className="mx-auto mb-4" />
              <p className="text-sm font-bold">{t('journal.not_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Editor */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 h-full relative ${!selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
        {selectedNoteId && activeNote ? (
          <>
            {/* Editor Top Bar (Mobile + Desktop Controls) */}
            <div className="h-16 px-4 md:px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { persistChanges(); setSelectedNoteId(null); }} 
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Clock size={14} />
                  <span>{isDirty ? t('journal.unsaved') : t('journal.saved')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isDirty && (
                  <button 
                    onClick={persistChanges}
                    className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-xl transition-all"
                    title={t('common.save')}
                  >
                    <Save size={20} />
                  </button>
                )}
                <button 
                  onMouseDown={e => e.preventDefault()} // Critical block
                  onClick={e => confirmDelete(selectedNoteId, e)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                  title={t('common.delete')}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Editor Canvas */}
            <div ref={editorRef} className="flex-1 overflow-y-auto flex flex-col">
              <div className="max-w-4xl w-full mx-auto p-8 md:p-16 flex flex-col flex-1">
                <input
                  type="text"
                  value={titleBuffer}
                  onChange={(e) => handleBufferChange('title', e.target.value)}
                  onBlur={persistChanges}
                  placeholder={t('journal.title_placeholder')}
                  className="w-full text-4xl md:text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-100 dark:placeholder:text-slate-800 border-none outline-none bg-transparent mb-8 shrink-0"
                />
                
                <textarea
                  value={contentBuffer}
                  onChange={(e) => handleBufferChange('content', e.target.value)}
                  onBlur={persistChanges}
                  placeholder={t('journal.content_placeholder')}
                  className="w-full flex-1 resize-none text-lg md:text-xl text-slate-600 dark:text-slate-300 placeholder:text-slate-100 dark:placeholder:text-slate-800 leading-relaxed border-none outline-none bg-transparent min-h-[300px]"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 dark:text-slate-800">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
              <Edit3 size={40} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-600 mb-1">{t('journal.select')}</h3>
            <p className="text-sm font-medium opacity-50">{t('journal.create_prompt')}</p>
          </div>
        )}
      </div>

    </div>
  );
};
