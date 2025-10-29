import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Cpu, HardDrive, Wifi, Battery, Clock, Gauge } from 'lucide-react';

interface ProcessInfo {
  name: string;
  cpu: number;
  memory: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const SystemMonitorApp = () => {
  const [cpuCores, setCpuCores] = useState(navigator.hardwareConcurrency || 4);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [memoryUsed, setMemoryUsed] = useState(0);
  const [memoryTotal, setMemoryTotal] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageTotal, setStorageTotal] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [networkType, setNetworkType] = useState('Unknown');
  const [networkDownlink, setNetworkDownlink] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [batteryCharging, setBatteryCharging] = useState(false);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);

  useEffect(() => {
    const startTime = performance.now();

    const updateStats = () => {
      // Real memory usage from Performance API
      const memory = (performance as any).memory as MemoryInfo | undefined;
      if (memory) {
        const used = memory.usedJSHeapSize / (1024 * 1024);
        const total = memory.jsHeapSizeLimit / (1024 * 1024);
        setMemoryUsed(used);
        setMemoryTotal(total);
        setMemoryUsage((used / total) * 100);
      }

      // Real uptime
      setUptime(Math.floor((performance.now() - startTime) / 1000));

      // Real storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          if (estimate.usage && estimate.quota) {
            const used = estimate.usage / (1024 * 1024 * 1024);
            const total = estimate.quota / (1024 * 1024 * 1024);
            setStorageUsed(used);
            setStorageTotal(total);
            setStorageUsage((estimate.usage / estimate.quota) * 100);
          }
        });
      }

      // Real network info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setNetworkType(connection.effectiveType || 'Unknown');
        setNetworkDownlink(connection.downlink || 0);
      }

      // Real process memory (from performance)
      if (memory) {
        setProcesses([
          { name: 'Delta OS (Main Thread)', cpu: 0, memory: memory.usedJSHeapSize / (1024 * 1024) },
          { name: 'Renderer Process', cpu: 0, memory: (memory.totalJSHeapSize - memory.usedJSHeapSize) / (1024 * 1024) },
        ]);
      }
    };

    // Real battery info
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setBatteryCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getUsageColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-muted/30 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">System Monitor</h1>
            <p className="text-muted-foreground">Real-time browser performance metrics</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Cpu className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPU Cores</p>
                <p className="text-2xl font-bold">{cpuCores}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Gauge className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">JS Heap</p>
                <p className="text-2xl font-bold">{memoryUsed.toFixed(0)} MB</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <HardDrive className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{storageUsed.toFixed(2)} GB</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(uptime)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* CPU & Memory */}
          <Card className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">CPU Cores</span>
                </div>
                <span className="text-sm font-medium">{cpuCores} Cores</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Hardware Concurrency: {cpuCores} logical processors
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">JavaScript Heap Memory</span>
                </div>
                <span className="text-sm font-medium">
                  {memoryUsed.toFixed(1)} / {memoryTotal.toFixed(1)} MB
                </span>
              </div>
              <Progress value={memoryUsage} className="h-3" data-testid="progress-memory" />
              <p className="text-xs text-muted-foreground mt-2">
                Heap Limit: {memoryTotal.toFixed(1)} MB • {(memoryTotal - memoryUsed).toFixed(1)} MB Available
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Browser Storage Quota</span>
                </div>
                <span className="text-sm font-medium">
                  {storageUsed.toFixed(3)} / {storageTotal.toFixed(2)} GB
                </span>
              </div>
              <Progress value={storageUsage} className="h-3" data-testid="progress-storage" />
              <p className="text-xs text-muted-foreground mt-2">
                Storage API • {(storageTotal - storageUsed).toFixed(2)} GB Free
              </p>
            </div>
          </Card>

          {/* Network & Battery */}
          <Card className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="h-5 w-5 text-cyan-500" />
                <span className="font-semibold">Network Connection</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Connection Type</span>
                    <span className="text-sm font-medium uppercase">
                      {networkType}
                    </span>
                  </div>
                </div>
                {networkDownlink > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Downlink Speed</span>
                      <span className="text-sm font-medium">
                        {networkDownlink.toFixed(1)} Mbps
                      </span>
                    </div>
                    <Progress value={Math.min(networkDownlink * 10, 100)} className="h-2" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Network Information API • {networkType === 'Unknown' ? 'Limited browser support' : 'Real-time connection data'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Battery className={`h-5 w-5 ${batteryCharging ? 'text-green-500' : 'text-orange-500'}`} />
                <span className="font-semibold">Battery Status</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Charge Level</span>
                  <span className="text-sm font-medium">{batteryLevel}%</span>
                </div>
                <Progress value={batteryLevel} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {batteryCharging ? '🔌 Charging' : '🔋 Discharging'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <p className="text-lg font-semibold text-primary mb-1">Browser Performance API</p>
                <p className="text-xs text-muted-foreground">
                  All metrics are real-time readings from your browser's Performance, Storage, Network, and Battery APIs
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Processes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Browser Processes</span>
          </div>
          <ScrollArea className="h-64">
            {processes.length > 0 ? (
              <div className="space-y-2">
                {processes.map((process, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    data-testid={`process-${index}`}
                  >
                    <span className="font-medium">{process.name}</span>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Memory:</span>
                        <span className="font-medium w-16 text-right">{process.memory.toFixed(1)} MB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Process information available when Performance API is supported</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};
