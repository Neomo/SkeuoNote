import { AppData, Folder, Note, Tag, AppSettings } from '../types';

const STORAGE_KEY = 'skeuonotes_data_v1';
const AUTO_BACKUP_KEY = 'skeuonotes_autobackup';

export const DEFAULT_SETTINGS: AppSettings = {
  viewMode: 'desk',
  enable3D: true,
  enableParallax: true,
  deskStyle: 'warm-oak',
  deskBrightness: 100,
  enableFolderAnimations: true,
  soundEffects: true,
  autoArrangeOnMount: false,
};

export const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'folder-work',
    name: '工作项目',
    color: '#8b5a2b', // Leather amber brown
    createdAt: Date.now() - 86400000 * 3,
    description: '日常工作汇报、待办与核心会议纪要',
  },
  {
    id: 'folder-life',
    name: '生活随笔',
    color: '#2e5b88', // Slate navy blue
    createdAt: Date.now() - 86400000 * 5,
    description: '读书灵感、个人生活记录与采购备忘',
  },
  {
    id: 'folder-creative',
    name: '灵感抽屉',
    color: '#2e7d32', // Forest vintage green
    createdAt: Date.now() - 86400000 * 10,
    description: '突发奇想、设计手稿与未来计划',
  },
];

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-urgent', name: '重要紧急', color: '#e53935' },
  { id: 'tag-idea', name: '灵感火花', color: '#fb8c00' },
  { id: 'tag-todo', name: '待办清单', color: '#43a047' },
  { id: 'tag-reading', name: '阅读笔记', color: '#1e88e5' },
  { id: 'tag-archive', name: '长期归档', color: '#8e24aa' },
];

export function getInitialSeedData(): AppData {
  const now = Date.now();
  const todayMorning = new Date();
  todayMorning.setHours(9, 30, 0, 0);

  const yesterdayMorning = new Date();
  yesterdayMorning.setDate(yesterdayMorning.getDate() - 1);
  yesterdayMorning.setHours(14, 0, 0, 0);

  const seedNotes: Note[] = [
    {
      id: 'note-today-1',
      title: '📌 今日核心待办与日程',
      content: '1. 评审 Three.js 拟物桌面动画细节\n2. 验证纯前端本地持久化与一键归档\n3. 调试时间轴与随机单显卡片翻转\n4. 下午 16:30 团队茶歇交流',
      isChecklist: true,
      items: [
        { id: 'item-1', text: '评审 Three.js 拟物桌面与光影效果', completed: true },
        { id: 'item-2', text: '体验一键归档与文件夹展开收纳', completed: false },
        { id: 'item-3', text: '测试便签置顶、星标与自定义颜色', completed: false },
        { id: 'item-4', text: '导出一次本地 JSON 备份文件', completed: false },
      ],
      colorTheme: 'yellow',
      fontSize: 'base',
      pinStyle: 'pushpin',
      isPinned: true, // 置顶在桌面最上层
      isStarred: true, // 星标
      folderId: 'folder-work',
      tagIds: ['tag-urgent', 'tag-todo'],
      createdAt: todayMorning.getTime(),
      updatedAt: now - 1000 * 60 * 15,
      x: 120,
      y: 90,
      width: 290,
      height: 310,
      zIndex: 20,
      rotation: -1.5,
      isArchivedInFolder: false,
    },
    {
      id: 'note-today-2',
      title: '💡 拟物设计设计哲学',
      content: '让数字工具重拾实体温度：\n• 真实纸张纹理与卷角阴影\n• 黄铜图钉与和纸胶带固定\n• 原木桌面与柔和台灯侧光\n• 触手可及的收纳盒与抽屉',
      colorTheme: 'kraft',
      fontSize: 'base',
      pinStyle: 'tape',
      isPinned: false,
      isStarred: true,
      folderId: 'folder-creative',
      tagIds: ['tag-idea'],
      createdAt: todayMorning.getTime() + 1000 * 60 * 45,
      updatedAt: now - 1000 * 60 * 30,
      x: 450,
      y: 110,
      width: 280,
      height: 290,
      zIndex: 14,
      rotation: 1.8,
      isArchivedInFolder: false,
    },
    {
      id: 'note-today-3',
      title: '🌿 晚间生活备忘',
      content: '• 顺路买新鲜法棍和手冲咖啡豆\n• 浇阳台的迷迭香与尤加利\n• 整理书架上的摄影画册\n• 睡前阅读《设计中的设计》30分钟',
      colorTheme: 'green',
      fontSize: 'base',
      pinStyle: 'clip',
      isPinned: false,
      isStarred: false,
      folderId: 'folder-life',
      tagIds: ['tag-reading'],
      createdAt: todayMorning.getTime() + 1000 * 60 * 90,
      updatedAt: now - 1000 * 60 * 5,
      x: 770,
      y: 130,
      width: 270,
      height: 280,
      zIndex: 15,
      rotation: -0.8,
      isArchivedInFolder: false,
    },
    // Historical notes (created earlier)
    {
      id: 'note-hist-1',
      title: '📑 历史项目技术选型要点',
      content: '无后端本地持久化：\n利用 LocalStorage 配合独立分区隔离，数据绝不上传第三方服务器，实现真正的离线数据隐私。\n支持一键导出 JSON 和 TXT 纯文本。',
      colorTheme: 'parchment',
      fontSize: 'base',
      pinStyle: 'clip',
      isPinned: false,
      isStarred: false,
      folderId: 'folder-work',
      tagIds: ['tag-archive'],
      createdAt: yesterdayMorning.getTime(),
      updatedAt: yesterdayMorning.getTime() + 1000 * 60 * 60,
      x: 200,
      y: 200,
      width: 280,
      height: 280,
      zIndex: 8,
      rotation: 1.2,
      isArchivedInFolder: true, // Archived into folder
    },
    {
      id: 'note-hist-2',
      title: '☕ 周末咖啡探店清单',
      content: '1. 木质胡同小馆：深烘手冲与肉桂卷\n2. 庭院绿植咖啡：浅烘埃塞日晒\n3. 临窗书店：黑胶与拿铁',
      colorTheme: 'pink',
      fontSize: 'base',
      pinStyle: 'tape',
      isPinned: false,
      isStarred: false,
      folderId: 'folder-life',
      tagIds: ['tag-reading'],
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 4,
      x: 250,
      y: 240,
      width: 280,
      height: 270,
      zIndex: 5,
      rotation: -2.0,
      isArchivedInFolder: true, // Archived
    },
  ];

  return {
    version: 1,
    notes: seedNotes,
    folders: DEFAULT_FOLDERS,
    tags: DEFAULT_TAGS,
    settings: DEFAULT_SETTINGS,
    lastBackupAt: now,
  };
}

