import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Folder } from '../types';
import { soundEffects } from '../utils/audio';

interface CreateFolderModalProps {
  soundEnabled?: boolean;
  onClose: () => void;
  onCreateFolder: (folder: Folder) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  soundEnabled = true,
  onClose,
  onCreateFolder,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8b5a2b');

  const folderColors = [
    { label: '复古皮革棕', hex: '#8b5a2b' },
    { label: '深海石板蓝', hex: '#2e5b88' },
    { label: '墨绿森林', hex: '#2e7d32' },
    { label: '典雅紫罗兰', hex: '#8e24aa' },
    { label: '勃艮第红酒', hex: '#c2185b' },
    { label: '暖色陶土黄', hex: '#d97706' },
    { label: '极简黑曜石', hex: '#374151' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEffects.playFolderSlide(soundEnabled);
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      color,
      description: description.trim(),
      createdAt: Date.now(),
    };
    onCreateFolder(newFolder);
    onClose();
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
            <FolderPlus className="w-5 h-5 text-amber-700" />
            <h2 className="text-sm font-bold text-neutral-900">新建 3D 拟物收纳文件夹</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">文件夹名称</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：技术规划 / 生活账单 / 读书手记"
              className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1.5">3D 材质颜色样式</label>
            <div className="grid grid-cols-2 gap-2">
              {folderColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`p-2 rounded-lg border flex items-center gap-2 text-left transition-all ${
                    color === c.hex
                      ? 'border-neutral-800 bg-white shadow-sm ring-1 ring-neutral-800 font-bold'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-white'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">简要描述 (选填)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="收纳用途或备忘说明..."
              className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-200/50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              创建文件夹
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
