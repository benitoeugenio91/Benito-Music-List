import React, { useState, useEffect } from 'react';
import { Search, Pencil, Download, Plus } from 'lucide-react';
import { Note, Group, getAllNotes, saveNote, deleteNote, getAllGroups } from './db';
import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import SongEditor from './components/song/SongEditor';
import CreateButton from './components/CreateButton';
import MusicPlayer from './components/MusicPlayer';

type View = 'list' | 'editor' | 'song-editor';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let [allNotes, allGroups] = await Promise.all([
        getAllNotes(),
        getAllGroups()
      ]);

      // Seed data if empty for the user's presentation
      if (allNotes.length === 0) {
        const now = Date.now();
        const seedNote: Note = {
          title: 'Презентація',
          content: `
            <h1>Презентація</h1>
            <h2>Progressive Web Application</h2>
            <h3>Prosodic Engine</h3>
            <p><strong>B-NoTe</strong></p>
            <p>B-NoTe - це унікальний записник, твій помічник, який завжди під рукою. Створений для тих, хто цінує естетику, швидкість та функціональність.</p>
          `,
          plainText: 'Презентація. Progressive Web Application. Prosodic Engine. B-NoTe - це унікальний записник...',
          type: 'note',
          createdAt: now,
          updatedAt: now,
        };
        await saveNote(seedNote);
        allNotes = await getAllNotes();
      }

      setNotes(allNotes.sort((a, b) => b.updatedAt - a.updatedAt));
      setGroups(allGroups);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setCurrentView('editor');
  };

  const handleCreateSong = () => {
    setEditingNote(null);
    setCurrentView('song-editor');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    if (note.type === 'song') {
      setCurrentView('song-editor');
    } else {
      setCurrentView('editor');
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>): Promise<number> => {
    const now = Date.now();
    const newNote: Note = {
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      plainText: noteData.plainText || '',
      groupId: noteData.groupId,
      type: noteData.type || 'note',
      createdAt: noteData.createdAt || now,
      updatedAt: now,
      ...(noteData.id ? { id: noteData.id } : {}),
    };

    const id = await saveNote(newNote);
    await loadData();
    
    // Update editingNote with the new ID so subsequent saves use the same record
    if (!noteData.id) {
      setEditingNote({ ...newNote, id });
    } else {
      setEditingNote(newNote);
    }

    // Don't automatically switch to list for song editor as it auto-saves
    if (currentView !== 'song-editor') {
      setCurrentView('list');
      setEditingNote(null);
    }
    return id;
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    await loadData();
    setCurrentView('list');
    setEditingNote(null);
  };

  const handleExport = () => {
    const exportData = {
      notes,
      groups,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `b-note-full-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'editor':
        return (
          <NoteEditor 
            note={editingNote} 
            groups={groups}
            onSave={handleSaveNote} 
            onClose={() => setCurrentView('list')}
            onDelete={handleDeleteNote}
          />
        );
      case 'song-editor':
        return (
          <SongEditor 
            note={editingNote} 
            groups={groups}
            onSave={handleSaveNote} 
            onClose={() => setCurrentView('list')}
            onDelete={handleDeleteNote}
          />
        );
      default:
        return (
          <NoteList 
            notes={notes} 
            groups={groups} 
            onNoteClick={handleEditNote} 
            onGroupsUpdate={loadData}
            onDelete={handleDeleteNote}
            isSearchVisible={isSearchVisible}
            onSearchToggle={() => setIsSearchVisible(!isSearchVisible)}
          />
        );
    }
  };

  return (
    <div className="app-container pt-[72px]">
      <MusicPlayer />
      {/* Background Watermark */}
      <div className="watermark">BENITO EUGENIO</div>

      {/* Header */}
      <header className="relative p-8 pt-12 text-center z-10">
        <h1 className="text-5xl premium-title-effect drop-shadow-2xl">
          B-NOTE
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-orange-accent to-transparent mx-auto mt-4 opacity-50" />
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-hidden relative z-10">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[860px] bg-matte-gray/90 backdrop-blur-xl border-t border-white/10 p-4 flex justify-around items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => {
            if (currentView !== 'list') {
              setCurrentView('list');
              setEditingNote(null);
              setIsSearchVisible(true);
            } else {
              setIsSearchVisible(!isSearchVisible);
            }
          }}
          className={`p-3 transition-all ${isSearchVisible && currentView === 'list' ? 'text-orange-accent scale-125' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Search size={28} />
        </button>
        
        <CreateButton 
          onCreateNote={handleCreateNote}
          onCreateSong={handleCreateSong}
        />

        <button 
          onClick={handleExport}
          className="p-3 text-gray-500 hover:text-orange-accent transition-all"
          title="Export all data"
        >
          <Download size={28} />
        </button>
      </nav>

      {/* Loading Overlay */}
      {isLoading && currentView === 'list' && notes.length === 0 && (
        <div className="absolute inset-0 bg-matte-black z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-accent/20 border-t-orange-accent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}


