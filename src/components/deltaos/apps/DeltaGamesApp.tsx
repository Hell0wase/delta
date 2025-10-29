import { useState, useEffect, useRef } from 'react';
import { Play, Search, Maximize, ArrowLeft, Sparkles, Loader2, Pin, PinOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeltaGame, OSData } from '@/types/deltaos';
import { toast } from 'sonner';

type GameView = 'grid' | 'loader' | 'playing';

interface DeltaGamesAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
  initialGameId?: string;
  timestamp?: number;
}

export const DeltaGamesApp = ({ userData, onUpdateUserData, initialGameId, timestamp }: DeltaGamesAppProps) => {
  const [view, setView] = useState<GameView>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<DeltaGame | null>(null);
  const [allGames, setAllGames] = useState<DeltaGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<DeltaGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastProcessedTimestampRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await fetch('/games/game-info.json');
        const games: DeltaGame[] = await response.json();
        
        const gamesWithIds = games.map((game, index) => ({
          ...game,
          id: `game-${index}`,
        }));
        
        setAllGames(gamesWithIds);
        setFilteredGames(gamesWithIds);
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    const filtered = allGames.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGames(filtered);
  }, [searchQuery, allGames]);

  useEffect(() => {
    if (initialGameId && timestamp && timestamp !== lastProcessedTimestampRef.current && allGames.length > 0) {
      const gameToSelect = allGames.find(g => g.id === initialGameId);
      if (gameToSelect) {
        handleGameSelect(gameToSelect);
        lastProcessedTimestampRef.current = timestamp;
      }
    }
  }, [timestamp, initialGameId, allGames]);

  const handleGameSelect = (game: DeltaGame) => {
    setSelectedGame(game);
    setView('loader');
  };

  const handlePlayGame = () => {
    setView('playing');
  };

  const handleBackToGrid = () => {
    setView('grid');
    setSelectedGame(null);
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector('.game-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      }
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/200x150/3B82F6/FFFFFF?text=Game';
  };

  const isGamePinned = (gameId: string) => {
    return userData.pinnedItems?.some(item => item.type === 'deltaGame' && item.deltaGameId === gameId) || false;
  };

  const togglePinToDesktop = (gameId: string, gameTitle: string) => {
    const isPinned = isGamePinned(gameId);
    
    if (isPinned) {
      const updatedPinnedItems = userData.pinnedItems.filter(
        item => !(item.type === 'deltaGame' && item.deltaGameId === gameId)
      );
      onUpdateUserData({
        ...userData,
        pinnedItems: updatedPinnedItems,
      });
      toast.success(`${gameTitle} unpinned from desktop`);
    } else {
      const newPinnedItem = {
        id: `delta-game-${gameId}`,
        type: 'deltaGame' as const,
        name: gameTitle,
        icon: '🎮',
        deltaGameId: gameId,
      };
      onUpdateUserData({
        ...userData,
        pinnedItems: [...(userData.pinnedItems || []), newPinnedItem],
      });
      toast.success(`${gameTitle} pinned to desktop!`);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
          <p className="text-gray-300 font-medium">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    }} data-testid="app-delta-games">
      {view === 'grid' && (
        <>
          <div className="relative overflow-hidden border-b" style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl" style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Sparkles className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Games
                  </h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {filteredGames.length} {filteredGames.length === allGames.length ? 'games available' : `of ${allGames.length} games`}
                  </p>
                </div>
              </div>
              
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)'
                  }}
                  data-testid="input-search-games"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar games-scroll-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.03] animate-fade-in-up"
                  style={{ 
                    animationDelay: `${(index % 20) * 0.03}s`,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <button
                    onClick={() => handleGameSelect(game)}
                    className="w-full text-left relative"
                    data-testid={`button-game-${game.id}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-black/20 relative rounded-t-3xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                      <img
                        src={`/${game.thumbnail}`}
                        alt={game.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <div className="p-4 rounded-full transition-all duration-300 transform scale-75 group-hover:scale-100" style={{
                          background: 'rgba(59, 130, 246, 0.9)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)'
                        }}>
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 relative z-10">
                      <h3 className="font-semibold text-base text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {game.title}
                      </h3>
                    </div>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinToDesktop(game.id, game.title);
                    }}
                    className="absolute top-3 right-3 z-30 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    style={{
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                    data-testid={`button-pin-${game.id}`}
                  >
                    {isGamePinned(game.id) ? (
                      <PinOff className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Pin className="h-4 w-4 text-gray-300" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  backdropFilter: 'blur(20px)'
                }}>
                  <Search className="h-12 w-12 text-blue-400/50" />
                </div>
                <div className="font-bold text-2xl mb-2 text-white">No games found</div>
                <div className="text-sm text-gray-400">Try a different search term</div>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'loader' && selectedGame && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
          }} />
          
          <div className="relative max-w-xl w-full space-y-8 animate-fade-in-up">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <img
                src={`/${selectedGame.thumbnail}`}
                alt={selectedGame.title}
                onError={handleImageError}
                className="w-full aspect-video object-cover"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold text-white tracking-tight">
                {selectedGame.title}
              </h2>
              <p className="text-gray-400 text-lg">Ready to play?</p>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={handlePlayGame}
                size="lg"
                className="flex-1 h-16 text-lg gap-3 font-semibold rounded-2xl border-0 shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'
                }}
                data-testid="button-play-game"
              >
                <Play className="h-6 w-6 fill-white" />
                Play Now
              </Button>
              <Button
                onClick={handleBackToGrid}
                variant="outline"
                size="lg"
                className="h-16 px-8 gap-3 text-white border-0 rounded-2xl font-semibold hover:scale-[1.02] transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)'
                }}
                data-testid="button-back-to-grid"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {view === 'playing' && selectedGame && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-black">
            <iframe
              src={`/${selectedGame.file}`}
              className="game-iframe w-full h-full border-0"
              title={selectedGame.title}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-popups allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              data-testid="iframe-game"
            />
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t shadow-2xl" style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(40px)'
          }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <span className="text-sm font-medium text-gray-400">Now Playing</span>
              </div>
              <div className="h-5 w-px bg-gray-700" />
              <span className="text-sm font-bold text-white">{selectedGame.title}</span>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleFullscreen}
                variant="outline"
                size="sm"
                className="gap-2 border-0 text-white rounded-xl hover:scale-105 transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)'
                }}
                data-testid="button-fullscreen"
              >
                <Maximize className="h-4 w-4" />
                Fullscreen
              </Button>
              <Button
                onClick={handleBackToGrid}
                variant="outline"
                size="sm"
                className="gap-2 border-0 text-white rounded-xl hover:scale-105 transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)'
                }}
                data-testid="button-back-from-playing"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
