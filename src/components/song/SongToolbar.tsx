import React from 'react';
import { Plus, LayoutList, LayoutGrid, Zap, ClipboardPaste } from 'lucide-react';

interface SongToolbarProps {
  onAddRow: () => void;
  onAddSection: () => void;
  onBakeAccents: () => void;
  onPasteAnalyze: () => void;
  onSave: () => void;
  onCopy: () => void;
  isSaved: boolean;
}

const SongToolbar: React.FC<SongToolbarProps> = ({ 
  onAddRow, onAddSection, onBakeAccents, onPasteAnalyze, onSave, onCopy, isSaved 
}) => {
  return (
    <div className="flex items-center justify-center gap-2 p-3 overflow-x-auto no-scrollbar">
      <button 
        onClick={onSave}
        disabled={isSaved}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
          isSaved 
            ? 'bg-white/5 border-white/5 text-gray-600 cursor-default' 
            : 'bg-orange-accent/20 border-orange-accent/40 text-orange-accent hover:bg-orange-accent/30'
        }`}
        title="Save Song"
      >
        <Plus size={12} className={isSaved ? 'text-gray-600' : 'text-orange-accent'} />
        Save
      </button>

      <button 
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-all active:scale-95"
        title="Copy Text"
      >
        <ClipboardPaste size={12} className="text-orange-accent" />
        Copy
      </button>

      <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />

      <button 
        onClick={onPasteAnalyze}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-accent/10 hover:bg-orange-accent/20 border border-orange-accent/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-accent transition-all active:scale-95"
        title="Paste & Analyze"
      >
        <ClipboardPaste size={12} />
        Analyze
      </button>

      <button 
        onClick={onBakeAccents}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-accent/10 hover:bg-orange-accent/20 border border-orange-accent/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-accent transition-all active:scale-95"
        title="Bake Accents"
      >
        <Zap size={12} fill="currentColor" />
        Bake
      </button>

      <div className="w-px h-4 bg-white/10 mx-1" />

      <button 
        onClick={onAddRow}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-all active:scale-95"
      >
        <Plus size={12} className="text-orange-accent" />
        Row
      </button>
      
      <button 
        onClick={onAddSection}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-all active:scale-95"
      >
        <LayoutList size={12} className="text-orange-accent" />
        Section
      </button>
    </div>
  );
};

export default SongToolbar;
