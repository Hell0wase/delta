export interface User {
  name: string;
  password: string;
  timezone: string;
  theme: {
    primary: string;
    secondary: string;
  };
  settings: {
    fontSize: number;
    fontFamily: string;
    zoom: number;
    roundedCorners: boolean;
    backgroundImage?: string;
    backgroundColor: string;
    pinEnabled: boolean;
    pin?: string;
    pinLength: 4 | 6;
    themeMode: 'dark' | 'light';
    taskbarColor: string;
    soundEffectsEnabled: boolean;
  };
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  data?: any;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  component: string;
  isImage?: boolean;
}

export interface CustomGame {
  id: string;
  name: string;
  htmlCode: string;
  createdAt: string;
  pinnedToDesktop?: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}

export interface StoredFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  data: string;
  createdAt: string;
  folder: 'Pictures' | 'Documents' | 'Downloads';
}

export interface DeltaGame {
  id: string;
  title: string;
  thumbnail: string;
  file: string;
}

export interface PinnedItem {
  id: string;
  type: 'app' | 'customGame' | 'deltaGame';
  name: string;
  icon: string;
  isImage?: boolean;
  // For apps
  appId?: string;
  componentName?: string;
  // For custom games
  customGameId?: string;
  // For delta games
  deltaGameId?: string;
  deltaGameTitle?: string;
  deltaGameFile?: string;
}

export interface OSData {
  user: User;
  customGames: CustomGame[];
  chatHistory: ChatMessage[];
  files: StoredFile[];
  installedApps: string[];
  pinnedItems: PinnedItem[];
}
