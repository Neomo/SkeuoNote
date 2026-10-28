/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AppData,
  Note,
  Folder,
  Tag,
  AppSettings,
  TimeFilter,
  ViewMode,
  NoteColor,
} from './types';
import {
  loadStoredData,
  saveStoredData,
  autoBackupData,
  isToday,
  isYesterday,
  isWithinDays,
} from './utils/storage';
import { soundEffects } from './utils/audio';

import { ThreeDeskScene } from './components/ThreeDeskScene';
import { NoteCard } from './components/NoteCard';
import { TopNavbar } from './components/TopNavbar';
import { BottomControlDock } from './components/BottomControlDock';
import { ContextMenu } from './components/ContextMenu';
import { FolderModal } from './components/FolderModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { TagManagerModal } from './components/TagManagerModal';
import { DataBackupModal } from './components/DataBackupModal';
import { TimelineView } from './components/TimelineView';
import { GridView } from './components/GridView';
import { RandomCardView } from './components/RandomCardView';
import { ReminderToast } from './components/ReminderToast';

export default function App() {
  // 1. Core State
  const [data, setData] = useState<AppData>(() => loadStoredData());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [starFilter, setStarFilter] = useState(false);
  const [pinFilter, setPinFilter] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // Active Modals & Overlays
  const [activeFolderModalId, setActiveFolderModalId] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [contextMenuState, setContextMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    note: Note | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    note: null,
  });

  // Track dragged note for 3D folder drop target detection
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [hovered3DFolderId, setHovered3DFolderId] = useState<string | null>(null);

  // Auto-save debounce to LocalStorage
  const saveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveStoredData(data);
    }, 400);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data]);

  // Periodic automatic backup every 2 minutes
  useEffect(() => {
    const backupInterval = setInterval(() => {
      autoBackupData(data);
    }, 120000);
    return () => clearInterval(backupInterval);
  }, [data]);

  // Folder note count mapping
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.folders.forEach((f) => {
      counts[f.id] = data.notes.filter((n) => n.folderId === f.id).length;
    });
    return counts;
  }, [data.folders, data.notes]);

  // 2. Note Management Operations
  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    }));
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  }, []);

  const handleDuplicateNote = useCallback((note: Note) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${note.title || '便签'} (副本)`,
      x: Math.min(window.innerWidth - 320, note.x + 35),
      y: Math.min(window.innerHeight - 340, note.y + 35),
      zIndex: 25,
      rotation: (Math.random() - 0.5) * 4,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
    }));
  }, []);

  const handleCreateNewNote = useCallback(() => {
    soundEffects.playPaperPeel(data.settings.soundEffects);
    const colors: NoteColor[] = ['yellow', 'kraft', 'green', 'pink', 'purple', 'slate', 'parchment', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Place randomly near center
    const cx = Math.max(80, Math.min(window.innerWidth - 380, window.innerWidth / 2 - 140 + (Math.random() - 0.5) * 160));
    const cy = Math.max(90, Math.min(window.innerHeight - 380, window.innerHeight / 2 - 140 + (Math.random() - 0.5) * 120));

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '新建灵感便签',
      content: '',
      colorTheme: randomColor,
      fontSize: 'base',
      pinStyle: 'pushpin',
      isPinned: false,
      isStarred: false,
      folderId: selectedFolderId || null,
      tagIds: selectedTagId ? [selectedTagId] : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      x: cx,
      y: cy,
      width: 280,
      height: 290,
      zIndex: 35,
      rotation: (Math.random() - 0.5) * 4,
      isArchivedInFolder: false,
    };

    setData((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
    }));
  }, [data.settings.soundEffects, selectedFolderId, selectedTagId]);

  // One-click Archive historical non-today notes that have folder assignment
  const handleArchiveHistoricalNotes = useCallback(() => {
    soundEffects.playFolderSlide(data.settings.soundEffects);
    let count = 0;

    setData((prev) => {
      const updatedNotes = prev.notes.map((note) => {
        // If note has a folder assigned AND was not created today AND is not pinned
        if (note.folderId && !isToday(note.createdAt) && !note.isPinned && !note.isArchivedInFolder) {
          count++;
          return {
            ...note,
            isArchivedInFolder: true,
            updatedAt: Date.now(),
          };
        }
        return note;
      });

      return {
        ...prev,
        notes: updatedNotes,
      };
    });
  }, [data.settings.soundEffects]);

  // Arrange notes neatly on desktop
  const handleArrangeDesk = useCallback(() => {
    soundEffects.playPaperRustle(data.settings.soundEffects);
    const startX = 100;
    const startY = 90;
    const colWidth = 310;
    const rowHeight = 320;
    const maxCols = Math.max(1, Math.floor((window.innerWidth - startX - 280) / colWidth));

    setData((prev) => {
      let currentIdx = 0;
      const updatedNotes = prev.notes.map((note) => {
        // Only arrange notes currently showing on desktop
        if (isToday(note.createdAt) || note.isPinned || !note.isArchivedInFolder) {
          const col = currentIdx % maxCols;
          const row = Math.floor(currentIdx / maxCols);
          currentIdx++;

          return {
            ...note,
            x: startX + col * colWidth,
            y: startY + row * rowHeight,
            rotation: (Math.random() - 0.5) * 2,
            updatedAt: Date.now(),
          };
        }
        return note;
      });

      return {
        ...prev,
        notes: updatedNotes,
      };
    });
  }, [data.settings.soundEffects]);

  // Retrieve note from folder back to desk
  const handleRestoreToDesk = useCallback((noteId: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              isArchivedInFolder: false,
              x: 140 + Math.random() * 200,
              y: 120 + Math.random() * 150,
              updatedAt: Date.now(),
            }
          : n
      ),
    }));
  }, []);

  // Update Settings
  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setData((prev) => ({
      ...prev,
      settings: newSettings,
    }));
  }, []);

  // Context Menu Handler
  const handleContextMenu = useCallback((e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    setContextMenuState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      note,
    });
  }, []);

  // Filter notes based on current search & filter states
  const filteredNotes = useMemo(() => {
    return data.notes.filter((note) => {
      // 1. Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title?.toLowerCase().includes(q);
        const matchesContent = note.content?.toLowerCase().includes(q);
        const matchesItems = note.items?.some((it) => it.text.toLowerCase().includes(q));
        const matchesTags = note.tagIds.some((tid) => {
          const tag = data.tags.find((t) => t.id === tid);
          return tag && tag.name.toLowerCase().includes(q);
        });
        if (!matchesTitle && !matchesContent && !matchesItems && !matchesTags) {
          return false;
        }
      }

      // 2. Star filter
      if (starFilter && !note.isStarred) {
        return false;
      }

      // 3. Pin filter
      if (pinFilter && !note.isPinned) {
        return false;
      }

      // 4. Time filter
      if (timeFilter === 'today' && !isToday(note.createdAt)) return false;
      if (timeFilter === 'yesterday' && !isYesterday(note.createdAt)) return false;
      if (timeFilter === 'week' && !isWithinDays(note.createdAt, 7)) return false;
      if (timeFilter === 'month' && !isWithinDays(note.createdAt, 30)) return false;

      // 5. Folder filter
      if (selectedFolderId && note.folderId !== selectedFolderId) {
        return false;
      }

      // 6. Tag filter
      if (selectedTagId && !note.tagIds.includes(selectedTagId)) {
        return false;
      }

      return true;
    });
  }, [data.notes, data.tags, searchQuery, starFilter, pinFilter, timeFilter, selectedFolderId, selectedTagId]);

  // Notes displayed specifically in Default Desktop Mode:
  // Rule:
  // 1. All notes created TODAY default to display on desk (even if folderId is assigned, unless explicitly archived).
  // 2. All PINNED (置顶) notes stay on the top layer of desktop.
  // 3. Notes with `!isArchivedInFolder` display on desk.
  const desktopNotes = useMemo(() => {
    return filteredNotes.filter((note) => {
      // Pinned notes always show on desk
      if (note.isPinned) return true;

      // In Default Desktop Mode:
      // Show if created today, OR if not archived into a folder
      if (isToday(note.createdAt)) {
        return true;
      }

      // Non-today notes only show if not archived in folder
      return !note.isArchivedInFolder;
    });
  }, [filteredNotes]);

  const activeFolder = useMemo(() => {
    return data.folders.find((f) => f.id === activeFolderModalId) || null;
  }, [data.folders, activeFolderModalId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#18110b] text-neutral-800 select-none">
      {/* 1. Three.js 3D Skeuomorphic Desk Scene */}
      {data.settings.enable3D ? (
        <ThreeDeskScene
          deskStyle={data.settings.deskStyle}
          brightness={data.settings.deskBrightness}
          enableParallax={data.settings.enableParallax}
          folders={data.folders}
          folderCounts={folderCounts}
          hoveredFolderId={hovered3DFolderId}
          onFolderClick={(folderId) => {
            soundEffects.playFolderSlide(data.settings.soundEffects);
            setActiveFolderModalId(folderId);
          }}
        />
      ) : (
        /* Fallback 2D Skeuomorphic Desk Surface */
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: data.settings.deskStyle === 'dark-walnut' ? '#2d1b11' : '#b3824f',
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 2. Top Navigation Bar */}
      <TopNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        starFilter={starFilter}
        onStarFilterChange={setStarFilter}
        pinFilter={pinFilter}
        onPinFilterChange={setPinFilter}
        selectedFolderId={selectedFolderId}
        onFolderFilterChange={setSelectedFolderId}
        selectedTagId={selectedTagId}
        onTagFilterChange={setSelectedTagId}
        folders={data.folders}
        tags={data.tags}
        onNewNote={handleCreateNewNote}
        onArchiveHistorical={handleArchiveHistoricalNotes}
        onArrangeDesk={handleArrangeDesk}
        onOpenNewFolderModal={() => setShowCreateFolderModal(true)}
        onOpenNewTagModal={() => setShowTagManagerModal(true)}
      />

      {/* 3. Main View Mode Renderers */}
      {data.settings.viewMode === 'desk' && (
        /* Default Desktop Mode: Notes floating directly on the 3D surface */
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {desktopNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              folders={data.folders}
              tags={data.tags}
              soundEnabled={data.settings.soundEffects}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onDuplicate={handleDuplicateNote}
              onContextMenu={handleContextMenu}
              onDragStart={(n) => setDraggedNote(n)}
              onDragEnd={(n) => {
                setDraggedNote(null);
                setHovered3DFolderId(null);
              }}
              onOpenFolder={(fId) => setActiveFolderModalId(fId)}
            />
          ))}

          {desktopNotes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-100/70 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center max-w-sm shadow-xl">
                <p className="text-sm font-semibold mb-1 text-amber-200">桌面当前没有今日便签或置顶便签</p>
                <p className="text-xs text-amber-300/60 mb-3">历史便签已安全归档在右侧 3D 拟物文件夹中</p>
                <button
                  type="button"
                  onClick={handleCreateNewNote}
                  className="pointer-events-auto px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md"
                >
                  + 新建今日便签
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {data.settings.viewMode === 'grid' && (
        <GridView
          notes={filteredNotes}
          folders={data.folders}
          tags={data.tags}
          soundEnabled={data.settings.soundEffects}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          onContextMenu={handleContextMenu}
          onOpenFolder={(fId) => setActiveFolderModalId(fId)}
        />
      )}

      {data.settings.viewMode === 'timeline' && (
        <TimelineView
          notes={filteredNotes}
          folders={data.folders}
          tags={data.tags}
          soundEnabled={data.settings.soundEffects}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          onContextMenu={handleContextMenu}
          onOpenFolder={(fId) => setActiveFolderModalId(fId)}
        />
      )}

      {data.settings.viewMode === 'random' && (
        <RandomCardView
          notes={filteredNotes}
          folders={data.folders}
          tags={data.tags}
          soundEnabled={data.settings.soundEffects}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
        />
      )}

      {/* 4. Bottom Control Dock (View Modes, Settings, Data Backup) */}
      <BottomControlDock
        settings={data.settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenBackupModal={() => setShowBackupModal(true)}
        onOpenFolderModal={() => setShowCreateFolderModal(true)}
        onOpenTagModal={() => setShowTagManagerModal(true)}
        notesCount={data.notes.length}
        foldersCount={data.folders.length}
      />

      {/* 5. Context Menu for Notes */}
      {contextMenuState.visible && contextMenuState.note && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          note={contextMenuState.note}
          folders={data.folders}
          soundEnabled={data.settings.soundEffects}
          onClose={() => setContextMenuState({ visible: false, x: 0, y: 0, note: null })}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
        />
      )}

      {/* 6. Active Folder Modal (Inspect & Retrieve notes) */}
      <FolderModal
        folder={activeFolder}
        notes={data.notes}
        folders={data.folders}
        tags={data.tags}
        soundEnabled={data.settings.soundEffects}
        onClose={() => setActiveFolderModalId(null)}
        onUpdateFolder={(updatedFolder) => {
          setData((prev) => ({
            ...prev,
            folders: prev.folders.map((f) => (f.id === updatedFolder.id ? updatedFolder : f)),
          }));
        }}
        onDeleteFolder={(folderId, deleteContainedNotes) => {
          setData((prev) => {
            const nextFolders = prev.folders.filter((f) => f.id !== folderId);
            let nextNotes = prev.notes;

            if (deleteContainedNotes) {
              nextNotes = prev.notes.filter((n) => n.folderId !== folderId);
            } else {
              // Unbind notes from folder so they return to desk
              nextNotes = prev.notes.map((n) =>
                n.folderId === folderId ? { ...n, folderId: null, isArchivedInFolder: false } : n
              );
            }

            return {
              ...prev,
              folders: nextFolders,
              notes: nextNotes,
            };
          });
          setActiveFolderModalId(null);
        }}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onDuplicateNote={handleDuplicateNote}
        onRestoreToDesk={handleRestoreToDesk}
        onCreateNoteInFolder={(folderId) => {
          const colors: NoteColor[] = ['yellow', 'kraft', 'green', 'pink', 'purple', 'parchment'];
          const newNote: Note = {
            id: `note-${Date.now()}`,
            title: '归档便签',
            content: '',
            colorTheme: colors[Math.floor(Math.random() * colors.length)],
            fontSize: 'base',
            pinStyle: 'clip',
            isPinned: false,
            isStarred: false,
            folderId,
            tagIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            x: 200,
            y: 150,
            width: 280,
            height: 290,
            zIndex: 10,
            rotation: 0,
            isArchivedInFolder: true,
          };
          setData((prev) => ({
            ...prev,
            notes: [...prev.notes, newNote],
          }));
        }}
      />

      {/* 7. Create Folder Modal */}
      {showCreateFolderModal && (
        <CreateFolderModal
          soundEnabled={data.settings.soundEffects}
          onClose={() => setShowCreateFolderModal(false)}
          onCreateFolder={(newFolder) => {
            setData((prev) => ({
              ...prev,
              folders: [...prev.folders, newFolder],
            }));
          }}
        />
      )}

      {/* 8. Tag Manager Modal */}
      {showTagManagerModal && (
        <TagManagerModal
          tags={data.tags}
          notes={data.notes}
          soundEnabled={data.settings.soundEffects}
          onClose={() => setShowTagManagerModal(false)}
          onCreateTag={(newTag) => {
            setData((prev) => ({
              ...prev,
              tags: [...prev.tags, newTag],
            }));
          }}
          onUpdateTag={(updatedTag) => {
            setData((prev) => ({
              ...prev,
              tags: prev.tags.map((t) => (t.id === updatedTag.id ? updatedTag : t)),
            }));
          }}
          onDeleteTag={(tagId) => {
            setData((prev) => ({
              ...prev,
              tags: prev.tags.filter((t) => t.id !== tagId),
              notes: prev.notes.map((n) => ({
                ...n,
                tagIds: n.tagIds.filter((tid) => tid !== tagId),
              })),
            }));
          }}
        />
      )}

      {/* 9. Data Backup & Security Modal */}
      {showBackupModal && (
        <DataBackupModal
          data={data}
          soundEnabled={data.settings.soundEffects}
          onClose={() => setShowBackupModal(false)}
          onRestoreData={(newData) => setData(newData)}
          onClearAll={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />
      )}

      {/* 10. Local Memo Reminder Alert */}
      <ReminderToast
        notes={data.notes}
        soundEnabled={data.settings.soundEffects}
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
}
