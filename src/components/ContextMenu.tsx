import React, { useEffect, useRef } from 'react';
import { Pin, Star, Copy, Folder as FolderIcon, Trash2, Eraser, Palette } from 'lucide-react';
import { Note, Folder, NoteColor } from '../types';
import { soundEffects } from '../utils/audio';

interface ContextMenuProps {
  x: number;
  y: number;
  note: Note;
  folders: Folder[];
  soundEnabled?: boolean;
  onClose: () => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  note,
  folders,
  soundEnabled = true,
  onClose,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Ensure menu doesn't go offscreen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 280);

  const colors: { id: NoteColor; label: string }[] = [
    { id: 'yellow', label: '荧光黄' },
    { id: 'kraft', label: '牛皮纸' },
    { id: 'green', label: '清风绿' },
    { id: 'pink', label: '淡樱粉' },
    { id: 'purple', label: '薰衣紫' },
    { id: 'slate', label: '岩石灰' },
    { id: 'parchment', label: '羊皮纸' },
    { id: 'blue', label: '天空蓝' },
    { id: 'dark', label: '黑耀石' },
  ];

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-52 bg-[#fdfbf7] text-neutral-800 rounded-xl shadow-2xl border border-neutral-300 py-1.5 text-xs select-none animate-in fade-in zoom-in-95"
    >
      <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 border-b border-neutral-200 uppercase tracking-wider">
        便签快捷操作
      </div>

      {/* Pin */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playPinPop(soundEnabled);
          onUpdateNote({
            ...note,
            isPinned: !note.isPinned,
            zIndex: !note.isPinned ? 95 : 20,
            updatedAt: Date.now(),
          });
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-amber-100/70 text-left transition-colors"
      >
        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-amber-600 fill-amber-600' : 'text-neutral-500'}`} />
        <span>{note.isPinned ? '取消桌面置顶' : '固定置顶在桌面'}</span>
      </button>

      {/* Star */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playPinPop(soundEnabled);
          onUpdateNote({
            ...note,
            isStarred: !note.isStarred,
            updatedAt: Date.now(),
          });
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-amber-100/70 text-left transition-colors"
      >
        <Star className={`w-3.5 h-3.5 ${note.isStarred ? 'text-amber-500 fill-amber-500' : 'text-neutral-500'}`} />
        <span>{note.isStarred ? '取消重点星标' : '标记为重点星标'}</span>
      </button>

      {/* Duplicate */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playPaperRustle(soundEnabled);
          onDuplicateNote(note);
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-amber-100/70 text-left transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-neutral-500" />
        <span>复制此便签</span>
      </button>

      {/* Clear Content */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playPenClick(soundEnabled);
          onUpdateNote({
            ...note,
            content: '',
            items: [],
            updatedAt: Date.now(),
          });
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-amber-100/70 text-left transition-colors"
      >
        <Eraser className="w-3.5 h-3.5 text-neutral-500" />
        <span>一键清空内容</span>
      </button>

      {/* Folder Submenu */}
      <div className="border-t border-neutral-200 my-1 pt-1">
        <div className="px-3 py-0.5 text-[10px] text-neutral-400 font-medium">归属文件夹</div>
        <button
          type="button"
          onClick={() => {
            onUpdateNote({ ...note, folderId: null, isArchivedInFolder: false, updatedAt: Date.now() });
            onClose();
          }}
          className={`w-full px-3 py-1 text-left flex items-center gap-2 text-[11px] ${
            !note.folderId ? 'font-bold text-amber-700 bg-amber-50' : 'hover:bg-amber-50 text-neutral-600'
          }`}
        >
          <span>桌面未归类</span>
        </button>
        {folders.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              soundEffects.playFolderSlide(soundEnabled);
              onUpdateNote({ ...note, folderId: f.id, updatedAt: Date.now() });
              onClose();
            }}
            className={`w-full px-3 py-1 text-left flex items-center gap-2 text-[11px] ${
              note.folderId === f.id ? 'font-bold text-amber-700 bg-amber-50' : 'hover:bg-amber-50 text-neutral-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
            <span className="truncate">{f.name}</span>
          </button>
        ))}
      </div>

      {/* Delete */}
      <div className="border-t border-neutral-200 mt-1 pt-1">
        <button
          type="button"
          onClick={() => {
            soundEffects.playPaperPeel(soundEnabled);
            onDeleteNote(note.id);
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 text-left transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>删除便签</span>
        </button>
      </div>
    </div>
  );
};
