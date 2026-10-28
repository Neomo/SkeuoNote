import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  Star,
  Folder as FolderIcon,
  Clock,
  Trash2,
  Copy,
  CheckSquare,
  Square,
  Plus,
  Palette,
  Type,
  Archive,
  Maximize2,
  Check,
  Bell,
  X,
} from 'lucide-react';
import { Note, NoteColor, FontSize, NotePinStyle, Folder, Tag } from '../types';
import { formatTimeWatermark } from '../utils/storage';
import { soundEffects } from '../utils/audio';

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  tags: Tag[];
  isSelected?: boolean;
  soundEnabled?: boolean;
  onUpdate: (updatedNote: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate: (note: Note) => void;
  onContextMenu: (e: React.MouseEvent, note: Note) => void;
  onDragStart?: (note: Note) => void;
  onDragEnd?: (note: Note, newX: number, newY: number) => void;
  onOpenFolder?: (folderId: string) => void;
  standalone?: boolean; // When rendered in single view or timeline
}

const COLOR_CLASSES: Record<NoteColor, { bg: string; border: string; text: string; header: string; accent: string }> = {
  yellow: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-950',
    border: 'border-yellow-300/80',
    text: 'text-amber-950',
    header: 'bg-yellow-200/50',
    accent: '#eab308',
  },
  kraft: {
    bg: 'bg-gradient-to-br from-[#f5ede1] to-[#e4d0b6] text-[#4a3423]',
    border: 'border-[#cca87e]',
    text: 'text-[#3d2715]',
    header: 'bg-[#d8b993]/40',
    accent: '#a87446',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-950',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    header: 'bg-emerald-200/50',
    accent: '#10b981',
  },
  pink: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-100 text-pink-950',
    border: 'border-pink-300',
    text: 'text-pink-950',
    header: 'bg-pink-200/50',
    accent: '#ec4899',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-950',
    border: 'border-purple-300',
    text: 'text-purple-950',
    header: 'bg-purple-200/50',
    accent: '#a855f7',
  },
  slate: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900',
    border: 'border-slate-300',
    text: 'text-slate-900',
    header: 'bg-slate-200/60',
    accent: '#64748b',
  },
  parchment: {
    bg: 'bg-gradient-to-br from-[#faf4e6] to-[#f2e5c8] text-[#3d2b1f]',
    border: 'border-[#dfcca0]',
    text: 'text-[#362417]',
    header: 'bg-[#e7d4a9]/50',
    accent: '#c29b55',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-950',
    border: 'border-sky-300',
    text: 'text-sky-950',
    header: 'bg-sky-200/50',
    accent: '#0ea5e9',
  },
  dark: {
    bg: 'bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-100',
    border: 'border-neutral-700',
    text: 'text-neutral-100',
    header: 'bg-neutral-800/80',
    accent: '#eab308',
  },
};

