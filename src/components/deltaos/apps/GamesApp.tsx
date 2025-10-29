import { useState, useEffect, useRef } from 'react';
import { OSData, CustomGame } from '@/types/deltaos';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Maximize2, X, Gamepad2, Pin, PinOff } from 'lucide-react';

interface GamesAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
  initialGameId?: string;
  timestamp?: number;
}

export const GamesApp = ({ userData, onUpdateUserData, initialGameId, timestamp }: GamesAppProps) => {
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [selectedGame, setSelectedGame] = useState<CustomGame | null>(null);
  const [loadedGames, setLoadedGames] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [escapeHoldTime, setEscapeHoldTime] = useState(0);
  const escapeTimerRef = useRef<number | null>(null);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const lastProcessedTimestampRef = useRef<number | undefined>(undefined);

  const addGame = () => {
    if (!gameName || !gameCode) {
      toast.error('Please fill in all fields');
      return;
    }

    const newGame: CustomGame = {
      id: Date.now().toString(),
      name: gameName,
      htmlCode: gameCode,
      createdAt: new Date().toISOString(),
    };

    const updatedData = {
      ...userData,
      customGames: [...(userData.customGames || []), newGame],
    };

    onUpdateUserData(updatedData);
    toast.success('Game added successfully!');
    setGameName('');
    setGameCode('');
    setShowAddGame(false);
  };

  const deleteGame = (id: string) => {
    const updatedData = {
      ...userData,
      customGames: userData.customGames.filter(g => g.id !== id),
    };
    onUpdateUserData(updatedData);
    
    // Clean up state for deleted game
    setLoadedGames(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    if (selectedGame?.id === id) {
      setSelectedGame(null);
    }
    
    delete iframeRefs.current[id];
    toast.success('Game deleted');
  };

  const selectGame = (game: CustomGame) => {
    setSelectedGame(game);
    setLoadedGames(prev => new Set(prev).add(game.id));
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  useEffect(() => {
    if (initialGameId && timestamp && timestamp !== lastProcessedTimestampRef.current && userData.customGames) {
      const gameToSelect = userData.customGames.find(g => g.id === initialGameId);
      if (gameToSelect) {
        selectGame(gameToSelect);
        lastProcessedTimestampRef.current = timestamp;
      }
    }
  }, [timestamp, initialGameId]);

  const isGamePinned = (gameId: string) => {
    return userData.pinnedItems?.some(item => item.type === 'customGame' && item.customGameId === gameId) || false;
  };

  const togglePinToDesktop = (id: string) => {
    const game = userData.customGames.find(g => g.id === id);
    if (!game) return;
    
    const isPinned = isGamePinned(id);
    
    if (isPinned) {
      // Unpin
      const updatedPinnedItems = userData.pinnedItems.filter(
        item => !(item.type === 'customGame' && item.customGameId === id)
      );
      onUpdateUserData({
        ...userData,
        pinnedItems: updatedPinnedItems,
      });
      toast.success('Unpinned from desktop');
    } else {
      // Pin
      const newPinnedItem = {
        id: `custom-game-${id}`,
        type: 'customGame' as const,
        name: game.name,
        icon: '🎮',
        customGameId: id,
      };
      onUpdateUserData({
        ...userData,
        pinnedItems: [...(userData.pinnedItems || []), newPinnedItem],
      });
      toast.success('Pinned to desktop!');
    }
  };

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !escapeTimerRef.current) {
        escapeTimerRef.current = window.setInterval(() => {
          setEscapeHoldTime(prev => {
            const newTime = prev + 100;
            if (newTime >= 2000) {
              exitFullscreen();
              return 0;
            }
            return newTime;
          });
        }, 100);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escapeTimerRef.current) {
        window.clearInterval(escapeTimerRef.current);
        escapeTimerRef.current = null;
        setEscapeHoldTime(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (escapeTimerRef.current) {
        window.clearInterval(escapeTimerRef.current);
      }
    };
  }, [isFullscreen]);

  const enterFullscreen = () => {
    setIsFullscreen(true);
    if (selectedGame && iframeRefs.current[selectedGame.id]) {
      iframeRefs.current[selectedGame.id]?.requestFullscreen?.();
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    setEscapeHoldTime(0);
    if (escapeTimerRef.current) {
      window.clearInterval(escapeTimerRef.current);
      escapeTimerRef.current = null;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  if (showAddGame) {
    return (
      <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-indigo-500/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Add Custom App/Game</h2>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowAddGame(false)}
            className="rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all duration-200"
            data-testid="button-cancel-add-game"
          >
            Cancel
          </Button>
        </div>

        <div className="space-y-6 backdrop-blur-3xl rounded-3xl border p-8"
          style={{
            backgroundColor: 'rgba(30, 30, 50, 0.6)',
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <div className="space-y-3">
            <Label htmlFor="gameName" className="text-base font-semibold">App/Game Name</Label>
            <Input
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter name"
              className="h-12 rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl"
              data-testid="input-game-name"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="gameCode" className="text-base font-semibold">HTML Code</Label>
            <Textarea
              id="gameCode"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="h-80 font-mono text-sm rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl"
              data-testid="textarea-game-code"
            />
          </div>

          <Button 
            onClick={addGame} 
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-500/90 hover:via-purple-500/90 hover:to-violet-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-base font-semibold"
            data-testid="button-add-game"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add App/Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Game Player View - Hidden but mounted when not selected */}
      {userData.customGames?.map((game) => (
        loadedGames.has(game.id) && (
          <div
            key={game.id}
            className={`${selectedGame?.id === game.id ? 'flex' : 'hidden'} flex-col h-full relative bg-black`}
          >
            {selectedGame?.id === game.id && (
              <>
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="h-10 w-10 shadow-2xl rounded-2xl backdrop-blur-xl hover:scale-110 transition-all duration-200"
                    onClick={enterFullscreen}
                    title="Fullscreen"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="h-10 w-10 shadow-2xl rounded-2xl backdrop-blur-xl hover:scale-110 transition-all duration-200"
                    onClick={() => {
                      closeGame();
                      if (isFullscreen) exitFullscreen();
                    }}
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {isFullscreen && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] backdrop-blur-3xl px-8 py-4 rounded-2xl border shadow-2xl animate-fade-in"
                    style={{
                      backgroundColor: 'rgba(30, 30, 50, 0.95)',
                      borderColor: 'rgba(255,255,255,0.15)',
                    }}
                  >
                    <div className="text-sm font-semibold mb-2 text-center">Hold ESC to exit fullscreen</div>
                    <div className="w-56 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-100 rounded-full"
                        style={{ width: `${(escapeHoldTime / 2000) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <iframe
              ref={(el) => { iframeRefs.current[game.id] = el; }}
              srcDoc={game.htmlCode}
              className="flex-1 w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
              title={game.name}
              data-testid={`iframe-game-${game.id}`}
            />
          </div>
        )
      ))}

      {/* Games Library View */}
      <div className={`${selectedGame ? 'hidden' : 'block'} p-8 space-y-6 bg-gradient-to-br from-background via-background to-indigo-500/5 h-full overflow-auto`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center shadow-lg">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Custom Apps Library</h2>
              <p className="text-xs text-muted-foreground">Add and play custom HTML apps & games</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddGame(true)}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-500/90 hover:via-purple-500/90 hover:to-violet-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            data-testid="button-show-add-game"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add App
          </Button>
        </div>

        {(!userData.customGames || userData.customGames.length === 0) ? (
          <div className="text-center py-20 space-y-6 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-violet-500/30 blur-3xl" />
              <div className="relative bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-violet-500/20 backdrop-blur-3xl rounded-3xl p-12 border border-white/15 shadow-2xl">
                <Gamepad2 className="h-24 w-24 text-indigo-500" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">No Custom Apps Yet</h3>
              <p className="text-muted-foreground">Click "Add App" to add custom HTML apps or games!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userData.customGames.map((game, index) => (
              <div
                key={game.id}
                className="relative p-6 border rounded-3xl backdrop-blur-3xl hover:border-primary/50 cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden animate-fade-in-up"
                style={{
                  backgroundColor: 'rgba(30, 30, 50, 0.6)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-violet-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/5 group-hover:to-transparent transition-all duration-300 rounded-3xl" />
                <div onClick={() => selectGame(game)} className="relative z-10" data-testid={`button-select-game-${game.id}`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-center mb-1 group-hover:text-primary transition-colors">{game.name}</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 z-20 transition-all duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinToDesktop(game.id);
                    }}
                    data-testid={`button-pin-game-${game.id}`}
                    title={isGamePinned(game.id) ? "Unpin from desktop" : "Pin to desktop"}
                  >
                    {isGamePinned(game.id) ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGame(game.id);
                    }}
                    data-testid={`button-delete-game-${game.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
