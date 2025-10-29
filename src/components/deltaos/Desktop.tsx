import { useState, useEffect, useCallback } from 'react';
import { Taskbar } from './Taskbar';
import { Window } from './Window';
import { StartMenu } from './StartMenu';
import { AnimatedBackground } from './AnimatedBackground';
import { DesktopIcons } from './DesktopIcons';
import { WindowState, OSData, CustomGame, PinnedItem } from '@/types/deltaos';
import { saveUserData, loadUserData, getDefaultInstalledApps, getDefaultPinnedItems } from '@/utils/storage';
import { toast } from 'sonner';

interface DesktopProps {
  userData: OSData;
  onLogout: () => void;
}

export const Desktop = ({ userData: initialUserData, onLogout }: DesktopProps) => {
  // Migrate existing users who don't have installedApps or pinnedItems
  const migrateCustomGamesToPinnedItems = () => {
    if (initialUserData.pinnedItems && initialUserData.pinnedItems.length > 0) {
      return initialUserData.pinnedItems;
    }
    
    // Migrate pinned custom games to the new pinnedItems system
    const pinnedGames = (initialUserData.customGames || []).filter(g => g.pinnedToDesktop);
    return pinnedGames.map(game => ({
      id: `custom-game-${game.id}`,
      type: 'customGame' as const,
      name: game.name,
      icon: '🎮',
      customGameId: game.id,
    }));
  };

  const migratedUserData = {
    ...initialUserData,
    installedApps: initialUserData.installedApps || getDefaultInstalledApps(),
    pinnedItems: migrateCustomGamesToPinnedItems(),
  };

  const [userData, setUserData] = useState(migratedUserData);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [taskbarPosition, setTaskbarPosition] = useState<'bottom' | 'left' | 'right'>('bottom');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStartMenu, setShowStartMenu] = useState(false);

  // Save migrated data
  useEffect(() => {
    if (!initialUserData.installedApps || !initialUserData.pinnedItems) {
      saveUserData(migratedUserData);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyK') {
        e.preventDefault();
        setShowStartMenu(prev => !prev);
      }
      if (e.key === 'Escape' && showStartMenu) {
        setShowStartMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStartMenu]);

  useEffect(() => {
    if (userData.user.settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userData.user.settings.themeMode]);

  const updateUserData = useCallback((newData: OSData) => {
    setUserData(newData);
    saveUserData(newData);
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => {
      const newZIndex = prev + 1;
      setWindows(windows => windows.map(w =>
        w.id === id ? { ...w, zIndex: newZIndex } : w
      ));
      return newZIndex;
    });
  }, []);

  const openWindow = useCallback((appId: string, appName: string, appIcon: string, component: string, data?: any) => {
    setWindows(prev => {
      const existingWindow = prev.find(w => w.id === appId);
      if (existingWindow) {
        bringToFront(appId);
        if (existingWindow.isMinimized) {
          toggleMinimize(appId);
        }
        return prev.map(w => w.id === appId ? { ...w, data: data || undefined } : w);
      }

      // Calculate responsive window size based on viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Reserve space for taskbar (~80px) + safe padding
      const taskbarHeight = 80;
      const verticalPadding = 60;
      const horizontalPadding = 40;
      
      // Calculate max available space that ensures window fits within viewport
      const maxAvailableWidth = viewportWidth - horizontalPadding;
      const maxAvailableHeight = viewportHeight - taskbarHeight - verticalPadding;
      
      // Adaptive sizing based on screen size - reduced for smaller windows
      // Very small screens (< 768px): 65%
      // Small screens (< 1024px): 55% 
      // Medium/Large screens: 50%
      let sizePercentage = 0.5;
      if (viewportWidth < 768) {
        sizePercentage = 0.65;
      } else if (viewportWidth < 1024) {
        sizePercentage = 0.55;
      }
      
      const preferredWidth = viewportWidth * sizePercentage;
      const preferredHeight = viewportHeight * sizePercentage;
      
      // Use preferred size, but never exceed available space or absolute maximums (reduced)
      const defaultWidth = Math.min(preferredWidth, maxAvailableWidth, 800);
      const defaultHeight = Math.min(preferredHeight, maxAvailableHeight, 600);

      const newWindow: WindowState = {
        id: appId,
        title: appName,
        icon: appIcon,
        component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + prev.length * 30, y: 100 + prev.length * 30 },
        size: { width: defaultWidth, height: defaultHeight },
        zIndex: maxZIndex + 1,
        data,
      };

      setMaxZIndex(maxZIndex + 1);
      return [...prev, newWindow];
    });
  }, [maxZIndex, bringToFront, toggleMinimize]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const updatePosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  const updateSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size } : w
    ));
  }, []);

  const openPinnedItem = useCallback((item: PinnedItem) => {
    if (item.type === 'app') {
      // Open regular app
      openWindow(item.appId!, item.name, item.icon, item.componentName);
    } else if (item.type === 'customGame') {
      // Open custom game from GamesApp
      openWindow('games', 'Games', 'Gamepad2', 'GamesApp', { selectedGameId: item.customGameId, timestamp: Date.now() });
    } else if (item.type === 'deltaGame') {
      // Open Delta Games app with the selected game
      openWindow('deltagames', 'Delta Games', '🎮', 'deltagames', { selectedGameId: item.deltaGameId, timestamp: Date.now() });
    }
  }, [openWindow]);

  return (
    <div 
      className="h-screen w-screen overflow-hidden relative"
      onClick={() => showStartMenu && setShowStartMenu(false)}
    >
      <AnimatedBackground 
        themeMode={userData.user.settings.themeMode}
        customBackgroundImage={userData.user.settings.backgroundImage}
        customBackgroundColor={userData.user.settings.backgroundColor}
      />
      
      <DesktopIcons 
        pinnedItems={userData.pinnedItems || []}
        onOpenItem={openPinnedItem}
      />
      
      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={closeWindow}
          onMinimize={toggleMinimize}
          onMaximize={toggleMaximize}
          onFocus={bringToFront}
          onUpdatePosition={updatePosition}
          onUpdateSize={updateSize}
          userData={userData}
          onUpdateUserData={updateUserData}
          roundedCorners={userData.user.settings.roundedCorners}
          themeMode={userData.user.settings.themeMode}
        />
      ))}

      {showStartMenu && (
        <StartMenu
          onOpenApp={openWindow}
          onClose={() => setShowStartMenu(false)}
          onLogout={onLogout}
          userData={userData}
          onUpdateUserData={updateUserData}
        />
      )}

      <Taskbar
        windows={windows}
        position={taskbarPosition}
        onWindowClick={(id) => {
          const window = windows.find(w => w.id === id);
          if (!window) return;

          const isTopWindow = window.zIndex === maxZIndex;
          
          if (window.isMinimized) {
            toggleMinimize(id);
            bringToFront(id);
          } else if (isTopWindow) {
            toggleMinimize(id);
          } else {
            bringToFront(id);
          }
        }}
        onPositionChange={setTaskbarPosition}
        currentTime={currentTime}
        timezone={userData.user.timezone}
        onStartClick={() => setShowStartMenu(!showStartMenu)}
        taskbarColor={userData.user.settings.taskbarColor}
        themeMode={userData.user.settings.themeMode}
      />
    </div>
  );
};
