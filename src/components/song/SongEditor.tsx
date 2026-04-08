import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ArrowLeft, Settings, Trash2, Save, Copy, Check, Tag, Download } from 'lucide-react';
import { Note, Group } from '../../db';
import { useSongSettings } from '../../hooks/useSongSettings';
import { useMetronome } from '../../hooks/useMetronome';
import { SongContent, Row } from './types';
import { VOWELS, applyAccentsToText } from '../../utils/prosodyEngine';
import SongSettingsPanel from './SongSettings';
import SongToolbar from './SongToolbar';
import SongRow from './SongRow';

interface SongEditorProps {
  note: Note | null;
  groups: Group[];
  onSave: (noteData: Partial<Note>) => Promise<number>;
  onClose: () => void;
  onDelete: (id: number) => void;
}

const SortableRow = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            dragHandleProps: { ...attributes, ...listeners }
          });
        }
        return child;
      })}
    </div>
  );
};

const SongEditor: React.FC<SongEditorProps> = ({ note, groups, onSave, onClose, onDelete }) => {
  const { 
    settings, updateBPM, updateBeats, updateSubdivisions, 
    toggleMetrics, toggleStress, toggleMetronome, updateDictionary 
  } = useSongSettings();

  useMetronome(settings.bpm, settings.beats, settings.subdivisions, settings.metronome);

  const [title, setTitle] = useState(note?.title || 'Untitled Song');
  const [rows, setRows] = useState<Row[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [currentId, setCurrentId] = useState<number | undefined>(note?.id);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(note?.groupId);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [analyzeTextValue, setAnalyzeTextValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsSaved(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (note?.content) {
      try {
        const content: SongContent = JSON.parse(note.content);
        setRows(content.rows || []);
        setCurrentId(note.id);
        if (content.dictionary) {
          updateDictionary({ ...settings.customDictionary, ...content.dictionary });
        }
      } catch (e) {
        console.error('Failed to parse song content', e);
        setRows([{ id: '1', text: '', isSection: false }]);
      }
    } else {
      setRows([{ id: '1', text: '', isSection: false }]);
      setCurrentId(undefined);
    }
  }, [note]);

  const extractStressedWords = useCallback((rows: Row[]) => {
    const learned: Record<string, number> = {};
    rows.forEach(row => {
      const words = row.text.split(/[^a-zA-Zа-яА-ЯіїєґІЇЄҐ\u0301]+/);
      words.forEach(word => {
        if (word.includes('\u0301')) {
          const cleanWord = word.replace(/\u0301/g, '').toLowerCase();
          if (cleanWord.length < 2) return;

          const wordLower = word.toLowerCase();
          let vowelCount = 0;
          let stressIdx = -1;
          
          for (let i = 0; i < wordLower.length; i++) {
            const char = wordLower[i];
            if (VOWELS.has(char)) {
              if (wordLower[i+1] === '\u0301') {
                stressIdx = vowelCount;
              }
              vowelCount++;
            }
          }
          
          if (stressIdx !== -1) {
            learned[cleanWord] = stressIdx;
          }
        }
      });
    });
    return learned;
  }, []);

  const performSave = useCallback(async () => {
    const learnedDict = extractStressedWords(rows);
    const finalDict = { ...settings.customDictionary, ...learnedDict };
    
    const content: SongContent = {
      settings: { ...settings, customDictionary: finalDict },
      rows,
      dictionary: finalDict
    };
    
    const id = await onSave({
      id: currentId,
      title,
      content: JSON.stringify(content),
      plainText: rows.map(r => r.text).join('\n'),
      type: 'song',
      groupId: selectedGroupId,
      createdAt: note?.createdAt,
    });
    
    if (!currentId) {
      setCurrentId(id);
    }
    setIsSaved(true);
  }, [note, title, rows, settings, onSave, extractStressedWords, currentId]);

  const handleClose = async () => {
    if (!isSaved) {
      await performSave();
    }
    onClose();
  };

  useEffect(() => {
    // Mark as unsaved when content changes
    if (rows.length > 0 || title !== (note?.title || 'Untitled Song')) {
      setIsSaved(false);
      
      // Live extract dictionary so other words update immediately
      const liveDict = extractStressedWords(rows);
      updateDictionary({ ...settings.customDictionary, ...liveDict });
    }
  }, [rows, title]);

  const handleAddRow = () => {
    const newRow: Row = { id: Date.now().toString(), text: '', isSection: false };
    setRows([...rows, newRow]);
  };

  const handleAddSection = () => {
    const newRow: Row = { id: Date.now().toString(), text: '[SECTION]', isSection: true };
    setRows([...rows, newRow]);
  };

  const handleUpdateRow = (id: string, text: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, text } : r));
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const handleDuplicateRow = (id: string) => {
    const index = rows.findIndex(r => r.id === id);
    if (index !== -1) {
      const newRow = { ...rows[index], id: Date.now().toString() };
      const newRows = [...rows];
      newRows.splice(index + 1, 0, newRow);
      setRows(newRows);
    }
  };

  const handleMoveRow = (id: string, direction: 'up' | 'down') => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rows.length - 1) return;

    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    setRows(newRows);
  };

  const handleConvertToSection = (id: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, isSection: !r.isSection, text: r.isSection ? r.text.replace(/[\[\]]/g, '') : `[${r.text || 'SECTION'}]` } : r));
  };

  const handleBakeAccents = () => {
    const newRows = rows.map(row => {
      if (row.isSection) return row;
      return {
        ...row,
        text: applyAccentsToText(row.text, settings.customDictionary)
      };
    });
    setRows(newRows);
    setIsSaved(false);
  };

  const handleCopy = () => {
    const fullText = rows.map(r => r.text).join('\n');
    navigator.clipboard.writeText(fullText);
    // Simple visual feedback could be added here if needed
  };

  const handleExport = () => {
    const fullText = rows.map(r => r.text).join('\n');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'song'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Only intercept if pasting into the main container, not an input/textarea
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!text) return;

    const lines = text.split(/\r?\n/);
    const newRows: Row[] = lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const trimmed = line.trim();
        const isSection = trimmed.startsWith('[') && trimmed.endsWith(']');
        return {
          id: Math.random().toString(36).substring(2, 11),
          text: trimmed,
          isSection
        };
      });

    if (newRows.length > 0) {
      // If we only have one empty row, replace it
      if (rows.length === 1 && rows[0].text === '') {
        setRows(newRows);
      } else {
        setRows([...rows, ...newRows]);
      }
      setIsSaved(false);
    }
  };

  const handlePasteAnalyze = () => {
    setAnalyzeTextValue('');
    setIsAnalyzeModalOpen(true);
  };

  const performAnalysis = () => {
    if (!analyzeTextValue.trim()) return;
    
    const lines = analyzeTextValue.split(/\r?\n/);
    const newRows: Row[] = lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const trimmed = line.trim();
        const isSection = trimmed.startsWith('[') && trimmed.endsWith(']');
        return {
          id: Math.random().toString(36).substring(2, 11),
          text: trimmed,
          isSection
        };
      });

    if (newRows.length > 0) {
      if (rows.length <= 1 && (rows[0]?.text === '' || rows.length === 0)) {
        setRows(newRows);
      } else {
        setRows([...rows, ...newRows]);
      }
      setIsSaved(false);
    }
    setIsAnalyzeModalOpen(false);
    setAnalyzeTextValue('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-matte-black text-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-matte-gray/95 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 flex-grow">
          <button onClick={handleClose} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-xl font-bold focus:outline-none w-full orange-text-gradient"
            placeholder="Назва пісні..."
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Static Unsaved Indicator */}
          {!isSaved && (
            <div className="w-2 h-2 rounded-full bg-orange-accent shadow-[0_0_10px_rgba(255,107,0,0.5)]" title="Є незбережені зміни" />
          )}
          
          <button 
            onClick={performSave}
            className={`p-2 rounded-full transition-all ${
              isSaved 
                ? 'text-gray-600 cursor-default' 
                : 'text-orange-accent hover:bg-orange-accent/10 active:scale-90'
            }`}
            disabled={isSaved}
            title="Зберегти"
          >
            <Save size={22} />
          </button>

          <button 
            onClick={handleCopy}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title="Копіювати текст"
          >
            <Copy size={20} />
          </button>

          <button 
            onClick={handleExport}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title="Експортувати (.txt)"
          >
            <Download size={20} />
          </button>

          {/* Group Picker */}
          <div className="relative">
            <button 
              onClick={() => setShowGroupPicker(!showGroupPicker)}
              className={`p-2 rounded-full transition-all ${selectedGroupId ? 'text-orange-accent bg-orange-accent/10' : 'text-gray-400 hover:bg-white/5'}`}
              title="Вибрати групу"
            >
              <Tag size={20} />
            </button>

            {showGroupPicker && (
              <div className="absolute top-full right-0 mt-2 w-48 matte-card z-50 shadow-2xl border-orange-accent/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button 
                  onClick={() => { setSelectedGroupId(undefined); setShowGroupPicker(false); setIsSaved(false); }}
                  className="w-full p-3 text-left hover:bg-white/5 text-sm border-b border-white/5"
                >
                  No Group
                </button>
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => { setSelectedGroupId(group.id); setShowGroupPicker(false); setIsSaved(false); }}
                    className={`w-full p-3 text-left hover:bg-white/5 text-sm flex items-center gap-2 ${selectedGroupId === group.id ? 'text-orange-accent' : 'text-gray-300'}`}
                  >
                    <Tag size={14} />
                    {group.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-full transition-all ${isSettingsOpen ? 'bg-orange-accent text-black' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Settings size={20} />
          </button>
          {note?.id && (
            <button 
              onClick={() => confirm('Delete this song?') && onDelete(note.id!)}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Tools Area */}
      <div className="flex-shrink-0 z-40">
        {/* Settings Panel */}
        {isSettingsOpen && (
          <SongSettingsPanel 
            settings={settings}
            onUpdateBPM={updateBPM}
            onUpdateBeats={updateBeats}
            onUpdateSubdivisions={updateSubdivisions}
            onToggleMetrics={toggleMetrics}
            onToggleStress={toggleStress}
            onToggleMetronome={toggleMetronome}
          />
        )}

        {/* Toolbar */}
        <div className="bg-matte-black/80 backdrop-blur-md border-b border-white/5">
          <SongToolbar 
            onAddRow={handleAddRow}
            onAddSection={handleAddSection}
            onBakeAccents={handleBakeAccents}
            onPasteAnalyze={handlePasteAnalyze}
            onSave={performSave}
            onCopy={handleCopy}
            isSaved={isSaved}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-2 sm:p-6 space-y-1 no-scrollbar pb-40" onPaste={handlePaste}>
        <div className="max-w-[800px] mx-auto space-y-1">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={rows.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {rows.map(row => (
                <SortableRow key={row.id} id={row.id}>
                  <SongRow 
                    row={row}
                    settings={settings}
                    onUpdate={handleUpdateRow}
                    onDelete={handleDeleteRow}
                    onDuplicate={handleDuplicateRow}
                    onMove={handleMoveRow}
                    onConvertToSection={handleConvertToSection}
                  />
                </SortableRow>
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600 italic">
            <p className="mb-4">Empty song. Start by adding a row.</p>
          </div>
        )}
        
        <div className="h-32" /> {/* Bottom spacer */}
      </div>

      {/* Analyze Modal */}
      {isAnalyzeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="matte-card w-full max-w-2xl p-6 border-orange-accent/20 shadow-[0_0_50px_rgba(255,107,0,0.1)]">
            <h3 className="text-2xl font-bold mb-2 orange-text-gradient">Аналіз тексту</h3>
            <p className="text-gray-400 text-sm mb-6">Вставте текст пісні нижче. Система автоматично розіб'є його на блоки та рядки для аналізу ритму.</p>
            
            <textarea 
              autoFocus
              value={analyzeTextValue}
              onChange={(e) => setAnalyzeTextValue(e.target.value)}
              placeholder="Вставте текст тут... [Приклад: [Приспів] Ой у лузі...]"
              className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-orange-accent/50 resize-none mb-6 font-sans leading-relaxed"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setIsAnalyzeModalOpen(false)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-gray-400"
              >
                Скасувати
              </button>
              <button 
                onClick={performAnalysis}
                disabled={!analyzeTextValue.trim()}
                className="flex-1 py-4 bg-orange-accent hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-accent text-black rounded-xl font-bold transition-all shadow-lg shadow-orange-accent/20"
              >
                Аналізувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongEditor;
