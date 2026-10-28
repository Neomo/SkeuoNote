import React, { useState } from 'react';
import { X, Tag as TagIcon, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Tag, Note } from '../types';
import { soundEffects } from '../utils/audio';

interface TagManagerModalProps {
  tags: Tag[];
  notes: Note[];
  soundEnabled?: boolean;
  onClose: () => void;
  onCreateTag: (newTag: Tag) => void;
  onUpdateTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  tags,
  notes,
  soundEnabled = true,
  onClose,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#fb8c00');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const presetColors = [
    '#e53935', // Red
    '#fb8c00', // Orange
    '#fdd835', // Yellow
    '#43a047', // Green
    '#00acc1', // Cyan
    '#1e88e5', // Blue
    '#8e24aa', // Purple
    '#d81b60', // Pink
    '#546e7a', // Slate
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    soundEffects.playPenClick(soundEnabled);
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
    };
    onCreateTag(newTag);
    setNewTagName('');
  };

  const startEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = (tagId: string) => {
    if (!editName.trim()) return;
    onUpdateTag({
      id: tagId,
      name: editName.trim(),
      color: editColor,
    });
    setEditingTagId(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#faf7f2] rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden text-neutral-800"
      >
        <div className="px-6 py-4 bg-[#f0eae1] border-b border-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-amber-700" />
            <h2 className="text-sm font-bold text-neutral-900">多维彩色标签管理</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Add New Tag Form */}
          <form onSubmit={handleAdd} className="p-3 bg-white rounded-xl border border-neutral-200 space-y-2.5">
            <div className="font-semibold text-neutral-700 text-[11px]">新建彩色标签</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="标签名称 (如: 紧急/读书/财务)"
                className="flex-1 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg shadow-sm"
              >
                添加
              </button>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 pt-1">
              {presetColors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setNewTagColor(hex)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    newTagColor === hex ? 'scale-120 border-black ring-1 ring-amber-500' : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </form>

          {/* Existing Tags List */}
          <div>
            <div className="font-semibold text-neutral-700 text-[11px] mb-2">已创建标签 ({tags.length})</div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {tags.map((tag) => {
                const count = notes.filter((n) => n.tagIds.includes(tag.id)).length;
                const isEditing = editingTagId === tag.id;

                return (
                  <div
                    key={tag.id}
                    className="p-2 bg-white rounded-lg border border-neutral-200 flex items-center justify-between gap-2"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-neutral-50 border rounded text-xs"
                        />
                        <div className="flex items-center gap-1">
                          {presetColors.slice(0, 5).map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setEditColor(hex)}
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => saveEdit(tag.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium text-neutral-800 truncate">{tag.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">({count}条便签)</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(tag)}
                            className="p-1 text-neutral-400 hover:text-amber-800"
                            title="编辑标签"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTag(tag.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                            title="删除标签"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
