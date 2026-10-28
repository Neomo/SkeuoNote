export type ViewMode = 'desk' | 'grid' | 'timeline' | 'random';

export type NoteColor =
  | 'yellow'
  | 'kraft'
  | 'green'
  | 'pink'
  | 'purple'
  | 'slate'
  | 'parchment'
  | 'blue'
  | 'dark';

export type NotePinStyle = 'pushpin' | 'tape' | 'clip';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export type TimeFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  items?: NoteItem[]; // For checklist / todo mode
  isChecklist?: boolean;
  colorTheme: NoteColor;
  textColor?: string;
  fontSize: FontSize;
  pinStyle: NotePinStyle;
  isPinned: boolean; // 置顶
  isStarred: boolean; // 星标
  folderId: string | null;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
  reminderAt?: number | null; // Memo reminder timestamp
  
  // Position on desktop (pixels or relative)
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number; // Slight tilt in degrees (-3 to +3)
  isArchivedInFolder: boolean; // In folder vs out on desktop
}

export interface Folder {
  id: string;
  name: string;
  color: string; // Hex or theme key
  createdAt: number;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // Hex color
}

export type DeskStyle = 'warm-oak' | 'dark-walnut' | 'leather-mat' | 'cork-board' | 'slate-stone';

export interface AppSettings {
  viewMode: ViewMode;
  enable3D: boolean;
  enableParallax: boolean;
  deskStyle: DeskStyle;
  deskBrightness: number; // 60 - 140
  enableFolderAnimations: boolean;
  soundEffects: boolean;
  autoArrangeOnMount: boolean;
}

export interface AppData {
  version: number;
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  settings: AppSettings;
  lastBackupAt?: number;
}
