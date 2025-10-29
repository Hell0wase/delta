import { useState, useRef, useEffect } from 'react';
import { WindowState, OSData } from '@/types/deltaos';
import { X, Minus, Maximize2, Pin, PinOff } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsApp } from './apps/SettingsApp';
import { CalculatorApp } from './apps/CalculatorApp';
import { AIApp } from './apps/AIApp';
import { BrowserApp } from './apps/BrowserApp';
import { GamesApp } from './apps/GamesApp';
import { MoviesApp } from './apps/MoviesApp';
import { DeltaGamesApp } from './apps/DeltaGamesApp';
import { DeltaStoreApp } from './apps/DeltaStoreApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { ChatApp } from './apps/ChatApp';
import { CameraApp } from './apps/CameraApp';
import { SnippetApp } from './apps/SnippetApp';
import { NotesApp } from './apps/NotesApp';
import { MusicApp } from './apps/MusicApp';
import { PaintApp } from './apps/PaintApp';
import { ClockApp } from './apps/ClockApp';
import { WeatherApp } from './apps/WeatherApp';
import { CalendarApp } from './apps/CalendarApp';
import { TasksApp } from './apps/TasksApp';
import { EmailApp } from './apps/EmailApp';
import { TerminalApp } from './apps/TerminalApp';
import { CodeEditorApp } from './apps/CodeEditorApp';
import { PhotosApp } from './apps/PhotosApp';
import { SystemMonitorApp } from './apps/SystemMonitorApp';
import { MapsApp } from './apps/MapsApp';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateSize: (id: string, size: { width: number; height: number }) => void;
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
  roundedCorners: boolean;
  themeMode: 'dark' | 'light';
}

