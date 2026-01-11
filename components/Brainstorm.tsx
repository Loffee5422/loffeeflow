import React, { useState, useEffect } from 'react';
import { ToolLayout } from './ToolLayout';
import { Lightbulb, Plus, Trash2, X, Check, Palette } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  color: string;
  x: number; 
  y: number;
}

interface BrainstormProps {
  onExit: () => void;
}

const COLORS = [
  'bg-yellow-200 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100',
  'bg-blue-200 text-blue-900 dark:bg-blue-600 dark:text-blue-100',
  'bg-rose-200 text-rose-900 dark:bg-rose-600 dark:text-rose-100',
  'bg-emerald-200 text-emerald-900 dark:bg-emerald-600 dark:text-emerald-100',
  'bg-purple-200 text-purple-900 dark:bg-purple-600 dark:text-purple-100',
];

export const Brainstorm: React.FC<BrainstormProps> = ({ onExit }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('loffee_brainstorm');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    localStorage.setItem('loffee_brainstorm', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNoteContent.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      content: newNoteContent,
      color: selectedColor,
      x: 0,
      y: 0
    };
    setNotes([note, ...notes]);
    setNewNoteContent('');
    setIsAdding(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <ToolLayout title="Brainstorm" icon={Lightbulb} color="bg-amber-500" onExit={onExit}>
      
      {/* Controls */}
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Idea Board</h2>
            <p className="text-slate-500 dark:text-slate-400">Capture thoughts in a free-form flow.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          <span className="hidden md:inline">New Idea</span>
        </button>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl ring-1 ring-slate-100 dark:ring-slate-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">New Sticky Note</h3>
              <button onClick={() => setIsAdding(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            
            <textarea
              autoFocus
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none resize-none mb-4 text-lg"
            />
            
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full ${c} ring-2 ring-offset-2 dark:ring-offset-slate-900 ${selectedColor === c ? 'ring-slate-400' : 'ring-transparent'}`}
                />
              ))}
            </div>

            <button 
              onClick={addNote}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors"
            >
              Post Note
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        {notes.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">The board is empty.</p>
            <p className="text-sm">Start by adding a new idea!</p>
          </div>
        )}
        {notes.map(note => (
          <div 
            key={note.id}
            className={`group relative p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 aspect-square flex flex-col ${note.color}`}
          >
            <p className="font-medium text-lg leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {note.content}
            </p>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => deleteNote(note.id)}
                className="p-2 bg-black/10 hover:bg-black/20 rounded-full text-current transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
};