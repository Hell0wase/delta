import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Clock, Timer } from 'lucide-react';
import { toast } from 'sonner';

export const ClockApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;
    if (timerActive && timerRemaining > 0) {
      interval = window.setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            toast.success('Timer finished!', { duration: 5000 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerRemaining]);

  // Stopwatch logic
  useEffect(() => {
    let interval: number | undefined;
    if (stopwatchActive) {
      interval = window.setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchActive]);

  const startTimer = () => {
    const totalSeconds = timerMinutes * 60 + timerSeconds;
    if (totalSeconds === 0) {
      toast.error('Please set a time');
      return;
    }
    setTimerRemaining(totalSeconds);
    setTimerActive(true);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const centisecs = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
  };

  const worldClocks = [
    { city: 'New York', offset: -5 },
    { city: 'London', offset: 0 },
    { city: 'Tokyo', offset: 9 },
    { city: 'Sydney', offset: 11 },
  ];

  const getWorldTime = (offset: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (3600000 * offset));
    return cityTime.toLocaleTimeString();
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-blue-500/5">
      <Tabs defaultValue="clock" className="h-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="clock" data-testid="tab-clock">
            <Clock className="h-4 w-4 mr-2" />
            Clock
          </TabsTrigger>
          <TabsTrigger value="timer" data-testid="tab-timer">
            <Timer className="h-4 w-4 mr-2" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="stopwatch" data-testid="tab-stopwatch">
            <Timer className="h-4 w-4 mr-2" />
            Stopwatch
          </TabsTrigger>
        </TabsList>

        {/* Clock Tab */}
        <TabsContent value="clock" className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-2xl text-muted-foreground mb-12">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {worldClocks.map((clock) => (
                <div
                  key={clock.city}
                  className="p-4 rounded-lg bg-muted/40 border border-border/50"
                  data-testid={`world-clock-${clock.city}`}
                >
                  <div className="font-semibold">{clock.city}</div>
                  <div className="text-xl">{getWorldTime(clock.offset)}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Timer Tab */}
        <TabsContent value="timer" className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-full">
            {!timerActive && timerRemaining === 0 ? (
              <>
                <div className="text-4xl font-bold mb-8">Set Timer</div>
                <div className="flex gap-4 mb-8">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Minutes</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-center text-2xl"
                      data-testid="input-timer-minutes"
                    />
                  </div>
                  <div className="text-4xl self-end pb-2">:</div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Seconds</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-24 text-center text-2xl"
                      data-testid="input-timer-seconds"
                    />
                  </div>
                </div>
                <Button
                  onClick={startTimer}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-lg px-8 py-6"
                  data-testid="button-start-timer"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Timer
                </Button>
              </>
            ) : (
              <>
                <div className="text-8xl font-bold mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {formatTime(timerRemaining)}
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setTimerActive(!timerActive)}
                    size="lg"
                    data-testid="button-pause-timer"
                  >
                    {timerActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {timerActive ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="lg"
                    data-testid="button-reset-timer"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Stopwatch Tab */}
        <TabsContent value="stopwatch" className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-8xl font-bold mb-12 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {formatStopwatch(stopwatchTime)}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setStopwatchActive(!stopwatchActive)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-lg px-8 py-6"
                data-testid="button-toggle-stopwatch"
              >
                {stopwatchActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {stopwatchActive ? 'Pause' : 'Start'}
              </Button>
              <Button
                onClick={() => {
                  setStopwatchActive(false);
                  setStopwatchTime(0);
                }}
                variant="outline"
                className="text-lg px-8 py-6"
                data-testid="button-reset-stopwatch"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
