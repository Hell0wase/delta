import { useState, useEffect } from 'react';
import { OSData } from '@/types/deltaos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Plus, Trash2, Save, FileText } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

export const NotesApp = ({ userData, onUpdateUserData }: NotesAppProps) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('deltaos-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('deltaos-notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;
    
    const updatedNote = {
      ...selectedNote,
      title: title || 'Untitled',
      content,
      updatedAt: new Date().toISOString(),
    };

    setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));
    setSelectedNote(updatedNote);
    setIsEditing(false);
    toast.success('Note saved!');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
    toast.success('Note deleted');
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-background via-background to-amber-500/5">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/50 p-4 bg-muted/20">
        <Button
          onClick={createNewNote}
          className="w-full mb-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          data-testid="button-new-note"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
        
        <ScrollArea className="h-[calc(100%-60px)]">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => selectNote(note)}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedNote?.id === note.id
                  ? 'bg-primary/20 border border-primary/50'
                  : 'bg-muted/40 hover:bg-muted/60'
              }`}
              data-testid={`note-item-${note.id}`}
            >
              <div className="font-semibold truncate">{note.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col p-6">
        {selectedNote ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="text-2xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0"
                disabled={!isEditing}
                data-testid="input-note-title"
              />
              <div className="flex gap-2">
                {isEditing ? (
                  <Button
                    onClick={saveNote}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                    data-testid="button-save-note"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    data-testid="button-edit-note"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={() => deleteNote(selectedNote.id)}
                  variant="destructive"
                  data-testid="button-delete-note"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0"
              disabled={!isEditing}
              data-testid="textarea-note-content"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-24 w-24 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Note Selected</h3>
              <p className="text-muted-foreground">
                Select a note or create a new one to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
