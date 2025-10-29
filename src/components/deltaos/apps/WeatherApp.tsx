import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
}

export const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo';

  const fetchWeather = async () => {
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setLoading(true);

    try {
      if (API_KEY === 'demo') {
        // Demo mode with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockTemp = Math.floor(Math.random() * 30) + 10;
        const mockFeelsLike = Math.floor(Math.random() * 30) + 10;
        console.log('Demo mode - Generated temperature:', mockTemp);
        
        const weatherData = {
          location: city,
          temperature: mockTemp,
          feelsLike: mockFeelsLike,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          pressure: Math.floor(Math.random() * 50) + 1000,
          visibility: Math.floor(Math.random() * 5) + 5,
        };
        console.log('Setting weather data:', weatherData);
        setWeather(weatherData);
        toast.info('Using demo weather data. Add VITE_WEATHER_API_KEY for real data.');
      } else {
        // Real API call
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        console.log('Weather API Response:', data);
        console.log('Temperature:', data.main?.temp);
        
        setWeather({
          location: data.name,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000),
        });
      }
    } catch (error) {
      toast.error('Failed to fetch weather data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return <CloudRain className="h-32 w-32" />;
    if (lower.includes('cloud')) return <Cloud className="h-32 w-32" />;
    return <Sun className="h-32 w-32" />;
  };

  return (
    <div className="h-full p-8 bg-gradient-to-br from-background via-background to-sky-500/5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Weather</h1>
        
        <div className="flex gap-2 mb-8">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            className="text-lg"
            data-testid="input-city"
          />
          <Button
            onClick={fetchWeather}
            disabled={loading}
            className="bg-gradient-to-r from-sky-500 to-blue-500"
            data-testid="button-search-weather"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </div>

        {weather && (
          <div className="space-y-6">
            <div className="text-center p-8 rounded-2xl bg-muted/40 border border-border/50">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-location">{weather.location}</h2>
              <div className="flex items-center justify-center mb-4 text-sky-500">
                {getWeatherIcon(weather.condition)}
              </div>
              <div className="text-6xl font-bold mb-2" data-testid="text-temperature">
                {weather.temperature !== undefined ? weather.temperature : 'N/A'}°C
              </div>
              <div className="text-xl text-muted-foreground mb-2" data-testid="text-condition">{weather.condition}</div>
              <div className="text-sm text-muted-foreground" data-testid="text-feels-like">
                Feels like {weather.feelsLike !== undefined ? weather.feelsLike : 'N/A'}°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-sky-500 mb-2">
                  <Droplets className="h-5 w-5" />
                  <span className="font-semibold">Humidity</span>
                </div>
                <div className="text-2xl font-bold">{weather.humidity}%</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-sky-500 mb-2">
                  <Wind className="h-5 w-5" />
                  <span className="font-semibold">Wind Speed</span>
                </div>
                <div className="text-2xl font-bold">{weather.windSpeed} km/h</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-sky-500 mb-2">
                  <Gauge className="h-5 w-5" />
                  <span className="font-semibold">Pressure</span>
                </div>
                <div className="text-2xl font-bold">{weather.pressure} hPa</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 text-sky-500 mb-2">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold">Visibility</span>
                </div>
                <div className="text-2xl font-bold">{weather.visibility} km</div>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Cloud className="h-24 w-24 mx-auto mb-4 opacity-50" />
            <p>Enter a city name to check the weather</p>
          </div>
        )}
      </div>
    </div>
  );
};