export function loadStoredData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveStoredData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    
    // Safely guarantee all fields exist
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings || {}),
    };

    const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
    const folders = Array.isArray(parsed.folders) && parsed.folders.length > 0 ? parsed.folders : DEFAULT_FOLDERS;
    const tags = Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : DEFAULT_TAGS;

    return {
      version: parsed.version || 1,
      notes,
      folders,
      tags,
      settings,
      lastBackupAt: parsed.lastBackupAt || Date.now(),
    };
  } catch (err) {
    console.error('Failed to load local storage data, using seed fallback', err);
    return getInitialSeedData();
  }
}

export function saveStoredData(data: AppData): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

export function autoBackupData(data: AppData): void {
  try {
    const backupPayload = {
      ...data,
      lastBackupAt: Date.now(),
    };
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backupPayload));
  } catch (err) {
    console.warn('Auto backup skipped (storage quota or private browsing)', err);
  }
}

export function getAutoBackupData(): AppData | null {
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

/** Check if a timestamp is on today */
export function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Check if a timestamp is on yesterday */
export function isYesterday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  );
}

/** Check if timestamp is in the last N days */
export function isWithinDays(timestamp: number, days: number): boolean {
  const diff = Date.now() - timestamp;
  return diff >= 0 && diff <= days * 86400000;
}

/** Format timestamp for skeuomorphic watermarks */
export function formatTimeWatermark(created: number, updated: number): string {
  const cDate = new Date(created);
  const uDate = new Date(updated);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const cStr = `${cDate.getFullYear()}-${pad(cDate.getMonth() + 1)}-${pad(cDate.getDate())} ${pad(cDate.getHours())}:${pad(cDate.getMinutes())}`;
  const uStr = `${pad(uDate.getHours())}:${pad(uDate.getMinutes())}`;

  return `记于 ${cStr} · 审于 ${uStr}`;
}

