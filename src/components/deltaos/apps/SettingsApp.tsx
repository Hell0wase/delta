import { useState } from 'react';
import { OSData } from '@/types/deltaos';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Palette, Shield, Save, ExternalLink, Eye, FileText, Download, Upload, Activity, MessageSquare, Scale } from 'lucide-react';
import { openInAboutBlank } from '@/utils/aboutBlank';
import { setGlobalVolume } from '@/utils/sounds';

interface SettingsAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

const DISGUISES = [
  { value: 'none', label: '(None)', title: 'No disguise', description: 'Your tab will keep the current title and favicon.', favicon: '' },
  { value: 'clever', label: 'Clever', title: 'Clever', description: 'Portal: Clever', favicon: '/assets/disguises/clever.ico' },
  { value: 'google-classroom', label: 'Google Classroom', title: 'Google Classroom', description: 'Classes - Google Classroom', favicon: '/assets/disguises/classroom.ico' },
  { value: 'canvas', label: 'Dashboard', title: 'Dashboard', description: 'Dashboard - Canvas', favicon: '/assets/disguises/canvas.png' },
  { value: 'google-drive', label: 'Home - Google Drive', title: 'Home - Google Drive', description: 'My Drive - Google Drive', favicon: '/assets/disguises/drive.png' },
  { value: 'seesaw', label: 'Seesaw', title: 'Seesaw', description: 'Student Dashboard - Seesaw', favicon: '/assets/disguises/seesaw.jpg' },
  { value: 'edpuzzle', label: 'Edpuzzle', title: 'Edpuzzle', description: 'Classes - Edpuzzle', favicon: '/assets/disguises/edpuzzle.png' },
  { value: 'kahoot', label: 'Kahoot!', title: 'Kahoot!', description: 'Create and play quizzes', favicon: '/assets/disguises/kahoot.ico' },
  { value: 'quizlet', label: 'Quizlet', title: 'Quizlet', description: 'Study sets - Quizlet', favicon: '/assets/disguises/quizlet.png' },
  { value: 'khan-academy', label: 'Khan Academy', title: 'Khan Academy', description: 'Dashboard - Khan Academy', favicon: '/assets/disguises/khanacademy.ico' },
];

