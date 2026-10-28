import React, { useState, useEffect } from 'react';
import { Dices, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Note, Folder, Tag } from '../types';
import { NoteCard } from './NoteCard';
import { soundEffects } from '../utils/audio';

interface RandomCardViewProps {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  soundEnabled?: boolean;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
}

export const RandomCardView: React.FC<RandomCardViewProps> = ({
  notes,
  folders,
  tags,
  soundEnabled = true,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (notes.length > 0 && currentIndex >= notes.length) {
      setCurrentIndex(0);
    }
  }, [notes.length, currentIndex]);

  const handleShuffle = () => {
    if (notes.length <= 1) return;
    soundEffects.playPaperRustle(soundEnabled);
    setIsFlipping(true);

    let next = Math.floor(Math.random() * notes.length);
    if (next === currentIndex) {
      next = (currentIndex + 1) % notes.length;
    }

    setTimeout(() => {
      setCurrentIndex(next);
      setIsFlipping(false);
    }, 200);
  };

  const handlePrev = () => {
    if (notes.length === 0) return;
    soundEffects.playPaperPeel(soundEnabled);
    setCurrentIndex((prev) => (prev - 1 + notes.length) % notes.length);
  };

  const handleNext = () => {
    if (notes.length === 0) return;
    soundEffects.playPaperPeel(soundEnabled);
    setCurrentIndex((prev) => (prev + 1) % notes.length);
  };

  if (notes.length === 0) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-amber-900/60 p-6">
        <Sparkles className="w-12 h-12 mb-3 opacity-50" />
        <h3 className="text-base font-bold mb-1">暂无便签可供抽检</h3>
        <p className="text-xs">请先在桌面新建便签或调整筛选条件</p>
      </div>
    );
  }

  const currentNote = notes[currentIndex] || notes[0];

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 select-none pointer-events-auto">
      {/* Top indicator banner */}
      <div className="mb-4 flex items-center gap-3 bg-black/40 text-white backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>随机单显回顾模式</span>
        <span className="text-amber-200/80 font-mono">
          [{currentIndex + 1} / {notes.length}]
        </span>
      </div>

      {/* Main Card Stage with flip transition */}
      <div
        className={`w-full max-w-md min-h-[360px] flex justify-center transition-all duration-300 ${
          isFlipping ? 'scale-90 rotate-y-90 opacity-40' : 'scale-100 rotate-0 opacity-100'
        }`}
      >
        <NoteCard
          note={currentNote}
          folders={folders}
          tags={tags}
          soundEnabled={soundEnabled}
          standalone
          onUpdate={onUpdateNote}
          onDelete={(id) => {
            onDeleteNote(id);
            handleShuffle();
          }}
          onDuplicate={onDuplicateNote}
          onContextMenu={() => {}}
        />
      </div>

      {/* Bottom control row */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={notes.length <= 1}
          className="p-2.5 rounded-full bg-white/80 hover:bg-white text-neutral-800 shadow-md border border-neutral-300 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          title="上一张便签"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleShuffle}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium text-xs shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border border-amber-500/40"
        >
          <Dices className="w-4 h-4" />
          <span>随机抽查下一张</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={notes.length <= 1}
          className="p-2.5 rounded-full bg-white/80 hover:bg-white text-neutral-800 shadow-md border border-neutral-300 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          title="下一张便签"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
