import { AppDefinition, OSData } from '@/types/deltaos';
import { playClickSound, playHoverSound } from '@/utils/sounds';
import { Search, Power, Sparkles, Pin, PinOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

const allApps: AppDefinition[] = [
  { id: 'deltagames', name: 'Delta Games', icon: '🎮', component: 'deltagames' },
  { id: 'ai', name: 'AI Assistant', icon: '🤖', component: 'ai' },
  { id: 'settings', name: 'Settings', icon: '⚙️', component: 'settings' },
  { id: 'calculator', name: 'Calculator', icon: '🔢', component: 'calculator' },
  { id: 'camera', name: 'Camera', icon: '📷', component: 'camera' },
  { id: 'weather', name: 'Weather', icon: '🌤️', component: 'weather' },
  { id: 'calendar', name: 'Calendar', icon: '📅', component: 'calendar' },
  { id: 'store', name: 'Delta Store', icon: '📦', component: 'store' },
  { id: 'browser', name: 'Browser', icon: '🌐', component: 'browser' },
  { id: 'games', name: 'Add Apps', icon: '➕', component: 'games' },
  { id: 'movies', name: 'Movies', icon: '🎬', component: 'movies' },
  { id: 'files', name: 'File Explorer', icon: '📁', component: 'files' },
  { id: 'chat', name: 'Personal Notes', icon: '💬', component: 'chat' },
  { id: 'snippet', name: 'Snippet', icon: '✂️', component: 'snippet' },
  { id: 'notes', name: 'Notes', icon: '📝', component: 'notes' },
  { id: 'music', name: 'Music Player', icon: '🎵', component: 'music' },
  { id: 'paint', name: 'Paint', icon: '🎨', component: 'paint' },
  { id: 'clock', name: 'Clock', icon: '⏰', component: 'clock' },
  { id: 'tasks', name: 'Tasks', icon: '✅', component: 'tasks' },
  { id: 'email', name: 'Email', icon: '📧', component: 'email' },
  { id: 'terminal', name: 'Terminal', icon: '💻', component: 'terminal' },
  { id: 'code', name: 'Code Editor', icon: '⌨️', component: 'code' },
  { id: 'photos', name: 'Photos', icon: '🖼️', component: 'photos' },
  { id: 'systemmonitor', name: 'System Monitor', icon: '📊', component: 'systemmonitor' },
  { id: 'maps', name: 'Maps', icon: '🗺️', component: 'maps' },
];

interface StartMenuProps {
  onOpenApp: (id: string, name: string, icon: string, component: string) => void;
  onClose: () => void;
  onLogout: () => void;
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

export const StartMenu = ({ onOpenApp, onClose, onLogout, userData, onUpdateUserData }: StartMenuProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const installedApps = useMemo(() => {
    const installed = userData.installedApps || ['settings', 'calculator', 'camera', 'weather', 'calendar', 'store'];
    // Filter out 'games' (Add Apps) as it will be shown separately at the bottom
    return allApps.filter(app => installed.includes(app.id) && app.id !== 'games');
  }, [userData.installedApps]);

  // Get the Add Apps app for the bottom section
  const addAppsApp = useMemo(() => allApps.find(app => app.id === 'games'), []);

  const togglePin = useCallback((appId: string, isPinned: boolean) => {
    playClickSound();
    
    // Prevent unpinning of essential apps
    const protectedApps = ['store', 'deltagames', 'settings'];
    if (isPinned && protectedApps.includes(appId)) {
      toast.error('This app cannot be unpinned');
      return;
    }
    
    const currentApps = userData.installedApps || ['settings', 'calculator', 'camera', 'weather', 'calendar', 'store'];
    
    let updatedApps: string[];
    if (isPinned) {
      updatedApps = currentApps.filter(id => id !== appId);
      toast.success('App unpinned!');
    } else {
      updatedApps = [...currentApps, appId];
      toast.success('App pinned!');
    }

    onUpdateUserData({
      ...userData,
      installedApps: updatedApps,
    });
  }, [userData, onUpdateUserData]);

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return { apps: installedApps, games: [] };
    }

    const query = searchQuery.toLowerCase();
    const filteredApps = installedApps.filter(app =>
      app.name.toLowerCase().includes(query)
    );

    const filteredGames = (userData.customGames || []).map(game => ({
      id: `game-${game.id}`,
      name: game.name,
      icon: '🎮',
      component: 'games',
      gameId: game.id
    })).filter(game =>
      game.name.toLowerCase().includes(query)
    );

    return { apps: filteredApps, games: filteredGames };
  }, [searchQuery, userData.customGames, installedApps]);

  const AppCard = ({ app, isPinned, hidePinButton = false }: { app: AppDefinition; isPinned: boolean; hidePinButton?: boolean }) => {
    // Protected apps that cannot be unpinned
    const protectedApps = ['store', 'deltagames', 'settings'];
    const isProtected = protectedApps.includes(app.id);
    
    return (
      <div
        className="relative flex flex-col items-center justify-center p-2 sm:p-3 aspect-square rounded-2xl bg-gradient-to-br from-white/15 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/30 hover:border-primary/50 transition-all duration-150 hover:scale-105 group overflow-hidden"
        data-testid={`button-app-${app.id}`}
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          willChange: 'transform',
        }}
      >
        <button
          onClick={() => {
            playClickSound();
            onOpenApp(app.id, app.name, app.icon, app.component);
            onClose();
          }}
          className="flex flex-col items-center justify-center w-full relative z-10"
        >
          {app.isImage ? (
            <div className="relative mb-1 sm:mb-2">
              <img 
                src={app.icon} 
                alt={app.name}
                className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform duration-150 relative z-10 rounded-xl object-cover shadow-lg"
              />
            </div>
          ) : (
            <div className="relative mb-1 sm:mb-2">
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-150 relative z-10 drop-shadow-lg">{app.icon}</span>
            </div>
          )}
          <span className="text-[0.7rem] leading-tight text-center font-medium text-white/90 group-hover:text-white transition-colors duration-150 relative z-10 tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{app.name}</span>
        </button>

        {!hidePinButton && !isProtected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(app.id, isPinned);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-primary/40 z-20 shadow-lg"
            title={isPinned ? 'Unpin from Start' : 'Pin to Start'}
            data-testid={`button-pin-${app.id}`}
          >
            {isPinned ? (
              <PinOff className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Pin className="h-3.5 w-3.5 text-primary" />
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[95vw] sm:w-[85vw] lg:w-[540px] max-w-[540px] h-[75vh] sm:h-[70vh] lg:h-[580px] max-h-[580px] backdrop-blur-[40px] rounded-2xl border shadow-2xl overflow-hidden animate-scale-in z-[9999]"
      style={{
        backgroundColor: 'rgba(20, 20, 35, 0.55)',
        borderColor: 'rgba(255,255,255,0.15)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent" />
        <div className="relative p-4 border-b border-white/10 backdrop-blur-md">
          <div className="relative group" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-primary transition-colors duration-200" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for apps, settings, and more..."
              className="pl-10 pr-4 bg-white/10 border-white/20 h-11 rounded-xl focus-visible:ring-primary focus-visible:ring-1 transition-all duration-200 text-white placeholder:text-white/40 text-sm backdrop-blur-sm"
              autoFocus
              data-testid="input-search-apps"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[calc(100%-160px)] custom-scrollbar">
        {/* Search Results Section - Only shown when searching */}
        {searchQuery && (
          <>
            {searchResults.apps.length > 0 && (
              <div className="mb-6 animate-fade-in">
                <h3 className="text-xs font-semibold text-white/50 mb-3 flex items-center gap-2">
                  Search Results
                  <span className="text-xs font-medium ml-1 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{searchResults.apps.length}</span>
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {searchResults.apps.map((app) => {
                    const isPinned = userData.installedApps?.includes(app.id) || false;
                    return <AppCard key={app.id} app={app} isPinned={isPinned} />;
                  })}
                </div>
              </div>
            )}

            {searchResults.games.length > 0 && (
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-xs font-semibold text-white/50 mb-3 flex items-center gap-2">
                  Custom Games
                  <span className="text-xs font-medium ml-1 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{searchResults.games.length}</span>
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {searchResults.games.map((game, index) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        playClickSound();
                        onOpenApp(game.id, game.name, game.icon, game.component);
                        onClose();
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-primary/40 transition-all duration-200 hover:scale-105 backdrop-blur-xl group animate-fade-in-up shadow-lg"
                      style={{ 
                        animationDelay: `${index * 0.04}s`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05) inset',
                      }}
                      data-testid={`button-game-${game.id}`}
                    >
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200 relative z-10">{game.icon}</span>
                      <span className="text-xs text-center font-medium text-white/70 group-hover:text-white transition-colors relative z-10">{game.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.apps.length === 0 && searchResults.games.length === 0 && (
              <div className="text-center py-16 text-white/60 animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>🔍</div>
                <div className="font-semibold text-lg mb-2">No results found in your installed apps</div>
                <div className="text-sm text-white/40">Install more apps from the Delta Store</div>
              </div>
            )}
          </>
        )}
        
        {/* Pinned Apps Section - Always visible */}
        {installedApps.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-white/70 mb-4 flex items-center gap-2 tracking-wide">
              <div className="w-1 h-4 bg-gradient-to-b from-primary via-purple-500 to-pink-500 rounded-full shadow-lg shadow-primary/50" />
              Pinned
              <span className="text-xs font-semibold ml-auto bg-gradient-to-r from-primary/30 to-purple-500/30 text-primary px-2.5 py-1 rounded-lg backdrop-blur-sm border border-primary/30 shadow-lg">{installedApps.length}</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {installedApps.map((app) => (
                <AppCard key={app.id} app={app} isPinned={true} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-white/60">
            <div className="text-6xl mb-4">📦</div>
            <div className="font-semibold text-lg mb-2">No apps installed</div>
            <div className="text-sm text-white/40">Visit Delta Store to install apps</div>
          </div>
        )}

        {/* Add Apps - Always at bottom */}
        {addAppsApp && !searchQuery && (
          <div className="mt-auto pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold text-white/70 mb-3 flex items-center gap-2 tracking-wide">
              <div className="w-1 h-4 bg-gradient-to-b from-green-500 via-emerald-500 to-teal-500 rounded-full shadow-lg shadow-green-500/50" />
              Get More Apps
            </h3>
            <div className="w-full max-w-[120px] mx-auto">
              <AppCard app={addAppsApp} isPinned={false} hidePinButton={true} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              <span>{userData.user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{userData.user.name}</div>
              <div className="text-xs text-white/50">Delta OS</div>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onLogout();
            }}
            className="p-2 rounded-xl hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 transition-all duration-200 backdrop-blur-sm"
            onMouseEnter={() => playHoverSound()}
            data-testid="button-logout"
          >
            <Power className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
