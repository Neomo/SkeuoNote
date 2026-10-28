import React, { useState } from 'react';
import { X, Folder as FolderIcon, Trash2, Edit3, ArrowUpRight, Plus, Palette } from 'lucide-react';
import { Folder, Note, Tag } from '../types';
import { NoteCard } from './NoteCard';
import { soundEffects } from '../utils/audio';

interface FolderModalProps {
  folder: Folder | null;
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  soundEnabled?: boolean;
  onClose: () => void;
  onUpdateFolder: (updated: Folder) => void;
  onDeleteFolder: (folderId: string, deleteContainedNotes: boolean) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onRestoreToDesk: (noteId: string) => void;
  onCreateNoteInFolder: (folderId: string) => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  folder,
  notes,
  folders,
  tags,
  soundEnabled = true,
  onClose,
  onUpdateFolder,
  onDeleteFolder,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  onRestoreToDesk,
  onCreateNoteInFolder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(folder?.name || '');
  const [folderColor, setFolderColor] = useState(folder?.color || '#8b5a2b');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!folder) return null;

  const containedNotes = notes.filter((n) => n.folderId === folder.id);
  const filteredNotes = containedNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  const folderColors = [
    '#8b5a2b', // Amber leather
    '#2e5b88', // Navy slate
    '#2e7d32', // Forest green
    '#9c27b0', // Royal purple
    '#c2185b', // Burgundy wine
    '#37474f', // Charcoal slate
    '#d97706', // Warm terracotta
  ];

  const handleSaveInfo = () => {
    onUpdateFolder({
      ...folder,
      name: folderName.trim() || folder.name,
      color: folderColor,
    });
    setIsEditing(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[88vh] bg-[#fbf9f4] rounded-2xl shadow-2xl border-4 flex flex-col overflow-hidden text-neutral-800"
        style={{ borderColor: folder.color }}
      >
        {/* Folio Header (Skeuomorphic Folder Top Tab) */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b shadow-xs"
          style={{ backgroundColor: `${folder.color}15`, borderBottomColor: `${folder.color}35` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner text-white"
              style={{ backgroundColor: folder.color }}
            >
              <FolderIcon className="w-5 h-5 fill-white/20" />
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="px-2.5 py-1 text-base font-bold bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="文件夹名称"
                />
                <div className="flex items-center gap-1">
                  {folderColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFolderColor(c)}
                      className={`w-5 h-5 rounded-full border-2 ${folderColor === c ? 'scale-110 border-black' : 'border-white'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSaveInfo}
                  className="px-3 py-1 bg-amber-700 text-white text-xs font-semibold rounded-lg hover:bg-amber-800"
                >
                  保存
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-neutral-900 tracking-wide">{folder.name}</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-neutral-400 hover:text-amber-800 rounded"
                    title="重命名或修改颜色"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-neutral-500">
                  收纳共 <span className="font-semibold text-neutral-800">{containedNotes.length}</span> 条便签 ·
                  创建于 {new Date(folder.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCreateNoteInFolder(folder.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>在此归档新建便签</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="删除文件夹"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar within Folder */}
        <div className="px-6 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="在当前文件夹搜索便签内容与标题..."
            className="flex-1 max-w-sm px-3 py-1.5 text-xs bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <span className="text-xs text-neutral-500">
            提示：点击便签右上角「取出到桌面」可将便签从收纳盒取出并平铺回桌面
          </span>
        </div>

        {/* Notes Grid Inside Folder */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#faf7ee]">
          {filteredNotes.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <FolderIcon className="w-12 h-12 stroke-1 opacity-40" />
              <p className="text-sm">此文件夹内暂无收纳便签</p>
              <button
                type="button"
                onClick={() => onCreateNoteInFolder(folder.id)}
                className="text-xs font-medium text-amber-700 underline hover:text-amber-800"
              >
                立即添加第一条便签
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="relative group">
                  <div className="absolute top-2 right-12 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playPaperPeel(soundEnabled);
                        onRestoreToDesk(note.id);
                      }}
                      className="px-2 py-1 text-[11px] font-semibold bg-white/90 hover:bg-amber-600 hover:text-white text-neutral-700 rounded-md shadow-md border border-neutral-200 flex items-center gap-1 transition-colors"
                      title="放回主桌面自由摆放"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>取出到桌面</span>
                    </button>
                  </div>
                  <NoteCard
                    note={note}
                    folders={folders}
                    tags={tags}
                    soundEnabled={soundEnabled}
                    standalone
                    onUpdate={onUpdateNote}
                    onDelete={onDeleteNote}
                    onDuplicate={onDuplicateNote}
                    onContextMenu={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900 mb-2">删除文件夹确认</h3>
              <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                您正在删除「{folder.name}」。当前文件夹内共有 {containedNotes.length} 条便签，请选择处理方式：
              </p>

              <div className="space-y-2 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteFolder(folder.id, false);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-left text-xs text-neutral-800"
                >
                  <div className="font-bold text-neutral-900 mb-0.5">仅删除文件夹 (保留便签)</div>
                  <div className="text-neutral-500 text-[11px]">收纳的便签将移出文件夹，全部保留并展示在桌面上。</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteFolder(folder.id, true);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-left text-xs text-rose-900"
                >
                  <div className="font-bold text-rose-700 mb-0.5">删除文件夹 + 内部所有便签</div>
                  <div className="text-rose-600 text-[11px]">文件夹以及内部的所有 {containedNotes.length} 条便签将同时删除。</div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
