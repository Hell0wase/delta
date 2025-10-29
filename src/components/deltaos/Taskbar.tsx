import { useState, useEffect, useRef } from 'react';
import { WindowState } from '@/types/deltaos';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Volume2, VolumeX, Battery, BatteryCharging } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { playHoverSound, playClickSound, setGlobalVolume } from '@/utils/sounds';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface TaskbarProps {
  windows: WindowState[];
  position: 'bottom' | 'left' | 'right';
  onWindowClick: (id: string) => void;
  onPositionChange: (position: 'bottom' | 'left' | 'right') => void;
  currentTime: Date;
  timezone: string;
  onStartClick: () => void;
  taskbarColor: string;
  themeMode: 'dark' | 'light';
}

export const Taskbar = ({
  windows,
  onWindowClick,
  currentTime,
  timezone,
  onStartClick,
  taskbarColor,
  themeMode,
}: TaskbarProps) => {
  const formattedTime = formatInTimeZone(currentTime, timezone, 'h:mm a');
  const formattedDate = formatInTimeZone(currentTime, timezone, 'M/d/yyyy');

  const isDark = themeMode === 'dark';

  // Battery state
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const lowBatteryNotifiedRef = useRef(false);

  // Network state
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Volume state
  const [volume, setVolume] = useState(100);

  // Battery Status API
  useEffect(() => {
    let batteryRef: any = null;

    const checkBatteryLevel = (level: number, charging: boolean) => {
      // Show low battery notification
      if (level < 10 && !charging && !lowBatteryNotifiedRef.current) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-20 right-4 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl z-[10000] animate-slide-up flex items-center gap-3';
        notification.innerHTML = `
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div class="font-bold">Low Battery</div>
            <div class="text-sm">Battery is at ${level}%. Please charge your device.</div>
          </div>
        `;
        document.body.appendChild(notification);
        lowBatteryNotifiedRef.current = true;
        
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateY(20px)';
          notification.style.transition = 'all 0.3s ease';
          setTimeout(() => notification.remove(), 300);
        }, 5000);
      }

      // Reset notification flag when charging or battery increases
      if (level >= 10 || charging) {
        lowBatteryNotifiedRef.current = false;
      }
    };

    const handleLevelChange = () => {
      if (batteryRef) {
        const newLevel = Math.round(batteryRef.level * 100);
        setBatteryLevel(newLevel);
        checkBatteryLevel(newLevel, batteryRef.charging);
      }
    };

    const handleChargingChange = () => {
      if (batteryRef) {
        const newCharging = batteryRef.charging;
        setIsCharging(newCharging);
        checkBatteryLevel(Math.round(batteryRef.level * 100), newCharging);
      }
    };

    const updateBattery = (battery: any) => {
      batteryRef = battery;
      const level = Math.round(battery.level * 100);
      const charging = battery.charging;
      
      setBatteryLevel(level);
      setIsCharging(charging);
      checkBatteryLevel(level, charging);

      battery.addEventListener('levelchange', handleLevelChange);
      battery.addEventListener('chargingchange', handleChargingChange);
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then(updateBattery);
    }

    return () => {
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', handleLevelChange);
        batteryRef.removeEventListener('chargingchange', handleChargingChange);
      }
    };
  }, []);

  // Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update global volume
  useEffect(() => {
    setGlobalVolume(volume / 100);
  }, [volume]);

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center px-4 pb-3 z-50 pointer-events-none">
      {/* Main Taskbar Container - Rounded Floating Design */}
      <div 
        className="flex items-center gap-2 backdrop-blur-[100px] rounded-2xl px-3 py-2.5 shadow-2xl border pointer-events-auto animate-slide-up"
        style={{
          backgroundColor: isDark 
            ? 'rgba(20, 20, 35, 0.35)' 
            : 'rgba(255, 255, 255, 0.45)',
          borderColor: isDark 
            ? 'rgba(255,255,255,0.2)' 
            : 'rgba(0,0,0,0.2)',
          boxShadow: isDark
            ? '0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset, 0 0 60px rgba(100,100,255,0.08)'
            : '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.9) inset, 0 0 40px rgba(200,200,255,0.1)',
        }}
      >
        {/* Start Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95 group"
          onClick={() => {
            playClickSound();
            onStartClick();
          }}
          onMouseEnter={() => playHoverSound()}
          data-testid="button-start"
        >
          <svg className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h11v11H0zm13 0h11v11H13zM0 13h11v11H0zm13 0h11v11H13z" />
          </svg>
        </Button>

        {/* Separator */}
        <div 
          className="w-px h-8 rounded-full"
          style={{
            backgroundColor: isDark 
              ? 'rgba(255,255,255,0.15)' 
              : 'rgba(0,0,0,0.15)',
          }}
        />

        {/* Open Windows */}
        <div className="flex items-center gap-1.5">
          {windows.map((window, index) => (
            <Button
              key={window.id}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-xl relative transition-all duration-200 hover:scale-110 active:scale-95 group ${
                !window.isMinimized 
                  ? 'bg-primary/20 text-primary shadow-md' 
                  : 'hover:bg-muted/60'
              }`}
              onClick={() => {
                playClickSound();
                onWindowClick(window.id);
              }}
              onMouseEnter={() => playHoverSound()}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
              data-testid={`button-window-${window.id}`}
            >
              {window.icon.startsWith('/') || window.icon.includes('://') || window.icon.startsWith('data:') ? (
                <img 
                  src={window.icon} 
                  alt={window.title}
                  className="w-6 h-6 rounded object-cover group-hover:scale-125 transition-transform duration-200"
                />
              ) : (
                <span className="text-xl group-hover:scale-125 transition-transform duration-200 text-white drop-shadow-md">{window.icon}</span>
              )}
              {!window.isMinimized && (
                <div 
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-lg animate-pulse-subtle" 
                  style={{
                    boxShadow: '0 0 8px currentColor',
                  }}
                />
              )}
            </Button>
          ))}
        </div>

        {/* Separator */}
        {windows.length > 0 && (
          <div 
            className="w-px h-8 rounded-full"
            style={{
              backgroundColor: isDark 
                ? 'rgba(255,255,255,0.15)' 
                : 'rgba(0,0,0,0.15)',
            }}
          />
        )}

        {/* System Tray */}
        <div className="flex items-center gap-1">
          {/* WiFi Status */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted/60 transition-all duration-200 hover:scale-110 active:scale-95 group relative"
            onMouseEnter={() => playHoverSound()}
            data-testid="button-wifi"
          >
            {isOnline ? (
              <Wifi className="h-4 w-4 text-white group-hover:text-blue-400 transition-colors drop-shadow-md" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors drop-shadow-md" />
            )}
            {!isOnline && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-red-400 rotate-45 rounded-full" />
              </div>
            )}
          </Button>

          {/* Volume Control */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-muted/60 transition-all duration-200 hover:scale-110 active:scale-95 group"
                onMouseEnter={() => playHoverSound()}
                data-testid="button-volume"
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-white group-hover:text-blue-400 transition-colors drop-shadow-md" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white group-hover:text-blue-400 transition-colors drop-shadow-md" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-48 p-4"
              style={{
                backgroundColor: isDark 
                  ? 'rgba(20, 20, 35, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(0,0,0,0.15)',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                    Website Volume
                  </span>
                  <span className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                    {volume}%
                  </span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                  data-testid="slider-volume"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Battery Status */}
          <div
            className="h-9 px-2 rounded-xl hover:bg-muted/60 transition-all duration-200 hover:scale-110 active:scale-95 group relative flex items-center cursor-pointer"
            onMouseEnter={() => playHoverSound()}
            data-testid="button-battery"
          >
            {isCharging ? (
              <BatteryCharging className="h-4 w-4 text-green-400 group-hover:text-green-300 transition-colors drop-shadow-md" />
            ) : (
              <div className="relative w-4 h-4" data-testid="battery-icon-container">
                {/* Battery outline */}
                <svg 
                  viewBox="0 0 24 16" 
                  className={`w-full h-full transition-colors drop-shadow-md ${
                    batteryLevel !== null && batteryLevel < 10 
                      ? 'text-red-400 group-hover:text-red-300' 
                      : batteryLevel !== null && batteryLevel < 30
                      ? 'text-yellow-400 group-hover:text-yellow-300'
                      : 'text-green-400 group-hover:text-green-300'
                  }`}
                >
                  {/* Battery body outline */}
                  <rect x="0.5" y="2.5" width="20" height="11" rx="1.5" ry="1.5" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.2"
                  />
                  {/* Battery terminal */}
                  <rect x="21" y="5.5" width="2" height="5" rx="0.5" ry="0.5" 
                    fill="currentColor"
                  />
                  {/* Battery level fill */}
                  {batteryLevel !== null && (
                    <rect 
                      x="2" 
                      y="4" 
                      width={`${(batteryLevel / 100) * 17}`} 
                      height="8" 
                      rx="0.5" 
                      ry="0.5"
                      className={`transition-all duration-300 ${
                        batteryLevel < 10 
                          ? 'fill-red-500' 
                          : batteryLevel < 30
                          ? 'fill-yellow-500'
                          : 'fill-green-500'
                      }`}
                    />
                  )}
                </svg>
              </div>
            )}
          </div>
          
          {/* Clock */}
          <button
            className="ml-1 px-3 py-1.5 rounded-xl text-xs text-center hover:bg-muted/60 transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95 group"
            onMouseEnter={() => playHoverSound()}
            data-testid="button-clock"
          >
            <div className="font-bold leading-tight text-[11px] text-white group-hover:text-blue-400 transition-colors drop-shadow-md">{formattedTime}</div>
            <div className="leading-tight text-[9px] text-white/90 group-hover:text-blue-400 transition-colors drop-shadow-md">{formattedDate}</div>
          </button>
        </div>
      </div>
    </div>
  );
};
