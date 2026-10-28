import React, { useState } from 'react';
import {
  Search,
  Plus,
  Archive,
  LayoutGrid,
  Filter,
  Star,
  Pin,
  Calendar,
  Folder as FolderIcon,
  Tag as TagIcon,
  Sparkles,
  HelpCircle,
  X,
  RotateCcw,
} from 'lucide-react';
import { Folder, Tag, TimeFilter } from '../types';

interface TopNavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (t: TimeFilter) => void;
  starFilter: boolean;
  onStarFilterChange: (v: boolean) => void;
  pinFilter: boolean;
  onPinFilterChange: (v: boolean) => void;
  selectedFolderId: string | null;
  onFolderFilterChange: (id: string | null) => void;
  selectedTagId: string | null;
  onTagFilterChange: (id: string | null) => void;
  folders: Folder[];
  tags: Tag[];
  onNewNote: () => void;
  onArchiveHistorical: () => void;
  onArrangeDesk: () => void;
  onOpenNewFolderModal: () => void;
  onOpenNewTagModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  starFilter,
  onStarFilterChange,
  pinFilter,
  onPinFilterChange,
  selectedFolderId,
  onFolderFilterChange,
  selectedTagId,
  onTagFilterChange,
  folders,
  tags,
  onNewNote,
  onArchiveHistorical,
  onArrangeDesk,
  onOpenNewFolderModal,
  onOpenNewTagModal,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const hasActiveFilters =
    starFilter || pinFilter || selectedFolderId || selectedTagId || timeFilter !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    onSearchChange('');
    onTimeFilterChange('all');
    onStarFilterChange(false);
    onPinFilterChange(false);
    onFolderFilterChange(null);
    onTagFilterChange(null);
  };

  return (
    <header className="fixed top-3 left-4 right-4 z-40 select-none pointer-events-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 bg-[#1e140d]/85 text-amber-50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-900/40 shadow-2xl">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-inner border border-amber-400/50">
            <span className="font-bold text-base text-amber-950 font-serif">S</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm text-amber-100 tracking-wide flex items-center gap-1.5">
              <span>SkeuoNotes</span>
              <span className="text-[10px] bg-amber-800/80 text-amber-200 px-1.5 py-0.2 rounded font-normal">
                3D拟物桌面
              </span>
            </h1>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-sm relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索便签内容、标题、标签..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/40 text-xs rounded-xl border border-amber-900/60 text-amber-50 placeholder-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:bg-black/60 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick Filter Badges (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5">
          {/* Star Filter */}
          <button
            type="button"
            onClick={() => onStarFilterChange(!starFilter)}
            className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all ${
              starFilter
                ? 'bg-amber-500 text-amber-950 font-semibold shadow-sm'
                : 'bg-black/30 text-amber-200/80 hover:bg-black/50 hover:text-white'
            }`}
          >
            <Star className={`w-3 h-3 ${starFilter ? 'fill-amber-950 text-amber-950' : ''}`} />
            <span>星标</span>
          </button>

          {/* Pin Filter */}
          <button
            type="button"
            onClick={() => onPinFilterChange(!pinFilter)}
            className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all ${
              pinFilter
                ? 'bg-amber-500 text-amber-950 font-semibold shadow-sm'
                : 'bg-black/30 text-amber-200/80 hover:bg-black/50 hover:text-white'
            }`}
          >
            <Pin className={`w-3 h-3 ${pinFilter ? 'fill-amber-950 text-amber-950' : ''}`} />
            <span>置顶</span>
          </button>

          {/* Time Filter Pill */}
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value as TimeFilter)}
            className="px-2 py-1 bg-black/30 text-amber-200/90 text-xs rounded-xl border border-amber-900/50 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-neutral-900 text-white">
              全部时间
            </option>
            <option value="today" className="bg-neutral-900 text-white">
              今天
            </option>
            <option value="yesterday" className="bg-neutral-900 text-white">
              昨天
            </option>
            <option value="week" className="bg-neutral-900 text-white">
              近 7 天
            </option>
            <option value="month" className="bg-neutral-900 text-white">
              近 30 天
            </option>
          </select>

          {/* Folder filter dropdown */}
          <select
            value={selectedFolderId || ''}
            onChange={(e) => onFolderFilterChange(e.target.value ? e.target.value : null)}
            className="px-2 py-1 bg-black/30 text-amber-200/90 text-xs rounded-xl border border-amber-900/50 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-neutral-900 text-white">
              全部文件夹
            </option>
            {folders.map((f) => (
              <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                📁 {f.name}
              </option>
            ))}
          </select>

          {/* Tag filter dropdown */}
          <select
            value={selectedTagId || ''}
            onChange={(e) => onTagFilterChange(e.target.value ? e.target.value : null)}
            className="px-2 py-1 bg-black/30 text-amber-200/90 text-xs rounded-xl border border-amber-900/50 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-neutral-900 text-white">
              全部标签
            </option>
            {tags.map((t) => (
              <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                🏷 {t.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="p-1 text-amber-300 hover:text-white"
              title="清除所有筛选"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* One-click Archive Historical Notes into Folders */}
          <button
            type="button"
            onClick={onArchiveHistorical}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-black/40 hover:bg-black/60 text-amber-200 border border-amber-800/60 shadow-sm transition-all hover:scale-102 active:scale-98"
            title="一键将历史非当日已归类便签收纳进对应拟物文件夹"
          >
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            <span>一键归档</span>
          </button>

          {/* Organize Desk Layout */}
          <button
            type="button"
            onClick={onArrangeDesk}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-black/40 hover:bg-black/60 text-amber-200 border border-amber-800/60 transition-all"
            title="一键将便签整理归位到桌面网格"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">整齐排布</span>
          </button>

          {/* New Note Button */}
          <button
            type="button"
            onClick={onNewNote}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-amber-950 shadow-lg hover:shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all border border-amber-300/80"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>新建便签</span>
          </button>
        </div>
      </div>
    </header>
  );
};
