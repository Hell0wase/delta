import { useState, useEffect } from 'react';
import { AppDefinition, OSData } from '@/types/deltaos';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { playClickSound } from '@/utils/sounds';
import { 
  Settings, 
  Calculator, 
  Bot, 
  Globe, 
  Gamepad2, 
  FolderOpen, 
  MessageSquare, 
  Camera, 
  Scissors,
  Search,
  Sparkles
} from 'lucide-react';

const apps: AppDefinition[] = [
  { id: 'settings', name: 'Settings', icon: '⚙️', component: 'settings' },
  { id: 'calculator', name: 'Calculator', icon: '🔢', component: 'calculator' },
  { id: 'ai', name: 'AI Assistant', icon: '🤖', component: 'ai' },
  { id: 'browser', name: 'Browser', icon: '🌐', component: 'browser' },
  { id: 'games', name: 'Games', icon: '🎮', component: 'games' },
  { id: 'files', name: 'File Explorer', icon: '📁', component: 'files' },
  { id: 'chat', name: 'Chat', icon: '💬', component: 'chat' },
  { id: 'camera', name: 'Camera', icon: '📷', component: 'camera' },
  { id: 'snippet', name: 'Snippet', icon: '✂️', component: 'snippet' },
];

const iconMap: Record<string, any> = {
  '⚙️': Settings,
  '🔢': Calculator,
  '🤖': Bot,
  '🌐': Globe,
  '🎮': Gamepad2,
  '📁': FolderOpen,
  '💬': MessageSquare,
  '📷': Camera,
  '✂️': Scissors,
};

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenApp: (id: string, name: string, icon: string, component: string) => void;
  userData: OSData;
}

export const CommandPalette = ({ open, onOpenChange, onOpenApp, userData }: CommandPaletteProps) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleSelect = (app: AppDefinition) => {
    playClickSound();
    onOpenApp(app.id, app.name, app.icon, app.component);
    onOpenChange(false);
  };

  const customGames = (userData.customGames || []).map(game => ({
    id: `game-${game.id}`,
    name: game.name,
    icon: '🎮',
    component: 'games' as const,
    gameId: game.id
  }));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <CommandInput 
          placeholder="Search apps, games, and more..." 
          value={search}
          onValueChange={setSearch}
          className="h-14 text-base border-0 border-b border-border/50 rounded-none focus:ring-0"
          data-testid="input-command-search"
        />
      </div>
      <CommandList className="max-h-[400px] p-2">
        <CommandEmpty className="py-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Search className="h-12 w-12 opacity-20" />
            <div>
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try searching for something else</p>
            </div>
          </div>
        </CommandEmpty>
        
        {apps.length > 0 && (
          <CommandGroup heading="Applications" className="px-2 py-2">
            {apps.map((app) => {
              const IconComponent = iconMap[app.icon] || Sparkles;
              return (
                <CommandItem
                  key={app.id}
                  value={app.name}
                  onSelect={() => handleSelect(app)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-all"
                  data-testid={`command-item-${app.id}`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">Application</div>
                  </div>
                  <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">{app.icon}</span>
                  </kbd>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {customGames.length > 0 && (
          <>
            <CommandSeparator className="my-2" />
            <CommandGroup heading="Custom Games" className="px-2 py-2">
              {customGames.map((game) => (
                <CommandItem
                  key={game.id}
                  value={game.name}
                  onSelect={() => handleSelect(game)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-all"
                  data-testid={`command-item-${game.id}`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{game.name}</div>
                    <div className="text-xs text-muted-foreground">Game</div>
                  </div>
                  <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">🎮</span>
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator className="my-2" />
        <div className="px-4 py-2 text-center">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span>Press</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <span>+</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              K
            </kbd>
            <span>to toggle</span>
          </div>
        </div>
      </CommandList>
    </CommandDialog>
  );
};