/** Format date nicely */
export function formatFriendlyDate(timestamp: number): string {
  if (isToday(timestamp)) return '今天';
  if (isYesterday(timestamp)) return '昨天';
  const d = new Date(timestamp);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

/** Export all data to JSON file */
export function exportToJSON(data: AppData): void {
  const exportObject = {
    ...data,
    exportedAt: new Date().toISOString(),
    source: 'SkeuoNotes-3D',
  };
  const jsonString = JSON.stringify(exportObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `SkeuoNotes_便签全量备份_${dateStr}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Export all notes to readable TXT document */
export function exportToTXT(data: AppData): void {
  const folderMap = new Map<string, string>();
  data.folders.forEach((f) => folderMap.set(f.id, f.name));

  const tagMap = new Map<string, string>();
  data.tags.forEach((t) => tagMap.set(t.id, t.name));

  let txt = `======================================================\n`;
  txt += `      SkeuoNotes 拟物便签系统 - 纯文本阅读备份\n`;
  txt += `      导出时间: ${new Date().toLocaleString()}\n`;
  txt += `      便签总计: ${data.notes.length} 条\n`;
  txt += `======================================================\n\n`;

  data.notes.forEach((note, index) => {
    const folderName = note.folderId ? folderMap.get(note.folderId) || '未分组' : '桌面未分组';
    const tagNames = note.tagIds.map((id) => tagMap.get(id) || '').filter(Boolean).join(', ') || '无标签';
    const createTime = new Date(note.createdAt).toLocaleString();
    const updateTime = new Date(note.updatedAt).toLocaleString();

    txt += `------------------------------------------------------\n`;
    txt += `【便签 ${index + 1}】 ${note.title || '无标题'}\n`;
    txt += `状态: ${note.isPinned ? '[已置顶] ' : ''}${note.isStarred ? '[★星标] ' : ''}\n`;
    txt += `所属文件夹: ${folderName}\n`;
    txt += `分类标签: ${tagNames}\n`;
    txt += `创建时间: ${createTime} | 最后更新: ${updateTime}\n`;
    txt += `------------------------------------------------------\n`;

    if (note.isChecklist && note.items && note.items.length > 0) {
      txt += `[清单事项]:\n`;
      note.items.forEach((item) => {
        txt += `  ${item.completed ? '☑' : '☐'} ${item.text}\n`;
      });
    }

    if (note.content) {
      txt += `[便签正文]:\n${note.content}\n`;
    }

    txt += `\n\n`;
  });

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `SkeuoNotes_便签文档_${dateStr}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Import JSON with overwrite or merge strategy */
export function importFromJSON(
  jsonText: string,
  currentData: AppData,
  mode: 'overwrite' | 'merge'
): { success: boolean; message: string; newData?: AppData } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || !Array.isArray(parsed.notes)) {
      return { success: false, message: '无效的便签备份文件，未找到便签数据列表' };
    }

    const importedNotes: Note[] = parsed.notes;
    const importedFolders: Folder[] = Array.isArray(parsed.folders) ? parsed.folders : [];
    const importedTags: Tag[] = Array.isArray(parsed.tags) ? parsed.tags : [];
    const importedSettings = parsed.settings || currentData.settings;

    if (mode === 'overwrite') {
      const mergedData: AppData = {
        version: parsed.version || 1,
        notes: importedNotes,
        folders: importedFolders.length > 0 ? importedFolders : currentData.folders,
        tags: importedTags.length > 0 ? importedTags : currentData.tags,
        settings: { ...currentData.settings, ...importedSettings },
        lastBackupAt: Date.now(),
      };
      saveStoredData(mergedData);
      return { success: true, message: `成功覆盖导入 ${importedNotes.length} 条便签`, newData: mergedData };
    } else {
      // Merge mode: deduplicate by id or generate new id if clash
      const existingNoteIds = new Set(currentData.notes.map((n) => n.id));
      const newNotes = [...currentData.notes];
      let addedCount = 0;
      let updatedCount = 0;

      importedNotes.forEach((impNote) => {
        if (existingNoteIds.has(impNote.id)) {
          // Update existing with newer timestamp
          const existingIdx = newNotes.findIndex((n) => n.id === impNote.id);
          if (existingIdx !== -1 && impNote.updatedAt > newNotes[existingIdx].updatedAt) {
            newNotes[existingIdx] = impNote;
            updatedCount++;
          }
        } else {
          newNotes.push(impNote);
          existingNoteIds.add(impNote.id);
          addedCount++;
        }
      });

      // Merge folders
      const folderMap = new Map<string, Folder>();
      currentData.folders.forEach((f) => folderMap.set(f.id, f));
      importedFolders.forEach((f) => {
        if (!folderMap.has(f.id)) folderMap.set(f.id, f);
      });

      // Merge tags
      const tagMap = new Map<string, Tag>();
      currentData.tags.forEach((t) => tagMap.set(t.id, t));
      importedTags.forEach((t) => {
        if (!tagMap.has(t.id)) tagMap.set(t.id, t);
      });

      const mergedData: AppData = {
        ...currentData,
        notes: newNotes,
        folders: Array.from(folderMap.values()),
        tags: Array.from(tagMap.values()),
        lastBackupAt: Date.now(),
      };
      saveStoredData(mergedData);
      return {
        success: true,
        message: `合并完成：新增 ${addedCount} 条便签，更新 ${updatedCount} 条`,
        newData: mergedData,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `解析备份文件失败: ${errorMsg}` };
  }
}

/** Clean up empty folders and empty tags */
export function cleanupEmptyData(data: AppData): { data: AppData; cleanedFolders: number; cleanedTags: number } {
  const usedFolderIds = new Set<string>();
  const usedTagIds = new Set<string>();

  data.notes.forEach((n) => {
    if (n.folderId) usedFolderIds.add(n.folderId);
    n.tagIds.forEach((tid) => usedTagIds.add(tid));
  });

  const prevFolderLen = data.folders.length;
  const prevTagLen = data.tags.length;

  const newFolders = data.folders.filter((f) => usedFolderIds.has(f.id));
  const newTags = data.tags.filter((t) => usedTagIds.has(t.id));

  const updated: AppData = {
    ...data,
    folders: newFolders.length > 0 ? newFolders : data.folders, // keep at least something
    tags: newTags.length > 0 ? newTags : data.tags,
  };

  saveStoredData(updated);
  return {
    data: updated,
    cleanedFolders: prevFolderLen - newFolders.length,
    cleanedTags: prevTagLen - newTags.length,
  };
}
