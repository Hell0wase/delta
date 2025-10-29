import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Navigation, MapPin, Layers, Plus, Minus, Locate, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
}

const savedLocations: Location[] = [
  { name: 'Delta HQ', address: '123 Tech Avenue, Silicon Valley', lat: 37.3861, lng: -122.0839, category: 'Office' },
  { name: 'Central Park', address: 'Manhattan, New York', lat: 40.7829, lng: -73.9654, category: 'Park' },
  { name: 'Eiffel Tower', address: 'Paris, France', lat: 48.8584, lng: 2.2945, category: 'Landmark' },
  { name: 'Tech Conference Center', address: '456 Innovation Blvd', lat: 37.4220, lng: -122.0841, category: 'Event' },
];

export const MapsApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [zoom, setZoom] = useState(12);
  const [mapType, setMapType] = useState<'road' | 'satellite' | 'terrain'>('road');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location to search');
      return;
    }

    setIsSearching(true);
    
    try {
      // First check saved locations
      const savedMatch = savedLocations.find(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (savedMatch) {
        setSelectedLocation(savedMatch);
        toast.success(`Found: ${savedMatch.name}`);
        setIsSearching(false);
        return;
      }

      // Use Nominatim API for real geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();

      if (results && results.length > 0) {
        const result = results[0];
        const location: Location = {
          name: result.display_name.split(',')[0],
          address: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          category: result.type || 'Place',
        };
        setSelectedLocation(location);
        toast.success(`Found: ${location.name}`);
      } else {
        toast.error('Location not found. Try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getDirections = () => {
    if (selectedLocation) {
      toast.success(`Getting directions to ${selectedLocation.name}...`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Search Bar */}
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
              data-testid="input-search-location"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} data-testid="button-search">
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Saved Places</h3>
            <div className="space-y-2">
              {savedLocations.map((location, index) => (
                <Card
                  key={index}
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                    selectedLocation?.name === location.name ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedLocation(location)}
                  data-testid={`location-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{location.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{location.address}</p>
                      <p className="text-xs text-primary mt-1">{location.category}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {selectedLocation && (
            <div className="p-4 border-t bg-card/50">
              <h4 className="font-semibold mb-3">{selectedLocation.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{selectedLocation.address}</p>
              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={getDirections}
                  data-testid="button-directions"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" data-testid="button-save">
                    Save
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-share-location">
                    Share
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="font-mono">{selectedLocation.lat.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="font-mono">{selectedLocation.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="flex-1 relative">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 space-y-2">
            <Card className="p-2">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.min(18, zoom + 1))}
                  data-testid="button-zoom-in-map"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <div className="text-center text-xs font-medium px-2">{zoom}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.max(1, zoom - 1))}
                  data-testid="button-zoom-out-map"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="p-2">
              <Button variant="ghost" size="icon" data-testid="button-locate">
                <Locate className="h-4 w-4" />
              </Button>
            </Card>

            <Card className="p-2">
              <Button variant="ghost" size="icon" data-testid="button-layers">
                <Layers className="h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* Map Type Selector */}
          <div className="absolute bottom-4 left-4 z-10">
            <Card className="p-2">
              <div className="flex gap-2">
                {(['road', 'satellite', 'terrain'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={mapType === type ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapType(type)}
                    data-testid={`button-${type}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Map Display - Real OpenStreetMap */}
          <div className="w-full h-full relative overflow-hidden">
            {selectedLocation ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.02},${selectedLocation.lat - 0.01},${selectedLocation.lng + 0.02},${selectedLocation.lat + 0.01}&layer=${mapType === 'satellite' ? 's' : 'mapnik'}&marker=${selectedLocation.lat},${selectedLocation.lng}`}
                className="w-full h-full border-0"
                title={`Map showing ${selectedLocation.name}`}
                loading="lazy"
                data-testid="map-iframe"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center">
                <div className="text-center z-10 bg-card/80 backdrop-blur-sm p-6 rounded-lg border">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Delta Maps</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Search for a location or select from saved places to view on the real OpenStreetMap
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Powered by OpenStreetMap
                  </div>
                </div>
              </div>
            )}
            
            {/* Overlay attribution */}
            {selectedLocation && (
              <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded text-xs z-20">
                © OpenStreetMap contributors
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
