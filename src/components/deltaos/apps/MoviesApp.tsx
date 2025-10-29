import { useState, useEffect, useRef } from 'react';
import { Film, Tv, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

type ContentType = 'movie' | 'tv' | 'anime';

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
}

export const MoviesApp = () => {
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [seasonEpisode, setSeasonEpisode] = useState('');
  const [playerUrl, setPlayerUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [message, setMessage] = useState('Search for a title, click a result, then Play');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const DEFAULT_QUERY = 'autoplay=true&poster=true&title=true&watchparty=false&chromecast=false&servericon=true&setting=true&pip=true&primarycolor=3B82F6&secondarycolor=2563EB&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setShowResults(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 260);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, contentType]);

  const handleSearch = async (query: string) => {
    if (!TMDB_API_KEY) {
      setMessage('TMDB API key not configured. Please set VITE_TMDB_API_KEY environment variable.');
      setResults([]);
      setShowResults(true);
      return;
    }

    if (contentType === 'anime') {
      setMessage('Anime search requires additional API configuration. Use Movie or Series tabs for now.');
      setResults([]);
      setShowResults(true);
      return;
    }

    const type = contentType === 'tv' ? 'tv' : 'movie';
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${encodeURIComponent(TMDB_API_KEY)}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (err) {
      console.error('TMDB search error:', err);
      setResults([]);
      setShowResults(true);
    }
  };

  const handleSelectResult = (result: TMDBResult) => {
    setSelectedId(String(result.id));
    const titleText = contentType === 'tv' ? (result.name || result.original_name || '') : (result.title || result.original_title || '');
    setSelectedTitle(titleText);
    setSearchQuery(`${titleText} — TMDB:${result.id}`);
    setShowResults(false);
  };

  const buildPlayerUrl = () => {
    if (!selectedId) return '';
    const base = 'https://player.vidplus.to/embed';
    
    if (contentType === 'movie') {
      return `${base}/movie/${encodeURIComponent(selectedId)}?${DEFAULT_QUERY}`;
    }
    
    if (contentType === 'tv') {
      const parts = seasonEpisode ? seasonEpisode.split('/').map(s => s.trim()) : [];
      const season = parts[0] || '1';
      const episode = parts[1] || '1';
      return `${base}/tv/${encodeURIComponent(selectedId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}?${DEFAULT_QUERY}`;
    }
    
    const ep = seasonEpisode || '1';
    return `${base}/anime/${encodeURIComponent(selectedId)}/${encodeURIComponent(ep)}?dub=false&${DEFAULT_QUERY}`;
  };

  const handlePlay = () => {
    if (!selectedId) {
      setMessage('Select a search result first, then click Play');
      setShowPlayer(false);
      setShowFallback(false);
      return;
    }

    if (contentType === 'anime') {
      setMessage('Anime playback is not yet supported. Use Movie or Series tabs.');
      setShowPlayer(false);
      setShowFallback(false);
      return;
    }

    const url = buildPlayerUrl();
    if (!url) {
      setMessage('Unable to build player URL');
      setShowPlayer(false);
      setShowFallback(false);
      return;
    }
    
    setPlayerUrl(url);
    setShowPlayer(true);
    setShowFallback(false);
    setMessage('');
  };

  const handleOpenInNewTab = () => {
    if (playerUrl) {
      window.open(playerUrl, '_blank', 'noopener');
    }
  };

  const getPosterUrl = (path?: string) => {
    return path ? `https://image.tmdb.org/t/p/w154${path}` : '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleSelectResult(results[0]);
      } else {
        handlePlay();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background" data-testid="app-movies">
      <div className="flex flex-col gap-4 p-4 border-b bg-muted/30">
        <Tabs value={contentType} onValueChange={(v) => {
          setContentType(v as ContentType);
          setSearchQuery('');
          setSelectedId('');
          setSelectedTitle('');
          setSeasonEpisode('');
          setShowResults(false);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movie" className="flex items-center gap-2" data-testid="tab-movie">
              <Film className="h-4 w-4" />
              Movie
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2" data-testid="tab-tv">
              <Tv className="h-4 w-4" />
              Series
            </TabsTrigger>
            <TabsTrigger value="anime" className="flex items-center gap-2" data-testid="tab-anime">
              <Sparkles className="h-4 w-4" />
              Anime
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="flex-1 relative" ref={searchWrapRef}>
            <Label htmlFor="movie-search" className="text-sm mb-1.5 block">Search title</Label>
            <Input
              id="movie-search"
              type="search"
              placeholder={`Type ${contentType} name, e.g. Superman`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
              data-testid="input-search"
            />
            
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-10 custom-scrollbar" data-testid="results-list">
                {results.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No results</div>
                ) : (
                  results.map((result) => {
                    const titleText = contentType === 'tv' ? (result.name || result.original_name || '') : (result.title || result.original_title || '');
                    const dateText = contentType === 'tv' ? (result.first_air_date || '') : (result.release_date || '');
                    const posterSrc = getPosterUrl(result.poster_path);
                    
                    return (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => handleSelectResult(result)}
                        data-testid={`result-${result.id}`}
                      >
                        <img
                          src={posterSrc || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="66"><rect width="100%" height="100%" fill="%23333"/><text x="50%" y="50%" font-size="10" fill="%23fff" text-anchor="middle" dominant-baseline="middle">?</text></svg>'}
                          alt=""
                          className="w-11 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="66"><rect width="100%" height="100%" fill="%23333"/><text x="50%" y="50%" font-size="10" fill="%23fff" text-anchor="middle" dominant-baseline="middle">?</text></svg>';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{titleText}</div>
                          <div className="text-xs text-muted-foreground">
                            {dateText} • {Math.round(result.popularity || 0)} popularity
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {(contentType === 'tv' || contentType === 'anime') && (
            <div className="w-32">
              <Label htmlFor="season-ep" className="text-sm mb-1.5 block">
                {contentType === 'tv' ? 'Season/Ep' : 'Episode'}
              </Label>
              <Input
                id="season-ep"
                type="text"
                placeholder={contentType === 'tv' ? 'e.g. 1/1' : 'e.g. 1'}
                value={seasonEpisode}
                onChange={(e) => setSeasonEpisode(e.target.value)}
                data-testid="input-season-episode"
              />
            </div>
          )}

          <div className="flex items-end">
            <Button onClick={handlePlay} className="gap-2" data-testid="button-play">
              <Play className="h-4 w-4" />
              Play
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-card flex items-center justify-center">
        {message && !showPlayer && (
          <div className="text-center text-muted-foreground p-8" data-testid="text-message">
            {message}
          </div>
        )}

        {showPlayer && (
          <iframe
            src={playerUrl}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            title="VidPlus player"
            className="w-full h-full border-0"
            onError={() => setShowFallback(true)}
            data-testid="iframe-player"
          />
        )}

        {showFallback && (
          <div className="flex flex-col items-center justify-center gap-4 p-8" data-testid="fallback-message">
            <div className="text-muted-foreground text-center">
              Player could not load in iframe. Open in a new tab to view or check embedding restrictions.
            </div>
            <Button onClick={handleOpenInNewTab} data-testid="button-open-new-tab">
              Open player in new tab
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
