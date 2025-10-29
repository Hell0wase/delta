import { useState, useMemo } from 'react';
import { Download, Check, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OSData } from '@/types/deltaos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DeltaStoreAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

interface StoreApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'productivity' | 'entertainment' | 'utilities';
}

const STORE_APPS: StoreApp[] = [
  { id: 'ai', name: 'AI Assistant', icon: '🤖', description: 'Chat with Llama 3.3 70B AI', category: 'productivity' },
  { id: 'browser', name: 'Browser', icon: '🌐', description: 'Browse the web', category: 'utilities' },
  { id: 'movies', name: 'Movies', icon: '🎬', description: 'Stream movies and TV shows', category: 'entertainment' },
  { id: 'deltagames', name: 'Delta Games', icon: '🎯', description: 'Play pre-loaded Delta games', category: 'entertainment' },
  { id: 'files', name: 'File Explorer', icon: '📁', description: 'Manage your files', category: 'utilities' },
  { id: 'games', name: 'Add Apps', icon: '🎯', description: 'Add Custom games or Apps', category: 'utilities' },
  { id: 'chat', name: 'Chat', icon: '💬', description: 'Send and receive messages', category: 'productivity' },
  { id: 'snippet', name: 'Snippet', icon: '✂️', description: 'Take screenshots', category: 'utilities' },
  { id: 'notes', name: 'Notes', icon: '📝', description: 'Take and organize notes', category: 'productivity' },
  { id: 'music', name: 'Music Player', icon: '🎵', description: 'Play your music', category: 'entertainment' },
  { id: 'paint', name: 'Paint', icon: '🎨', description: 'Draw and create art', category: 'entertainment' },
  { id: 'clock', name: 'Clock', icon: '⏰', description: 'World clock, timer, and stopwatch', category: 'utilities' },
  { id: 'tasks', name: 'Tasks', icon: '✅', description: 'Manage your todo list', category: 'productivity' },
  { id: 'email', name: 'Email', icon: '📧', description: 'Send and receive emails with full inbox management', category: 'productivity' },
  { id: 'terminal', name: 'Terminal', icon: '💻', description: 'Command-line interface with built-in commands', category: 'utilities' },
  { id: 'code', name: 'Code Editor', icon: '⌨️', description: 'Edit code with syntax highlighting and file management', category: 'productivity' },
  { id: 'systemmonitor', name: 'System Monitor', icon: '📊', description: 'Monitor CPU, memory, and system performance', category: 'utilities' },
  { id: 'maps', name: 'Maps', icon: '🗺️', description: 'Search locations and get directions', category: 'utilities' },
  { id: 'photos', name: 'Photos', icon: '🖼️', description: 'View and organize your photo collection', category: 'entertainment' },
];

export const DeltaStoreApp = ({ userData, onUpdateUserData }: DeltaStoreAppProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'productivity' | 'entertainment' | 'utilities'>('all');

  const filteredApps = useMemo(() => {
    let apps = STORE_APPS;
    
    if (selectedCategory !== 'all') {
      apps = apps.filter(app => app.category === selectedCategory);
    }
    
    if (searchQuery) {
      apps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return apps;
  }, [searchQuery, selectedCategory]);

  const handleInstall = (appId: string) => {
    if (!userData.installedApps.includes(appId)) {
      const updatedData = {
        ...userData,
        installedApps: [...userData.installedApps, appId],
      };
      onUpdateUserData(updatedData);
    }
  };

  const handleUninstall = (appId: string) => {
    const protectedApps = ['settings', 'store'];
    if (protectedApps.includes(appId)) {
      return;
    }
    
    const updatedData = {
      ...userData,
      installedApps: userData.installedApps.filter(id => id !== appId),
    };
    onUpdateUserData(updatedData);
  };

  const isInstalled = (appId: string) => {
    return userData.installedApps?.includes(appId) ?? false;
  };

  const isProtected = (appId: string) => {
    return ['settings', 'store'].includes(appId);
  };

  return (
    <div className="flex flex-col h-full bg-background" data-testid="app-delta-store">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                Delta Store
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover and install apps for your Delta OS
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card border-primary/20 focus-visible:ring-primary"
              data-testid="input-search-store"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-6">
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" data-testid="tab-all">All Apps</TabsTrigger>
              <TabsTrigger value="productivity" data-testid="tab-productivity">Productivity</TabsTrigger>
              <TabsTrigger value="entertainment" data-testid="tab-entertainment">Entertainment</TabsTrigger>
              <TabsTrigger value="utilities" data-testid="tab-utilities">Utilities</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid gap-4">
                {filteredApps.map((app, index) => {
                  const installed = isInstalled(app.id);
                  const protected_ = isProtected(app.id);
                  
                  return (
                    <div
                      key={app.id}
                      className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      data-testid={`card-app-${app.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                          {app.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {app.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{app.description}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {app.category}
                            </span>
                          </div>
                        </div>
                        <div>
                          {installed ? (
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 min-w-[100px] border-green-500/50 text-green-600 dark:text-green-400"
                                disabled
                                data-testid={`button-installed-${app.id}`}
                              >
                                <Check className="h-4 w-4" />
                                Installed
                              </Button>
                              {!protected_ && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUninstall(app.id)}
                                  className="text-xs text-muted-foreground hover:text-destructive"
                                  data-testid={`button-uninstall-${app.id}`}
                                >
                                  Uninstall
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleInstall(app.id)}
                              size="sm"
                              className="gap-2 min-w-[100px]"
                              data-testid={`button-install-${app.id}`}
                            >
                              <Download className="h-4 w-4" />
                              Install
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredApps.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground animate-fade-in">
                    <div className="text-6xl mb-4">📦</div>
                    <div className="font-semibold text-lg mb-2">No apps found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
