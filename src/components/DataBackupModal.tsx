import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  HardDrive,
  FileText,
  FileJson,
  Trash2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { AppData } from '../types';
import {
  exportToJSON,
  exportToTXT,
  importFromJSON,
  cleanupEmptyData,
  getAutoBackupData,
} from '../utils/storage';
import { soundEffects } from '../utils/audio';

interface DataBackupModalProps {
  data: AppData;
  soundEnabled?: boolean;
  onClose: () => void;
  onRestoreData: (newData: AppData) => void;
  onClearAll: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  data,
  soundEnabled = true,
  onClose,
  onRestoreData,
  onClearAll,
}) => {
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoBackup = getAutoBackupData();

  const handleExportJSON = () => {
    soundEffects.playPaperRustle(soundEnabled);
    exportToJSON(data);
    setStatusMessage({ type: 'success', text: 'JSON 全量备份已成功导出到本地下载目录。' });
  };

  const handleExportTXT = () => {
    soundEffects.playPaperRustle(soundEnabled);
    exportToTXT(data);
    setStatusMessage({ type: 'success', text: 'TXT 纯文本阅读文档已成功导出。' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromJSON(content, data, importMode);
      if (res.success && res.newData) {
        soundEffects.playFolderSlide(soundEnabled);
        onRestoreData(res.newData);
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleCleanup = () => {
    soundEffects.playPenClick(soundEnabled);
    const { data: updated, cleanedFolders, cleanedTags } = cleanupEmptyData(data);
    onRestoreData(updated);
    setStatusMessage({
      type: 'success',
      text: `已清理 ${cleanedFolders} 个无便签的空文件夹，${cleanedTags} 个空标签。`,
    });
  };

  const handleRestoreAutoBackup = () => {
    if (!autoBackup) return;
    soundEffects.playFolderSlide(soundEnabled);
    onRestoreData(autoBackup);
    setStatusMessage({
      type: 'success',
      text: '已从本地自动备份还原数据！',
    });
  };

  // Estimate LocalStorage size
  const rawSizeKb = (JSON.stringify(data).length / 1024).toFixed(1);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#faf7f2] rounded-2xl shadow-2xl border border-neutral-300 flex flex-col overflow-hidden text-neutral-800"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#f0eae1] border-b border-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center shadow-sm">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">数据持久化与安全备份</h2>
              <p className="text-[11px] text-neutral-500">
                纯前端离线持久化 · 当前存储占用约 {rawSizeKb} KB ({data.notes.length} 条便签)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs max-h-[75vh]">
          {/* Section 1: Export */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-2.5 flex items-center gap-1.5 text-xs">
              <Download className="w-4 h-4 text-amber-700" />
              <span>批量数据导出 (备份与阅读)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3.5 rounded-xl border border-neutral-300 hover:border-amber-600 bg-white hover:bg-amber-50/50 flex items-start gap-3 text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 mb-0.5">导出 JSON 备份文件</div>
                  <div className="text-[11px] text-neutral-500 leading-normal">
                    包含便签、3D文件夹、标签、桌面坐标等全部配置，用于换电脑或备份恢复。
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportTXT}
                className="p-3.5 rounded-xl border border-neutral-300 hover:border-amber-600 bg-white hover:bg-amber-50/50 flex items-start gap-3 text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-sky-100 text-sky-800 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 mb-0.5">导出 TXT 纯文本</div>
                  <div className="text-[11px] text-neutral-500 leading-normal">
                    排版整齐的人性化纯文本，方便打印、发送到邮箱或在任何设备快速阅读。
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Import */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-2.5 flex items-center gap-1.5 text-xs">
              <Upload className="w-4 h-4 text-amber-700" />
              <span>外部备份导入恢复</span>
            </h3>

            <div className="bg-white p-4 rounded-xl border border-neutral-300 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-semibold text-neutral-700">导入策略：</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="accent-amber-600"
                  />
                  <span className="text-[11px]">增量合并 (推荐，保留现有便签)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === 'overwrite'}
                    onChange={() => setImportMode('overwrite')}
                    className="accent-amber-600"
                  />
                  <span className="text-[11px]">覆盖导入 (完全以导入文件为准)</span>
                </label>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>选择本地 JSON 备份文件导入</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Automatic Backup & Cleanup */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-2.5 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>系统自愈与安全维护</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto backup info */}
              <div className="p-3 bg-white rounded-xl border border-neutral-300 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 mb-1">自动定时备份</div>
                  <p className="text-[11px] text-neutral-500 mb-2">
                    {autoBackup?.lastBackupAt
                      ? `最近自动快照：${new Date(autoBackup.lastBackupAt).toLocaleString()}`
                      : '系统闲置时会自动生成本地独立快照'}
                  </p>
                </div>
                {autoBackup && (
                  <button
                    type="button"
                    onClick={handleRestoreAutoBackup}
                    className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md font-medium border self-start"
                  >
                    还原此自动快照
                  </button>
                )}
              </div>

              {/* Cleanup empty items */}
              <div className="p-3 bg-white rounded-xl border border-neutral-300 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 mb-1">清理无效数据</div>
                  <p className="text-[11px] text-neutral-500 mb-2">
                    一键扫描并清理未收纳任何便签的空文件夹与空标签。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCleanup}
                  className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md font-medium border self-start"
                >
                  执行数据清理
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Clear all data */}
          <div className="pt-2 border-t border-neutral-200">
            {showClearConfirm ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>确定要清空所有本地便签数据吗？此操作无法撤销！</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-normal">
                  建议在清空前先点击上方「导出 JSON 备份文件」保存副本。
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold"
                  >
                    确定清空全部数据
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md text-xs"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空所有本地数据并重置为初始状态</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
