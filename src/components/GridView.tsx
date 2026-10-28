import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Note, Folder, Tag } from '../types';
import { NoteCard } from './NoteCard';

interface GridViewProps {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  soundEnabled?: boolean;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onContextMenu: (e: React.MouseEvent, note: Note) => void;
  onOpenFolder?: (folderId: string) => void;
}

export const GridView: React.FC<GridViewProps> = ({
  notes,
  folders,
  tags,
  soundEnabled = true,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  onContextMenu,
  onOpenFolder,
}) => {
  if (notes.length === 0) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-amber-900/60 p-6">
        <LayoutGrid className="w-12 h-12 mb-3 opacity-50" />
        <h3 className="text-base font-bold mb-1">平铺模式暂无便签</h3>
        <p className="text-xs">点击上方「新建便签」即可开始记录</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto px-6 pt-20 pb-32 pointer-events-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          {notes.map((note) => (
            <div key={note.id} className="w-full flex justify-center">
              <NoteCard
                note={note}
                folders={folders}
                tags={tags}
                soundEnabled={soundEnabled}
                standalone
                onUpdate={onUpdateNote}
                onDelete={onDeleteNote}
                onDuplicate={onDuplicateNote}
                onContextMenu={onContextMenu}
                onOpenFolder={onOpenFolder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
