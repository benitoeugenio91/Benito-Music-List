import React, { useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Copy, ArrowUp, ArrowDown, LayoutList } from 'lucide-react';
import { Row } from './types';
import { SongSettings } from '../../hooks/useSongSettings';
import { useProsody } from '../../hooks/useProsody';
import MetricsRow from './MetricsRow';
import StressOverlay from './StressOverlay';

interface SongRowProps {
  row: Row;
  settings: SongSettings;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onConvertToSection: (id: string) => void;
  dragHandleProps?: any;
}

const SongRow: React.FC<SongRowProps> = ({ 
  row, settings, onUpdate, onDelete, onDuplicate, onMove, onConvertToSection, dragHandleProps 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { metrics } = useProsody(row.text, settings);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [row.text]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;

    // Shortcut logic: letter + . + space + space
    if (cursor !== null && cursor >= 4) {
      const last4 = val.substring(cursor - 4, cursor);
      // Regex checks for a letter followed by a dot and two spaces
      if (/[a-zA-Zа-яА-ЯіїєґІЇЄҐ]\.  /.test(last4)) {
        // Replace '.  ' with the stress mark '\u0301'
        const newVal = val.substring(0, cursor - 3) + '\u0301' + val.substring(cursor);
        onUpdate(row.id, newVal);
        
        // Need to restore cursor position after the replacement
        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = cursor - 2; // Move back because we removed 3 chars and added 1
            textareaRef.current.setSelectionRange(newPos, newPos);
            textareaRef.current.focus();
          }
        }, 0);
        return;
      }
    }

    onUpdate(row.id, val);
  };

  if (row.isSection) {
    return (
      <div className="group relative py-4 px-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div 
            {...dragHandleProps} 
            className="cursor-grab active:cursor-grabbing p-1 text-gray-700 hover:text-orange-accent transition-colors"
          >
            <LayoutList size={16} />
          </div>
          <div className="h-px flex-grow bg-orange-accent/20" />
          <input 
            value={row.text}
            onChange={(e) => onUpdate(row.id, e.target.value)}
            className="bg-transparent text-orange-accent font-bold uppercase tracking-[0.2em] text-center focus:outline-none min-w-[120px]"
            placeholder="[SECTION]"
            spellCheck={false}
          />
          <div className="h-px flex-grow bg-orange-accent/20" />
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button onClick={() => onMove(row.id, 'up')} className="p-1.5 text-gray-500 hover:text-white"><ArrowUp size={14} /></button>
          <button onClick={() => onMove(row.id, 'down')} className="p-1.5 text-gray-500 hover:text-white"><ArrowDown size={14} /></button>
          <button onClick={() => onDelete(row.id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative py-1 px-2 hover:bg-white/[0.02] transition-colors rounded-lg flex items-start gap-2">
      <div 
        {...dragHandleProps} 
        className="mt-3 cursor-grab active:cursor-grabbing p-1 text-gray-800 hover:text-orange-accent transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      >
        <MoreVertical size={16} />
      </div>

      <div className="relative flex-grow min-w-0">
        <div className="relative">
          {settings.showStressHighlight && <StressOverlay metrics={metrics} text={row.text} />}
          <textarea
            ref={textareaRef}
            value={row.text}
            onChange={handleInput}
            placeholder="Рядок..."
            rows={1}
            className={`w-full bg-transparent p-2 text-lg leading-tight outline-none resize-none overflow-hidden placeholder:text-gray-700 ${settings.showStressHighlight ? 'text-white/40 caret-orange-accent' : 'text-gray-200'}`}
            spellCheck={false}
          />
        </div>

        {settings.showMetrics && metrics && (
          <div className="px-2 pb-1">
            <MetricsRow metrics={metrics} bpm={settings.bpm} />
          </div>
        )}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
        className="mt-3 p-1 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-20 shrink-0"
        title="Delete Row"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default SongRow;
