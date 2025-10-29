import { OSData, User } from '@/types/deltaos';

const STORAGE_KEY = 'deltaos_data';

export const saveUserData = (data: OSData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const loadUserData = (): OSData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsedData: OSData = JSON.parse(data);
    
    // Ensure essential apps are always installed
    const essentialApps = ['settings', 'store', 'deltagames'];
    const currentApps = parsedData.installedApps || [];
    const missingApps = essentialApps.filter(app => !currentApps.includes(app));
    
    if (missingApps.length > 0) {
      parsedData.installedApps = [...currentApps, ...missingApps];
      // Save the updated data back to localStorage
      saveUserData(parsedData);
    }
    
    return parsedData;
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
};

export const exportData = (): void => {
  const data = loadUserData();
  if (!data) return;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deltaos-backup-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<OSData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        saveUserData(data);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const clearUserData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getDefaultUser = (): User => ({
  name: '',
  password: '',
  timezone: 'UTC',
  theme: {
    primary: '#FF6B35',
    secondary: '#004E89',
  },
  settings: {
    fontSize: 14,
    fontFamily: 'Inter',
    zoom: 100,
    roundedCorners: true,
    backgroundColor: '#1a1a2e',
    pinEnabled: false,
    pinLength: 4,
    themeMode: 'dark',
    taskbarColor: '#0a0a0f',
    soundEffectsEnabled: true,
  },
});

export const getDefaultInstalledApps = (): string[] => [
  'deltagames',
  'ai',
  'settings',
  'calculator',
  'camera',
  'weather',
  'calendar',
  'store',
];

export const getDefaultPinnedItems = () => [];