export const SettingsApp = ({ userData, onUpdateUserData }: SettingsAppProps) => {
  const [settings, setSettings] = useState(userData.user.settings);
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [selectedDisguise, setSelectedDisguise] = useState('none');
  const [applyDisguiseToBlank, setApplyDisguiseToBlank] = useState(false);

  const handleSave = () => {
    const isPinBeingChanged = pin.trim() !== '';
    const wasPinEnabled = userData.user.settings.pinEnabled;
    const isPinNowEnabled = settings.pinEnabled;
    const isEnablingPinForFirstTime = !wasPinEnabled && isPinNowEnabled;
    const isPinLengthChanged = wasPinEnabled && settings.pinLength !== userData.user.settings.pinLength;

    if (isPinNowEnabled && (isEnablingPinForFirstTime || isPinBeingChanged || isPinLengthChanged)) {
      if (!pin) {
        if (isPinLengthChanged) {
          toast.error(`Please enter a new ${settings.pinLength}-digit PIN`);
        } else {
          toast.error('Please enter a PIN');
        }
        return;
      }
      if (pin.length !== settings.pinLength) {
        toast.error(`PIN must be ${settings.pinLength} digits`);
        return;
      }
      if (!/^\d+$/.test(pin)) {
        toast.error('PIN must contain only numbers');
        return;
      }
    }

    const updatedData = {
      ...userData,
      user: {
        ...userData.user,
        settings: {
          ...settings,
          ...(isPinBeingChanged && { pin }),
        },
        ...(password && { password }),
      },
    };
    
    onUpdateUserData(updatedData);
    toast.success('Settings saved! Refresh to see changes.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const applyThemePreset = (mode: 'dark' | 'light') => {
    const presets = {
      dark: {
        backgroundColor: '#1a1a2e',
        taskbarColor: '#0a0a0f',
      },
      light: {
        backgroundColor: '#f0f4f8',
        taskbarColor: '#ffffff',
      },
    };
    
    setSettings({
      ...settings,
      themeMode: mode,
      backgroundColor: presets[mode].backgroundColor,
      taskbarColor: presets[mode].taskbarColor,
    });
  };

  const applyColorPreset = (preset: { backgroundColor: string; taskbarColor: string; name: string }) => {
    setSettings({
      ...settings,
      backgroundColor: preset.backgroundColor,
      taskbarColor: preset.taskbarColor,
    });
    toast.success(`Applied ${preset.name} theme`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSettings({
        ...settings,
        backgroundImage: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const applyDisguise = () => {
    try {
      const disguise = DISGUISES.find(d => d.value === selectedDisguise) || DISGUISES[0];
      
      // Change the document title
      const pageTitle = disguise.value !== 'none' ? disguise.title : 'Delta OS';
      document.title = pageTitle;
      
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll("link[rel*='icon']");
      existingFavicons.forEach(favicon => favicon.remove());
      
      // Add new favicon
      if (disguise.favicon) {
        const faviconUrl = `${window.location.origin}${disguise.favicon}`;
        const faviconType = disguise.favicon.endsWith('.ico') ? 'image/x-icon' : 
                           disguise.favicon.endsWith('.png') ? 'image/png' : 
                           disguise.favicon.endsWith('.jpg') || disguise.favicon.endsWith('.jpeg') ? 'image/jpeg' : 
                           'image/x-icon';
        
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = faviconType;
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
        
        // Also add apple-touch-icon for better compatibility
        const appleFavicon = document.createElement('link');
        appleFavicon.rel = 'apple-touch-icon';
        appleFavicon.href = faviconUrl;
        document.head.appendChild(appleFavicon);
      } else {
        // Reset to default favicon
        const defaultFavicon = document.createElement('link');
        defaultFavicon.rel = 'icon';
        defaultFavicon.type = 'image/x-icon';
        defaultFavicon.href = '/favicon.ico';
        document.head.appendChild(defaultFavicon);
      }
      
      toast.success(`Disguise applied: ${disguise.label}`);
    } catch (err) {
      toast.error('Failed to apply disguise');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deltaos-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          onUpdateUserData(importedData);
          toast.success('Data imported! Refreshing...');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          toast.error('Invalid data file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const disguise = DISGUISES.find(d => d.value === selectedDisguise) || DISGUISES[0];

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto bg-gradient-to-br from-background via-background to-cyan-500/5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Settings</h2>
          <p className="text-xs text-muted-foreground">Version: v9</p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
          <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600" data-testid="tab-appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="cloaking" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600" data-testid="tab-cloaking">
            <Eye className="h-4 w-4 mr-2" />
            Cloaking
          </TabsTrigger>
          <TabsTrigger value="legal" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600" data-testid="tab-legal">
            <Scale className="h-4 w-4 mr-2" />
            Legal
          </TabsTrigger>
          <TabsTrigger value="misc" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600" data-testid="tab-misc">
            <FileText className="h-4 w-4 mr-2" />
            Misc
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="space-y-6 backdrop-blur-3xl rounded-3xl p-8 border animate-fade-in"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Appearance</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="themeMode" className="text-base font-semibold mb-3 block">Theme Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={settings.themeMode === 'dark' ? 'default' : 'outline'}
                    onClick={() => applyThemePreset('dark')}
                    className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:scale-105 transition-all duration-200"
                    data-testid="button-theme-dark"
                  >
                    🌙 Dark
                  </Button>
                  <Button
                    type="button"
                    variant={settings.themeMode === 'light' ? 'default' : 'outline'}
                    onClick={() => applyThemePreset('light')}
                    className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:scale-105 transition-all duration-200"
                    data-testid="button-theme-light"
                  >
                    ☀️ Light
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This will update background and taskbar colors
                </p>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Color Presets</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#1e3a8a', taskbarColor: '#1e40af', name: 'Blue' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af)' }}
                    data-testid="button-preset-blue"
                  >
                    🔵 Blue
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#7c2d12', taskbarColor: '#991b1b', name: 'Red' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c2d12, #991b1b)' }}
                    data-testid="button-preset-red"
                  >
                    🔴 Red
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#065f46', taskbarColor: '#047857', name: 'Green' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #065f46, #047857)' }}
                    data-testid="button-preset-green"
                  >
                    🟢 Green
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#6b21a8', taskbarColor: '#7c3aed', name: 'Purple' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)' }}
                    data-testid="button-preset-purple"
                  >
                    🟣 Purple
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#ea580c', taskbarColor: '#f97316', name: 'Orange' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
                    data-testid="button-preset-orange"
                  >
                    🟠 Orange
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#be123c', taskbarColor: '#e11d48', name: 'Pink' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #be123c, #e11d48)' }}
                    data-testid="button-preset-pink"
                  >
                    🩷 Pink
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#854d0e', taskbarColor: '#a16207', name: 'Yellow' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #854d0e, #a16207)' }}
                    data-testid="button-preset-yellow"
                  >
                    🟡 Yellow
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyColorPreset({ backgroundColor: '#0e7490', taskbarColor: '#0891b2', name: 'Cyan' })}
                    className="h-12 rounded-xl backdrop-blur-xl hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #0e7490, #0891b2)' }}
                    data-testid="button-preset-cyan"
                  >
                    🔵 Cyan
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Quick color themes for your OS
                </p>
              </div>

              <div>
                <Label htmlFor="fontSize" className="text-base font-semibold">Font Size ({settings.fontSize}px)</Label>
                <Input
                  id="fontSize"
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                  className="mt-3"
                  data-testid="input-font-size"
                />
              </div>

              <div>
                <Label htmlFor="zoom" className="text-base font-semibold">Screen Zoom ({settings.zoom}%)</Label>
                <Input
                  id="zoom"
                  type="range"
                  min="75"
                  max="150"
                  step="25"
                  value={settings.zoom}
                  onChange={(e) => setSettings({ ...settings, zoom: parseInt(e.target.value) })}
                  className="mt-3"
                  data-testid="input-zoom"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bgColor" className="text-base font-semibold">Background Color</Label>
                  <Input
                    id="bgColor"
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className="h-14 mt-2 cursor-pointer"
                    data-testid="input-bg-color"
                  />
                </div>

                <div>
                  <Label htmlFor="taskbarColor" className="text-base font-semibold">Taskbar Color</Label>
                  <Input
                    id="taskbarColor"
                    type="color"
                    value={settings.taskbarColor}
                    onChange={(e) => setSettings({ ...settings, taskbarColor: e.target.value })}
                    className="h-14 mt-2 cursor-pointer"
                    data-testid="input-taskbar-color"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bgImage" className="text-base font-semibold">Background Image</Label>
                <Input
                  id="bgImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-2 h-12 rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl"
                  data-testid="input-bg-image"
                />
                <div className="flex gap-2 mt-3">
                  {settings.backgroundImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({ ...settings, backgroundImage: undefined })}
                      className="rounded-xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                      data-testid="button-remove-bg-image"
                    >
                      Remove Image
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings({ 
                      ...settings, 
                      backgroundImage: undefined,
                      backgroundColor: settings.themeMode === 'dark' ? '#1a1a2e' : '#f0f4f8'
                    })}
                    className="rounded-xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                    data-testid="button-reset-wallpaper"
                  >
                    Reset to Original
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <Label htmlFor="roundedCorners" className="text-base font-semibold cursor-pointer">Rounded Corners</Label>
                <Switch
                  id="roundedCorners"
                  checked={settings.roundedCorners}
                  onCheckedChange={(checked) => setSettings({ ...settings, roundedCorners: checked })}
                  data-testid="switch-rounded-corners"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <div>
                  <Label htmlFor="soundEffects" className="text-base font-semibold cursor-pointer">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground mt-1">Play sounds on clicks and hovers</p>
                </div>
                <Switch
                  id="soundEffects"
                  checked={settings.soundEffectsEnabled}
                  onCheckedChange={(checked) => {
                    setSettings({ ...settings, soundEffectsEnabled: checked });
                    setGlobalVolume(checked ? 1.0 : 0);
                  }}
                  data-testid="switch-sound-effects"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base font-semibold">Change Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-2 h-12 rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl"
                  data-testid="input-password"
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-6 backdrop-blur-3xl rounded-3xl p-8 border animate-fade-in"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
              animationDelay: '0.1s'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Security Settings</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10"
              style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
            >
              <div className="space-y-1">
                <Label htmlFor="pinEnabled" className="text-base font-semibold cursor-pointer">Enable PIN Login</Label>
                <p className="text-xs text-muted-foreground">
                  Use a PIN instead of password for quick login
                </p>
              </div>
              <Switch
                id="pinEnabled"
                checked={settings.pinEnabled}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, pinEnabled: checked });
                  if (!checked) {
                    setPin('');
                  }
                }}
                data-testid="switch-pin-enabled"
              />
            </div>

            {settings.pinEnabled && (
              <>
                <div>
                  <Label htmlFor="pinLength" className="text-base font-semibold mb-3 block">PIN Length</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={settings.pinLength === 4 ? 'default' : 'outline'}
                      onClick={() => {
                        setSettings({ ...settings, pinLength: 4 });
                        setPin('');
                      }}
                      className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:scale-105 transition-all duration-200"
                      data-testid="button-pin-length-4"
                    >
                      4 Digits
                    </Button>
                    <Button
                      type="button"
                      variant={settings.pinLength === 6 ? 'default' : 'outline'}
                      onClick={() => {
                        setSettings({ ...settings, pinLength: 6 });
                        setPin('');
                      }}
                      className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:scale-105 transition-all duration-200"
                      data-testid="button-pin-length-6"
                    >
                      6 Digits
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pin" className="text-base font-semibold">Set PIN ({settings.pinLength} digits)</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={settings.pinLength}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPin(value);
                    }}
                    placeholder={`Enter ${settings.pinLength}-digit PIN`}
                    className="mt-2 h-14 text-center text-2xl tracking-widest rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl"
                    data-testid="input-pin"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {settings.pinLength !== userData.user.settings.pinLength
                      ? `Required: You changed the PIN length to ${settings.pinLength} digits`
                      : userData.user.settings.pin 
                      ? 'Leave empty to keep current PIN' 
                      : 'Required when enabling PIN login for the first time'}
                  </p>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Cloaking Tab */}
        <TabsContent value="cloaking" className="space-y-6">
          <div className="backdrop-blur-3xl rounded-3xl p-8 border animate-fade-in"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Tab Disguise</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Tab Disguise changes this browser tab's title and favicon to match a selected website, helping it blend into your workspace. Select a disguise below and click Apply.
            </p>

            <Button
              onClick={applyDisguise}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-500/90 hover:via-indigo-500/90 hover:to-blue-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              data-testid="button-apply-disguise"
            >
              Apply Disguise
              <Eye className="h-4 w-4 ml-2" />
            </Button>

            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-2">Tab Appearance</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which familiar site look the tab should mimic while About:Blank is active.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="disguiseSelect" className="text-base font-semibold mb-3 block">Select a disguise</Label>
                  <Select value={selectedDisguise} onValueChange={setSelectedDisguise}>
                    <SelectTrigger className="h-12 rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl" data-testid="select-disguise">
                      <SelectValue placeholder="Select a disguise" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISGUISES.map((d) => (
                        <SelectItem key={d.value} value={d.value} data-testid={`option-disguise-${d.value}`}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-2xl border border-white/10"
                  style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
                >
                  <h5 className="font-bold text-primary mb-1">{disguise.title}</h5>
                  <p className="text-sm text-muted-foreground">{disguise.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-3xl rounded-3xl p-8 border animate-fade-in"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">About:Blank Mode</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Click the button below to open the app in a new tab with the URL showing "about:blank" instead of the actual website address. This helps hide what you're browsing from anyone who might see your browser tabs. Everything will continue to work normally.
            </p>

            <div className="p-6 rounded-2xl border border-white/10 space-y-4"
              style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="disguise-blank" className="text-sm font-medium">Apply Disguise to About:Blank Tab</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make the about:blank tab itself use your selected disguise
                  </p>
                </div>
                <Switch
                  id="disguise-blank"
                  checked={applyDisguiseToBlank}
                  onCheckedChange={setApplyDisguiseToBlank}
                  data-testid="switch-disguise-blank"
                />
              </div>

              <Button
                onClick={() => {
                  const disguise = applyDisguiseToBlank && selectedDisguise !== 'none'
                    ? DISGUISES.find(d => d.value === selectedDisguise)
                    : undefined;
                  
                  openInAboutBlank(disguise ? {
                    title: disguise.title,
                    favicon: disguise.favicon
                  } : undefined);
                }}
                className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-700 hover:from-purple-600 hover:via-indigo-700 hover:to-blue-800"
                data-testid="button-open-about-blank"
              >
                <Eye className="h-5 w-5 mr-2" />
                Open in About:Blank Tab
              </Button>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
              <p className="text-sm text-yellow-200">
                <strong>Note:</strong> This will open a new tab with "about:blank" as the URL. The app will work normally inside this tab. You can close the original tab if you want.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-6">
          <div className="backdrop-blur-3xl rounded-3xl p-8 border animate-fade-in"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Legal</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Policies and links related to privacy and cookies for this project.
            </p>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <h4 className="text-lg font-bold mb-2">Privacy Policy</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Read the project's Privacy Policy to learn what data is collected, how it is used, and your rights regarding personal information.
                </p>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                  onClick={() => window.open('https://docs.google.com/document/d/1ZihQ_dz2vcGVRJ60QBOur6GYmyQwatzuu7nJ4FjO-fk/edit?tab=t.0', '_blank')}
                  data-testid="button-privacy-policy"
                >
                  Open Privacy Policy
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <h4 className="text-lg font-bold mb-2">Cookie Policy</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  View the Rules Policy to understand what Rules are used, why they are used, and how you can follow rules preferences.
                </p>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                  onClick={() => window.open('https://docs.google.com/document/d/1ZihQ_dz2vcGVRJ60QBOur6GYmyQwatzuu7nJ4FjO-fk/edit?tab=t.0', '_blank')}
                  data-testid="button-cookie-policy"
                >
                  Open Cookie Policy
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Misc Tab */}
        <TabsContent value="misc" className="space-y-6">
          <div className="backdrop-blur-3xl rounded-3xl p-8 border animate-fade-in"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Misc</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Utility links and tools related to this project.
            </p>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <h4 className="text-lg font-bold mb-2">Data Management</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Export and import data to preserve progress across devices.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                    onClick={exportData}
                    data-testid="button-export-data"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                    onClick={importData}
                    data-testid="button-import-data"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <h4 className="text-lg font-bold mb-2">Uptime Status</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Open the project's Orignal Credits page to view ownership, incidents, and coding links.
                </p>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                  onClick={() => window.open('https://docs.google.com/document/d/1_FmH3BlSBQI7FGgAQL59-ZPe8eCxs35wel6JUyVaG8Q/edit?tab=t.0', '_blank')}
                  data-testid="button-uptime"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Uptime
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
              >
                <h4 className="text-lg font-bold mb-2">Discord Community</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Join the community on Discord for updates, support, and discussion with other users and contributors.
                </p>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
                  onClick={() => window.open('https://discord.gg/TsVxU6HsTk', '_blank')}
                  data-testid="button-discord"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Discord
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleSave} 
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-500/90 hover:via-blue-500/90 hover:to-indigo-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-base font-semibold"
        data-testid="button-save-settings"
      >
        <Save className="h-5 w-5 mr-2" />
        Save Settings
      </Button>
    </div>
  );
};
