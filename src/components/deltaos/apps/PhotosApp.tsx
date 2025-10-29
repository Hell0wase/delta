import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image as ImageIcon, Grid3x3, List, Heart, Download, Share2, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface Photo {
  id: number;
  title: string;
  url: string;
  category: string;
  liked: boolean;
  date: string;
}

const samplePhotos: Photo[] = [
  {
    id: 1,
    title: 'Mountain Landscape',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'Nature',
    liked: false,
    date: '2024-10-20',
  },
  {
    id: 2,
    title: 'City Skyline',
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
    category: 'Urban',
    liked: true,
    date: '2024-10-19',
  },
  {
    id: 3,
    title: 'Ocean Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    category: 'Nature',
    liked: false,
    date: '2024-10-18',
  },
  {
    id: 4,
    title: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    category: 'Nature',
    liked: false,
    date: '2024-10-17',
  },
  {
    id: 5,
    title: 'Modern Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    category: 'Urban',
    liked: true,
    date: '2024-10-16',
  },
  {
    id: 6,
    title: 'Northern Lights',
    url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=800',
    category: 'Nature',
    liked: false,
    date: '2024-10-15',
  },
];

export const PhotosApp = () => {
  const [photos, setPhotos] = useState<Photo[]>(samplePhotos);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [filter, setFilter] = useState<'all' | 'liked'>('all');
  const [zoom, setZoom] = useState(100);

  const filteredPhotos = filter === 'liked' ? photos.filter(p => p.liked) : photos;

  const toggleLike = (id: number) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
  };

  const deletePhoto = (id: number) => {
    setPhotos(photos.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar */}
      <div className="w-56 border-r bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Photos
          </h2>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setFilter('all')}
              data-testid="button-all-photos"
            >
              <Grid3x3 className="h-4 w-4 mr-3" />
              All Photos
              <span className="ml-auto text-xs text-muted-foreground">{photos.length}</span>
            </Button>
            <Button
              variant={filter === 'liked' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setFilter('liked')}
              data-testid="button-liked"
            >
              <Heart className="h-4 w-4 mr-3" />
              Liked
              <span className="ml-auto text-xs text-muted-foreground">
                {photos.filter(p => p.liked).length}
              </span>
            </Button>
          </div>
          
          <div className="p-4 pt-6">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">ALBUMS</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm" data-testid="button-nature">
                Nature ({photos.filter(p => p.category === 'Nature').length})
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" data-testid="button-urban">
                Urban ({photos.filter(p => p.category === 'Urban').length})
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedPhoto && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-download-photo">
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectedPhoto && deletePhoto(selectedPhoto.id)}
                data-testid="button-delete-photo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Photo View */}
        {selectedPhoto ? (
          <div className="flex-1 flex flex-col bg-black">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 backdrop-blur-sm">
              <div>
                <h3 className="font-semibold text-white">{selectedPhoto.title}</h3>
                <p className="text-sm text-gray-400">{selectedPhoto.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="h-4 w-4 text-white" />
                </Button>
                <span className="text-sm text-white w-16 text-center">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="h-4 w-4 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLike(selectedPhoto.id)}
                  data-testid="button-like-photo"
                >
                  <Heart className={`h-5 w-5 ${selectedPhoto.liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPhoto(null)}
                  data-testid="button-close-photo"
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedPhoto(photo)}
                    data-testid={`photo-${photo.id}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-semibold text-sm">{photo.title}</p>
                        <p className="text-gray-300 text-xs">{photo.date}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(photo.id);
                      }}
                      data-testid={`button-like-${photo.id}`}
                    >
                      <Heart className={`h-4 w-4 ${photo.liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedPhoto(photo)}
                    data-testid={`photo-list-${photo.id}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{photo.title}</h3>
                      <p className="text-sm text-muted-foreground">{photo.category} • {photo.date}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(photo.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${photo.liked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
