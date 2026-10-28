import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { Note, Folder, Tag } from '../types';
import { NoteCard } from './NoteCard';
import { isToday, isYesterday, isWithinDays } from '../utils/storage';

interface TimelineViewProps {
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

interface GroupedNotes {
  groupName: string;
  notes: Note[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
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
  // Sort all notes newest to oldest
  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);

  // Group into Today, Yesterday, This Week, Earlier
  const groups: GroupedNotes[] = [
    { groupName: '今天', notes: [] },
    { groupName: '昨天', notes: [] },
    { groupName: '近 7 天', notes: [] },
    { groupName: '更早记录', notes: [] },
  ];

  sorted.forEach((note) => {
    if (isToday(note.createdAt)) {
      groups[0].notes.push(note);
    } else if (isYesterday(note.createdAt)) {
      groups[1].notes.push(note);
    } else if (isWithinDays(note.createdAt, 7)) {
      groups[2].notes.push(note);
    } else {
      groups[3].notes.push(note);
    }
  });

  const activeGroups = groups.filter((g) => g.notes.length > 0);

  if (notes.length === 0) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-amber-900/60 p-6">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <h3 className="text-base font-bold mb-1">时间轴暂无记录</h3>
        <p className="text-xs">新建便签后将按时间线在此依序呈现</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto px-4 pt-20 pb-32 pointer-events-auto">
      <div className="max-w-4xl mx-auto relative">
        {/* Central brass timeline axis */}
        <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gradient-to-b from-amber-600 via-amber-700/60 to-transparent -translate-x-1/2" />

        <div className="space-y-12">
          {activeGroups.map((grp) => (
            <div key={grp.groupName} className="relative">
              {/* Group Header Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-300 text-amber-100 flex items-center justify-center shadow-md z-10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-300/60 shadow-sm flex items-center gap-2">
                  <span className="font-bold text-xs text-amber-950">{grp.groupName}</span>
                  <span className="text-[11px] text-amber-700/80 font-mono">({grp.notes.length} 条便签)</span>
                </div>
              </div>

              {/* Notes within group */}
              <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-6">
                {grp.notes.map((note) => (
                  <div key={note.id} className="relative">
                    {/* Timestamp bullet node */}
                    <div className="absolute -left-8 top-6 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
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
          ))}
        </div>
      </div>
    </div>
  );
};
