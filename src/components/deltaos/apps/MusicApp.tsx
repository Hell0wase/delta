import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, SkipBack, SkipForward, Upload, Trash2, Music2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  name: string;
  url: string;
}

export const MusicApp = () => {
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('deltaos-music-tracks');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('deltaos-music-tracks', JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newTrack: Track = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            url: event.target?.result as string,
          };
          setTracks((prev) => [...prev, newTrack]);
          toast.success(`Added ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const seek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const deleteTrack = (id: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    toast.success('Track removed');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-purple-500/5">
      <audio ref={audioRef} src={currentTrack?.url} />
      
      {/* Playlist */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">My Playlist</h2>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
            data-testid="button-upload-music"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Music
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-upload-music"
          />
        </div>

        <ScrollArea className="h-[calc(100%-200px)]">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Music2 className="h-24 w-24 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No music yet. Upload some tracks!</p>
            </div>
          ) : (
            tracks.map((track) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                  currentTrack?.id === track.id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-muted/40 hover:bg-muted/60'
                }`}
                onClick={() => playTrack(track)}
                data-testid={`track-item-${track.id}`}
              >
                <div className="flex items-center gap-3">
                  <Music2 className="h-5 w-5" />
                  <span className="truncate">{track.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTrack(track.id);
                  }}
                  data-testid={`button-delete-track-${track.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Player Controls */}
      <div className="border-t border-border/50 p-6 bg-muted/20">
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2 truncate">
            {currentTrack?.name || 'No track playing'}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-12">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={seek}
              className="flex-1"
              data-testid="slider-seek"
            />
            <span className="text-xs text-muted-foreground w-12">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            disabled={!currentTrack}
            data-testid="button-previous"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlayPause}
            disabled={!currentTrack}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            disabled={!currentTrack}
            data-testid="button-next"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Volume2 className="h-4 w-4" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0])}
            className="w-32"
            data-testid="slider-volume"
          />
        </div>
      </div>
    </div>
  );
};
