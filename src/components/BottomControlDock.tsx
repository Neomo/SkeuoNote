import React, { useState } from 'react';
import {
  Monitor,
  LayoutGrid,
  Clock,
  Dices,
  Settings2,
  FolderPlus,
  Tag as TagIcon,
  HardDrive,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Eye,
  Sun,
  Layers,
} from 'lucide-react';
import { ViewMode, DeskStyle, AppSettings } from '../types';
import { soundEffects } from '../utils/audio';

interface BottomControlDockProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenBackupModal: () => void;
  onOpenFolderModal: () => void;
  onOpenTagModal: () => void;
  notesCount: number;
  foldersCount: number;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  settings,
  onUpdateSettings,
  onOpenBackupModal,
  onOpenFolderModal,
  onOpenTagModal,
  notesCount,
  foldersCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const views: { id: ViewMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'desk', label: '默认桌面', icon: Monitor },
    { id: 'grid', label: '全局平铺', icon: LayoutGrid },
    { id: 'timeline', label: '时间轴', icon: Clock },
    { id: 'random', label: '随机单显', icon: Dices },
  ];

  const deskStyles: { id: DeskStyle; name: string; color: string }[] = [
    { id: 'warm-oak', name: '暖色金橡木', color: '#b3824f' },
    { id: 'dark-walnut', name: '复古黑胡桃', color: '#3d2516' },
    { id: 'cork-board', name: '软木便签板', color: '#c79c60' },
    { id: 'leather-mat', name: '商务皮质垫', color: '#222831' },
    { id: 'slate-stone', name: '极简岩灰板', color: '#4b5563' },
  ];

  const handleViewChange = (v: ViewMode) => {
    soundEffects.playFolderSlide(settings.soundEffects);
    onUpdateSettings({ ...settings, viewMode: v });
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none transition-transform duration-300 pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%+16px)]' : 'translate-y-0'
      }`}
      style={{ maxWidth: 'min(940px, 94vw)' }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playPenClick(settings.soundEffects);
          setIsCollapsed(!isCollapsed);
        }}
        className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-t-lg bg-[#1e140d]/90 text-amber-200/80 text-[11px] border-t border-x border-amber-900/50 flex items-center gap-1 shadow-md hover:text-white transition-colors"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3 h-3" />
            <span>展开控制坞</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            <span>收起控制坞 (禅模式)</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      <div className="bg-[#18110b]/92 text-amber-100 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-900/50 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* 4 View Modes Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-amber-950/80">
          {views.map((v) => {
            const Icon = v.icon;
            const active = settings.viewMode === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleViewChange(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-amber-600 text-white shadow-md font-bold scale-102'
                    : 'text-amber-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Middle Quick Actions: New Folder & New Tag */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenFolderModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-xs text-amber-200/80 hover:text-white border border-amber-900/40 transition-colors"
            title="新建自定义3D文件夹"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>新建文件夹</span>
          </button>

          <button
            type="button"
            onClick={onOpenTagModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-xs text-amber-200/80 hover:text-white border border-amber-900/40 transition-colors"
            title="管理多维彩色标签"
          >
            <TagIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>标签管理</span>
          </button>
        </div>

        {/* Right Tools: Sound, Settings, Backup */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !settings.soundEffects;
              onUpdateSettings({ ...settings, soundEffects: next });
              soundEffects.playPenClick(next);
            }}
            title={settings.soundEffects ? '关闭拟物交互音效' : '开启拟物交互音效'}
            className={`p-1.5 rounded-lg transition-colors ${
              settings.soundEffects ? 'text-amber-400 bg-amber-950/40' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {settings.soundEffects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Drawer Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              title="3D桌面与视觉设置"
              className={`p-1.5 rounded-lg border transition-colors ${
                showSettingsDrawer
                  ? 'bg-amber-700 text-white border-amber-500'
                  : 'bg-black/30 hover:bg-black/50 text-amber-200/80 border-amber-900/40'
              }`}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Desktop Preferences Popover */}
            {showSettingsDrawer && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-11 z-50 w-72 bg-[#1c130b] text-amber-100 p-4 rounded-xl shadow-2xl border border-amber-900/80 text-xs space-y-4"
              >
                <div className="font-bold text-amber-200 flex items-center justify-between border-b border-amber-900/50 pb-2">
                  <span>3D 桌面视觉与环境</span>
                  <button
                    type="button"
                    onClick={() => setShowSettingsDrawer(false)}
                    className="text-amber-400/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Desk Style Picker */}
                <div>
                  <label className="text-[11px] text-amber-200/70 mb-1.5 block">桌面材质风格</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {deskStyles.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ ...settings, deskStyle: st.id });
                        }}
                        className={`px-2 py-1.5 rounded-lg border flex items-center gap-1.5 text-left text-[11px] ${
                          settings.deskStyle === st.id
                            ? 'border-amber-400 bg-amber-950/60 font-semibold text-white'
                            : 'border-amber-950 bg-black/30 text-amber-300/70 hover:bg-black/50'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: st.color }} />
                        <span className="truncate">{st.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parallax Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-amber-200/80">鼠标视差跟随效果</span>
                  <input
                    type="checkbox"
                    checked={settings.enableParallax}
                    onChange={(e) => {
                      onUpdateSettings({ ...settings, enableParallax: e.target.checked });
                    }}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* 3D Scene Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-200/80">Three.js 3D背景渲染</span>
                  <input
                    type="checkbox"
                    checked={settings.enable3D}
                    onChange={(e) => {
                      onUpdateSettings({ ...settings, enable3D: e.target.checked });
                    }}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Brightness Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-amber-200/70 mb-1">
                    <span>台灯环境光亮度</span>
                    <span>{settings.deskBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={settings.deskBrightness}
                    onChange={(e) => {
                      onUpdateSettings({ ...settings, deskBrightness: Number(e.target.value) });
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Data Backup & Restore Modal Button */}
          <button
            type="button"
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800/60 hover:bg-amber-700/80 text-xs font-semibold text-amber-100 border border-amber-600/40 shadow-sm transition-all"
            title="数据备份与导入导出"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">备份与安全</span>
          </button>
        </div>
      </div>
    </div>
  );
};
