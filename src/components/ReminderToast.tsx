import React, { useEffect, useState, useRef } from 'react';
import { Bell, Clock, X, CheckCircle, ArrowRight } from 'lucide-react';
import { Note } from '../types';
import { soundEffects } from '../utils/audio';

interface ReminderToastProps {
  notes: Note[];
  soundEnabled?: boolean;
  onUpdateNote: (note: Note) => void;
  onOpenNote?: (note: Note) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  notes,
  soundEnabled = true,
  onUpdateNote,
  onOpenNote,
}) => {
  const [activeReminderNote, setActiveReminderNote] = useState<Note | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Polling interval checking for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      for (const note of notes) {
        if (note.reminderAt && note.reminderAt <= now && !notifiedIdsRef.current.has(note.id)) {
          notifiedIdsRef.current.add(note.id);
          setActiveReminderNote(note);
          soundEffects.playChime(soundEnabled);

          // Browser native notification fallback
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`便签备忘提醒: ${note.title || '便签日程'}`, {
                body: note.content.slice(0, 80) || '您设置的便签提醒时间已到。',
              });
            } catch {
              // ignore
            }
          }
          break;
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [notes, soundEnabled]);

  if (!activeReminderNote) return null;

  const handleDismiss = () => {
    // Clear reminder timestamp so it won't trigger again
    onUpdateNote({
      ...activeReminderNote,
      reminderAt: null,
      updatedAt: Date.now(),
    });
    setActiveReminderNote(null);
  };

  const handleSnooze = () => {
    // Snooze 10 minutes
    const snoozeTime = Date.now() + 1000 * 60 * 10;
    notifiedIdsRef.current.delete(activeReminderNote.id);
    onUpdateNote({
      ...activeReminderNote,
      reminderAt: snoozeTime,
      updatedAt: Date.now(),
    });
    setActiveReminderNote(null);
  };

  return (
    <div className="fixed top-18 right-6 z-50 max-w-sm w-full bg-[#fcf9f2] text-neutral-900 p-4 rounded-2xl shadow-2xl border-2 border-amber-500 animate-in slide-in-from-top-4 duration-300 select-none">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>便签备忘提醒</span>
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="font-bold text-xs truncate mb-1 text-neutral-900">
            {activeReminderNote.title || '无标题便签'}
          </h4>
          <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed mb-3">
            {activeReminderNote.content || '您设置的时间已到，请查看便签事项。'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>知道了</span>
            </button>

            <button
              type="button"
              onClick={handleSnooze}
              className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs"
            >
              推迟 10 分钟
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