const FONT_CLASSES: Record<FontSize, string> = {
  sm: 'text-xs leading-relaxed',
  base: 'text-sm leading-relaxed',
  lg: 'text-base leading-relaxed font-medium',
  xl: 'text-lg leading-relaxed font-medium',
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folders,
  tags,
  soundEnabled = true,
  onUpdate,
  onDelete,
  onDuplicate,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onOpenFolder,
  standalone = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: note.x,
    initY: note.y,
  });
  const resizeStartRef = useRef<{ startX: number; startY: number; initW: number; initH: number }>({
    startX: 0,
    startY: 0,
    initW: note.width,
    initH: note.height,
  });

  const colors: NoteColor[] = ['yellow', 'kraft', 'green', 'pink', 'purple', 'slate', 'parchment', 'blue', 'dark'];
  const fontSizes: FontSize[] = ['sm', 'base', 'lg', 'xl'];

  const theme = COLOR_CLASSES[note.colorTheme] || COLOR_CLASSES.yellow;
  const currentFolder = folders.find((f) => f.id === note.folderId);
  const currentTags = tags.filter((t) => note.tagIds.includes(t.id));

  // Handle Free Dragging on Desktop
  const handlePointerDownHeader = (e: React.PointerEvent) => {
    if (standalone || (e.target as HTMLElement).closest('button, input, select, textarea')) return;
    e.stopPropagation();

    setIsDragging(true);
    soundEffects.playPaperRustle(soundEnabled);
    if (onDragStart) onDragStart(note);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: note.x,
      initY: note.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent) => {
    if (!isDragging || standalone) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    const newX = Math.max(10, Math.min(window.innerWidth - note.width - 20, dragStartRef.current.initX + dx));
    const newY = Math.max(60, Math.min(window.innerHeight - 120, dragStartRef.current.initY + dy));

    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${newX - note.x}px, ${newY - note.y}px, 0) rotate(${note.rotation}deg) scale(1.02)`;
    }
  };

  const handlePointerUpHeader = (e: React.PointerEvent) => {
    if (!isDragging || standalone) return;
    setIsDragging(false);
    soundEffects.playPaperPeel(soundEnabled);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - note.width - 20, dragStartRef.current.initX + dx));
    const newY = Math.max(60, Math.min(window.innerHeight - 120, dragStartRef.current.initY + dy));

    if (cardRef.current) {
      cardRef.current.style.transform = `rotate(${note.rotation}deg)`;
    }

    const updated = {
      ...note,
      x: newX,
      y: newY,
      updatedAt: Date.now(),
      zIndex: note.isPinned ? 90 : Math.max(note.zIndex, 30),
    };

    onUpdate(updated);
    if (onDragEnd) onDragEnd(updated, newX, newY);
  };

  // Handle Free Resizing on Bottom Right Grip
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (standalone) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initW: note.width,
      initH: note.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing || standalone) return;
    const dw = e.clientX - resizeStartRef.current.startX;
    const dh = e.clientY - resizeStartRef.current.startY;

    const newW = Math.max(240, Math.min(600, resizeStartRef.current.initW + dw));
    const newH = Math.max(220, Math.min(700, resizeStartRef.current.initH + dh));

    if (cardRef.current) {
      cardRef.current.style.width = `${newW}px`;
      cardRef.current.style.height = `${newH}px`;
    }
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (!isResizing || standalone) return;
    setIsResizing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const dw = e.clientX - resizeStartRef.current.startX;
    const dh = e.clientY - resizeStartRef.current.startY;
    const newW = Math.max(240, Math.min(600, resizeStartRef.current.initW + dw));
    const newH = Math.max(220, Math.min(700, resizeStartRef.current.initH + dh));

    onUpdate({
      ...note,
      width: newW,
      height: newH,
      updatedAt: Date.now(),
    });
  };

  // Checklist Item Helpers
  const toggleItem = (itemId: string) => {
    soundEffects.playPenClick(soundEnabled);
    const updatedItems = (note.items || []).map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it));
    onUpdate({
      ...note,
      items: updatedItems,
      updatedAt: Date.now(),
    });
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    soundEffects.playPenClick(soundEnabled);
    const newItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    onUpdate({
      ...note,
      items: [...(note.items || []), newItem],
      updatedAt: Date.now(),
    });
    setNewChecklistText('');
  };

  const deleteChecklistItem = (itemId: string) => {
    const updatedItems = (note.items || []).filter((it) => it.id !== itemId);
    onUpdate({
      ...note,
      items: updatedItems,
      updatedAt: Date.now(),
    });
  };

  // Skeuomorphic Topper Render (Pushpin / Washi Tape / Paperclip)
  const renderTopper = () => {
    if (note.isPinned || note.pinStyle === 'pushpin') {
      return (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 cursor-pointer transition-transform hover:scale-110 active:scale-95 group"
          title={note.isPinned ? '已置顶固定在桌面 (点击取消置顶)' : '点击置顶固定'}
          onClick={(e) => {
            e.stopPropagation();
            soundEffects.playPinPop(soundEnabled);
            onUpdate({ ...note, isPinned: !note.isPinned, zIndex: !note.isPinned ? 99 : 20, updatedAt: Date.now() });
          }}
        >
          {/* 3D Skeuomorphic Brass Pushpin */}
          <div className="relative flex flex-col items-center">
            {/* Metal pin head */}
            <div className={`w-5 h-5 rounded-full shadow-md flex items-center justify-center border ${
              note.isPinned 
                ? 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-amber-700 ring-2 ring-amber-400/50 shadow-amber-900/40' 
                : 'bg-gradient-to-tr from-neutral-400 via-neutral-200 to-white border-neutral-400 shadow-neutral-900/30'
            }`}>
              <div className="w-2 h-2 rounded-full bg-white/70 shadow-inner" />
            </div>
            {/* Needle shadow projection */}
            <div className="w-1.5 h-2 bg-gradient-to-b from-neutral-600 to-transparent opacity-60 -mt-0.5" />
          </div>
        </div>
      );
    }

    if (note.pinStyle === 'tape') {
      return (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-24 h-6 opacity-85 shadow-sm transform -rotate-1 pointer-events-none"
          style={{
            backgroundColor: 'rgba(255, 255, 230, 0.75)',
            borderLeft: '2px dashed rgba(200, 190, 160, 0.4)',
            borderRight: '2px dashed rgba(200, 190, 160, 0.4)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="w-full h-full border-t border-b border-amber-200/50 opacity-40" />
        </div>
      );
    }

    // Default Paperclip
    return (
      <div className="absolute -top-3 left-6 z-20 w-4 h-8 pointer-events-none">
        <div className="w-3.5 h-7 border-2 border-amber-700/80 rounded-full shadow-sm bg-gradient-to-r from-amber-600/30 to-amber-200/30" />
      </div>
    );
  };

  const stylePosition: React.CSSProperties = standalone
    ? { position: 'relative', width: '100%', maxWidth: '420px', minHeight: '320px' }
    : {
        position: 'absolute',
        left: `${note.x}px`,
        top: `${note.y}px`,
        width: `${note.width}px`,
        height: `${note.height}px`,
        zIndex: note.isPinned ? 95 : note.zIndex,
        transform: `rotate(${note.rotation}deg)`,
      };

  return (
    <div
      ref={cardRef}
      onContextMenu={(e) => onContextMenu(e, note)}
      style={stylePosition}
      className={`group flex flex-col rounded-lg border shadow-xl select-none transition-shadow duration-150 ${theme.bg} ${theme.border} ${
        isDragging ? 'shadow-2xl opacity-95 scale-[1.02] cursor-grabbing ring-2 ring-amber-400' : 'hover:shadow-2xl'
      } ${note.isPinned ? 'ring-2 ring-amber-500/70 shadow-amber-950/20' : ''}`}
    >
      {/* 3D Skeuomorphic Fastener Topper */}
      {renderTopper()}

      {/* Note Header / Drag Handle */}
      <div
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className={`px-3 pt-3.5 pb-2 rounded-t-lg flex items-center justify-between border-b border-black/5 ${theme.header} ${
          standalone ? '' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Title or Quick Edit */}
        <div className="flex-1 mr-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={note.title}
              onBlur={() => setIsEditingTitle(false)}
              onChange={(e) => {
                onUpdate({ ...note, title: e.target.value, updatedAt: Date.now() });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="w-full bg-white/70 px-1.5 py-0.5 rounded text-xs font-bold text-neutral-900 border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="输入便签标题..."
            />
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="font-bold text-xs truncate tracking-wide cursor-text hover:underline opacity-90"
              title="点击编辑标题"
            >
              {note.title || '无标题便签'}
            </h3>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Star Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playPinPop(soundEnabled);
              onUpdate({ ...note, isStarred: !note.isStarred, updatedAt: Date.now() });
            }}
            title={note.isStarred ? '取消星标' : '添加星标'}
            className={`p-1 rounded transition-colors ${
              note.isStarred ? 'text-amber-500 hover:text-amber-600' : 'text-neutral-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${note.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>

          {/* Pin Top Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playPinPop(soundEnabled);
              onUpdate({
                ...note,
                isPinned: !note.isPinned,
                zIndex: !note.isPinned ? 95 : 20,
                updatedAt: Date.now(),
              });
            }}
            title={note.isPinned ? '取消置顶' : '固定置顶'}
            className={`p-1 rounded transition-colors ${
              note.isPinned ? 'text-amber-600 font-bold' : 'text-neutral-400 hover:text-amber-600'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-500 text-amber-600' : ''}`} />
          </button>

          {/* Color Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              title="便签底色"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 z-50 p-2 bg-white rounded-lg shadow-xl border border-neutral-200 grid grid-cols-3 gap-1.5 w-32"
              >
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      soundEffects.playPenClick(soundEnabled);
                      onUpdate({ ...note, colorTheme: c, updatedAt: Date.now() });
                      setShowColorPicker(false);
                    }}
                    className={`w-7 h-7 rounded border transition-transform hover:scale-110 flex items-center justify-center ${
                      c === 'yellow'
                        ? 'bg-yellow-200 border-yellow-400'
                        : c === 'kraft'
                        ? 'bg-[#e4d0b6] border-[#cca87e]'
                        : c === 'green'
                        ? 'bg-emerald-200 border-emerald-400'
                        : c === 'pink'
                        ? 'bg-pink-200 border-pink-400'
                        : c === 'purple'
                        ? 'bg-purple-200 border-purple-400'
                        : c === 'slate'
                        ? 'bg-slate-200 border-slate-400'
                        : c === 'parchment'
                        ? 'bg-[#f2e5c8] border-[#dfcca0]'
                        : c === 'blue'
                        ? 'bg-sky-200 border-sky-400'
                        : 'bg-neutral-800 border-neutral-600'
                    }`}
                  >
                    {note.colorTheme === c && <Check className="w-3.5 h-3.5 text-neutral-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playPaperPeel(soundEnabled);
              onDelete(note.id);
            }}
            title="删除便签"
            className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tags & Folder Meta Strip */}
      <div className="px-3 py-1 flex flex-wrap items-center gap-1.5 border-b border-black/5 text-[11px]">
        {/* Folder badge */}
        {currentFolder ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenFolder) onOpenFolder(currentFolder.id);
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/5 hover:bg-black/10 transition-colors"
            title={`所属文件夹：${currentFolder.name} (点击展开查看)`}
          >
            <FolderIcon className="w-2.5 h-2.5 text-amber-700" />
            <span className="truncate max-w-[80px]">{currentFolder.name}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFolderPicker(!showFolderPicker);
            }}
            className="text-[10px] text-neutral-400 hover:text-amber-800 inline-flex items-center gap-0.5"
            title="归属到文件夹"
          >
            <Plus className="w-2.5 h-2.5" /> 文件夹
          </button>
        )}

        {/* Folder picker popover */}
        {showFolderPicker && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-3 top-16 z-50 bg-white p-2 rounded-md shadow-xl border border-neutral-200 w-36 text-xs text-neutral-800"
          >
            <div className="font-semibold text-[11px] mb-1 text-neutral-500">归属文件夹</div>
            <button
              type="button"
              onClick={() => {
                onUpdate({ ...note, folderId: null, updatedAt: Date.now() });
                setShowFolderPicker(false);
              }}
              className="w-full text-left px-1.5 py-1 rounded hover:bg-amber-50 text-neutral-500 text-[11px]"
            >
              无 (放桌面)
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  soundEffects.playFolderSlide(soundEnabled);
                  onUpdate({ ...note, folderId: f.id, updatedAt: Date.now() });
                  setShowFolderPicker(false);
                }}
                className="w-full text-left px-1.5 py-1 rounded hover:bg-amber-50 flex items-center gap-1 text-[11px]"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Colorful Tags */}
        {currentTags.map((tag) => (
          <span
            key={tag.id}
            className="px-1.5 py-0.2 rounded-full text-[10px] text-white font-medium"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}

        {/* Reminder indicator */}
        {note.reminderAt && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-100/70 px-1 rounded ml-auto">
            <Bell className="w-2.5 h-2.5" />
            {new Date(note.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0 flex flex-col">
        {note.isChecklist ? (
          /* Checklist Mode */
          <div className="space-y-1.5 flex-1">
            {(note.items || []).map((item) => (
              <div key={item.id} className="flex items-start gap-1.5 group/item text-xs">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="mt-0.5 text-neutral-600 hover:text-amber-700 shrink-0"
                >
                  {item.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
                <span
                  className={`flex-1 break-words font-sans ${FONT_CLASSES[note.fontSize]} ${
                    item.completed ? 'line-through opacity-50' : ''
                  }`}
                >
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => deleteChecklistItem(item.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add checklist item */}
            <div className="flex items-center gap-1.5 pt-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addChecklistItem();
                }}
                placeholder="+ 添加待办事项..."
                className="flex-1 text-xs bg-white/40 placeholder-neutral-500/60 px-2 py-1 rounded border border-black/10 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-2 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        ) : (
          /* Plain Text Area with Auto-save */
          <textarea
            value={note.content}
            onChange={(e) => {
              onUpdate({ ...note, content: e.target.value, updatedAt: Date.now() });
            }}
            placeholder="写下灵感、备忘或代办..."
            className={`w-full flex-1 bg-transparent resize-none focus:outline-none placeholder-neutral-500/50 font-sans tracking-wide ${FONT_CLASSES[note.fontSize]}`}
          />
        )}
      </div>

      {/* Note Bottom Toolbar & Watermark */}
      <div className="px-3 py-1.5 bg-black/[0.03] border-t border-black/5 rounded-b-lg flex items-center justify-between text-[10px] text-neutral-500">
        {/* Watermark timestamp */}
        <span className="truncate font-mono opacity-70" title="创建与最后编辑记录">
          {formatTimeWatermark(note.createdAt, note.updatedAt)}
        </span>

        {/* Quick action bar */}
        <div className="flex items-center space-x-1 shrink-0 ml-1">
          {/* Toggle Checklist / Text */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playPenClick(soundEnabled);
              onUpdate({
                ...note,
                isChecklist: !note.isChecklist,
                items: note.items && note.items.length > 0 ? note.items : [{ id: 'it-1', text: note.content || '第一项待办', completed: false }],
                updatedAt: Date.now(),
              });
            }}
            title={note.isChecklist ? '切换为纯文本模式' : '切换为待办清单模式'}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700"
          >
            <CheckSquare className="w-3 h-3" />
          </button>

          {/* Font Size Toggle */}
          <button
            type="button"
            onClick={() => {
              const order: FontSize[] = ['sm', 'base', 'lg', 'xl'];
              const next = order[(order.indexOf(note.fontSize) + 1) % order.length];
              onUpdate({ ...note, fontSize: next, updatedAt: Date.now() });
            }}
            title={`字号切换 (当前: ${note.fontSize})`}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700"
          >
            <Type className="w-3 h-3" />
          </button>

          {/* Reminder Alarm Setter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReminderPicker(!showReminderPicker)}
              title="设置备忘提醒"
              className={`p-1 rounded transition-colors ${
                note.reminderAt ? 'text-amber-600 font-bold' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Clock className="w-3 h-3" />
            </button>

            {showReminderPicker && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-6 z-50 p-2 bg-white rounded-lg shadow-xl border border-neutral-200 text-xs w-44 text-neutral-800"
              >
                <div className="font-semibold text-[11px] mb-1.5 text-neutral-600">设置备忘提醒</div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({ ...note, reminderAt: Date.now() + 1000 * 60 * 10, updatedAt: Date.now() });
                      setShowReminderPicker(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-[11px]"
                  >
                    ⏱ 10 分钟后
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate({ ...note, reminderAt: Date.now() + 1000 * 60 * 60, updatedAt: Date.now() });
                      setShowReminderPicker(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-[11px]"
                  >
                    🕐 1 小时后
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(9, 0, 0, 0);
                      onUpdate({ ...note, reminderAt: tomorrow.getTime(), updatedAt: Date.now() });
                      setShowReminderPicker(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-[11px]"
                  >
                    ☀️ 明天上午 09:00
                  </button>
                  {note.reminderAt && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdate({ ...note, reminderAt: null, updatedAt: Date.now() });
                        setShowReminderPicker(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded text-rose-600 hover:bg-rose-50 text-[11px]"
                    >
                      ✕ 清除提醒
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Duplicate Note */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playPaperRustle(soundEnabled);
              onDuplicate(note);
            }}
            title="复制此便签"
            className="p-1 rounded text-neutral-400 hover:text-neutral-700"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Resize Handle (Bottom-Right Corner) */}
      {!standalone && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          title="拖拽缩放大小"
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100"
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-black/40" />
        </div>
      )}
    </div>
  );
};
