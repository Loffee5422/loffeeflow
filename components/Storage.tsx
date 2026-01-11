import React, { useState, useEffect } from 'react';
import { ToolLayout } from './ToolLayout';
import { HardDrive, Link as LinkIcon, FileText, Plus, Copy, Trash2, ExternalLink, X, Eye, EyeOff } from 'lucide-react';

interface StorageItem {
  id: string;
  type: 'LINK' | 'TEXT';
  title: string;
  content: string;
  createdAt: number;
}

interface StorageProps {
  onExit: () => void;
}

export const Storage: React.FC<StorageProps> = ({ onExit }) => {
  const [items, setItems] = useState<StorageItem[]>(() => {
    const saved = localStorage.getItem('loffee_storage');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'LINK' | 'TEXT'>('TEXT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Sensitive Mode (Mask content)
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('loffee_storage', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    const item: StorageItem = {
      id: crypto.randomUUID(),
      type: newItemType,
      title,
      content,
      createdAt: Date.now()
    };
    
    setItems([item, ...items]);
    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const deleteItem = (id: string) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
        setItems(items.filter(i => i.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const toggleVisibility = (id: string) => {
    setShowSensitive(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
    <ToolLayout title="Loffee Vault" icon={HardDrive} color="bg-emerald-500" onExit={onExit}>
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Digital Locker</h2>
            <p className="text-slate-500 dark:text-slate-400">Securely store snippets, links, and text assets locally.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => { setNewItemType('LINK'); setIsModalOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
            >
                <LinkIcon size={18} /> Add Link
            </button>
            <button 
                onClick={() => { setNewItemType('TEXT'); setIsModalOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
                <FileText size={18} /> Add Snippet
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <HardDrive size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400">Your vault is empty.</p>
            </div>
        )}
        
        {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.type === 'LINK' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                            {item.type === 'LINK' ? <LinkIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-3 relative group/content">
                    <div className={`font-mono text-sm text-slate-600 dark:text-slate-300 break-all ${!showSensitive[item.id] && 'blur-sm select-none'}`}>
                        {item.content}
                    </div>
                    
                    {/* Overlay for blur toggle */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/content:opacity-100 transition-opacity">
                         <button onClick={() => toggleVisibility(item.id)} className="bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm">
                            {showSensitive[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                         </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => copyToClipboard(item.content)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Copy size={14} /> Copy
                    </button>
                    {item.type === 'LINK' && (
                        <a 
                            href={item.content.startsWith('http') ? item.content : `https://${item.content}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            <ExternalLink size={14} /> Open
                        </a>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl ring-1 ring-slate-100 dark:ring-slate-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Add {newItemType === 'LINK' ? 'Link' : 'Text Snippet'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input 
                            autoFocus
                            type="text" 
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="e.g. WiFi Password"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                        <textarea 
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                            placeholder={newItemType === 'LINK' ? "https://..." : "Secret text here..."}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                        Save to Vault
                    </button>
                </form>
            </div>
        </div>
      )}
    </ToolLayout>
  );
};