export const Window = ({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  userData,
  onUpdateUserData,
  roundedCorners,
  themeMode,
}: WindowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);

  const isAppPinned = () => {
    return userData.pinnedItems?.some(item => item.type === 'app' && item.appId === win.id) || false;
  };

  const togglePinApp = () => {
    const isPinned = isAppPinned();

    if (isPinned) {
      // Unpin
      const updatedPinnedItems = userData.pinnedItems.filter(
        item => !(item.type === 'app' && item.appId === win.id)
      );
      onUpdateUserData({
        ...userData,
        pinnedItems: updatedPinnedItems,
      });
      toast.success(`${win.title} unpinned from desktop`);
    } else {
      // Pin
      const newPinnedItem = {
        id: `app-${win.id}`,
        type: 'app' as const,
        name: win.title,
        icon: win.icon,
        isImage: win.icon.startsWith('/') || win.icon.includes('://') || win.icon.startsWith('data:'),
        appId: win.id,
        componentName: win.component,
      };
      onUpdateUserData({
        ...userData,
        pinnedItems: [...(userData.pinnedItems || []), newPinnedItem],
      });
      toast.success(`${win.title} pinned to desktop!`);
    }
  };

  useEffect(() => {
    const updatePosition = () => {
      if (pendingPositionRef.current) {
        onUpdatePosition(win.id, pendingPositionRef.current);
        pendingPositionRef.current = null;
      }
      rafRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !win.isMaximized) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };

        pendingPositionRef.current = newPosition;

        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(updatePosition);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (pendingPositionRef.current) {
        onUpdatePosition(win.id, pendingPositionRef.current);
        pendingPositionRef.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, dragOffset, win.id, win.isMaximized, onUpdatePosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      onFocus(win.id);
    }
  };

  const renderApp = () => {
    switch (win.component) {
      case 'settings':
        return <SettingsApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'calculator':
        return <CalculatorApp themeMode={themeMode} />;
      case 'ai':
        return <AIApp />;
      case 'browser':
        return <BrowserApp />;
      case 'games':
        return <GamesApp userData={userData} onUpdateUserData={onUpdateUserData} initialGameId={win.data?.selectedGameId} timestamp={win.data?.timestamp} />;
      case 'movies':
        return <MoviesApp />;
      case 'deltagames':
        return <DeltaGamesApp userData={userData} onUpdateUserData={onUpdateUserData} initialGameId={win.data?.selectedGameId} timestamp={win.data?.timestamp} />;
      case 'store':
        return <DeltaStoreApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'files':
        return <FileExplorerApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'chat':
        return <ChatApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'camera':
        return <CameraApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'snippet':
        return <SnippetApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'notes':
        return <NotesApp userData={userData} onUpdateUserData={onUpdateUserData} />;
      case 'music':
        return <MusicApp />;
      case 'paint':
        return <PaintApp />;
      case 'clock':
        return <ClockApp />;
      case 'weather':
        return <WeatherApp />;
      case 'calendar':
        return <CalendarApp />;
      case 'tasks':
        return <TasksApp />;
      case 'email':
        return <EmailApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'code':
        return <CodeEditorApp />;
      case 'photos':
        return <PhotosApp />;
      case 'systemmonitor':
        return <SystemMonitorApp />;
      case 'maps':
        return <MapsApp />;
      default:
        return <div className="p-4">App not found</div>;
    }
  };

  if (win.isMinimized) return null;

  const style = win.isMaximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', borderRadius: 0 }
    : {
        top: win.position.y,
        left: win.position.x,
        width: win.size.width,
        height: win.size.height,
        borderRadius: roundedCorners ? '20px' : '0px',
      };

  const windowBg = themeMode === 'dark' 
    ? 'rgba(32, 32, 38, 0.85)' 
    : 'rgba(252, 252, 253, 0.95)';
  const windowText = themeMode === 'dark' ? '#ffffff' : '#1a1a1a';
  const borderColor = themeMode === 'dark' 
    ? 'rgba(255,255,255,0.08)' 
    : 'rgba(0,0,0,0.06)';
  const titleBarBg = themeMode === 'dark' 
    ? 'transparent' 
    : 'transparent';

  return (
    <div
      ref={windowRef}
      className="absolute backdrop-blur-[64px] overflow-hidden animate-scale-in transition-all duration-200"
      style={{
        ...style,
        zIndex: win.zIndex,
        backgroundColor: windowBg,
        color: windowText,
        border: `1px solid ${borderColor}`,
        boxShadow: themeMode === 'dark'
          ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)',
        willChange: 'transform, opacity',
      }}
      onMouseDown={() => onFocus(win.id)}
    >
      {/* Title Bar */}
      <div
        className="h-14 flex items-center justify-between px-6 cursor-move group"
        style={{
          backgroundColor: titleBarBg,
          borderBottom: 'none',
          color: windowText,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          {win.icon.startsWith('/') || win.icon.includes('://') || win.icon.startsWith('data:') ? (
            <img 
              src={win.icon} 
              alt={win.title}
              className="w-5 h-5 rounded object-cover"
            />
          ) : (
            <span className="text-lg drop-shadow-sm">{win.icon}</span>
          )}
          <span className="text-sm font-medium tracking-tight opacity-90">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinApp();
            }}
            className="w-10 h-8 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeMode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={isAppPinned() ? "Unpin from desktop" : "Pin to desktop"}
            data-testid={`button-pin-window-${win.id}`}
          >
            {isAppPinned() ? (
              <PinOff className="h-4 w-4 transition-all duration-200" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6', opacity: 0.9 }} />
            ) : (
              <Pin className="h-4 w-4 transition-all duration-200" style={{ color: windowText, opacity: 0.6 }} />
            )}
          </button>
          <button
            onClick={() => onMinimize(win.id)}
            className="w-10 h-8 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeMode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Minimize"
            data-testid={`button-minimize-window-${win.id}`}
          >
            <Minus className="h-4 w-4" style={{ color: windowText, opacity: 0.7 }} />
          </button>
          <button
            onClick={() => onMaximize(win.id)}
            className="w-10 h-8 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeMode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Maximize"
            data-testid={`button-maximize-window-${win.id}`}
          >
            <Maximize2 className="h-4 w-4" style={{ color: windowText, opacity: 0.7 }} />
          </button>
          <button
            onClick={() => onClose(win.id)}
            className="w-10 h-8 flex items-center justify-center rounded-md transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Close"
            data-testid={`button-close-window-${win.id}`}
          >
            <X className="h-4 w-4" style={{ color: themeMode === 'dark' ? '#ef4444' : '#dc2626', opacity: 0.8 }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="h-[calc(100%-3.5rem)] overflow-auto custom-scrollbar"
        style={{ 
          backgroundColor: windowBg, 
          color: windowText,
        }}
      >
        {renderApp()}
      </div>
    </div>
  );
};
