import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scissors, Save, Download, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { OSData, StoredFile } from '@/types/deltaos';

interface SnippetAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

export const SnippetApp = ({ userData, onUpdateUserData }: SnippetAppProps) => {
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: 'monitor'
        } as any
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setScreenshot(canvas.toDataURL('image/png'));
          
          stream.getTracks().forEach(track => track.stop());
          toast.success('Screenshot captured!');
        }
      };
    } catch (error: any) {
      console.error('Error capturing screenshot:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Screen capture permission denied');
      } else {
        toast.error('Failed to capture screenshot');
      }
    }
  };

  const saveToFiles = () => {
    if (!screenshot) return;

    const newFile: StoredFile = {
      id: `screenshot-${Date.now()}`,
      name: `Screenshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      type: 'image',
      data: screenshot,
      createdAt: new Date().toISOString(),
      folder: 'Pictures',
    };

    const updatedData = {
      ...userData,
      files: [...(userData.files || []), newFile],
    };

    onUpdateUserData(updatedData);
    toast.success('Screenshot saved to Pictures folder!');
    setScreenshot(null);
  };

  const downloadScreenshot = () => {
    if (!screenshot) return;
    
    const a = document.createElement('a');
    a.href = screenshot;
    a.download = `screenshot-${Date.now()}.png`;
    a.click();
    toast.success('Screenshot downloaded!');
  };

  return (
    <div className="p-8 space-y-6 h-full flex flex-col bg-gradient-to-br from-background via-background to-orange-500/5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 flex items-center justify-center shadow-lg">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Snippet Tool</h2>
          <p className="text-xs text-muted-foreground">Capture screenshots instantly</p>
        </div>
      </div>

      {!screenshot ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-amber-500/30 to-yellow-500/30 blur-3xl" />
              <div className="relative bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20 backdrop-blur-3xl rounded-3xl p-12 border border-white/15 shadow-2xl">
                <Scissors className="h-24 w-24 text-orange-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to capture</h3>
              <p className="text-muted-foreground mb-6">Capture your screen with one click</p>
              <Button 
                onClick={captureScreenshot} 
                size="lg"
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-500/90 hover:via-amber-500/90 hover:to-yellow-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                data-testid="button-capture-screenshot"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Capture Screenshot
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col animate-fade-in">
          <div className="flex-1 relative rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl">
            <img 
              src={screenshot} 
              alt="Screenshot" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button 
              onClick={saveToFiles} 
              className="h-14 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-500/90 hover:via-emerald-500/90 hover:to-teal-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              data-testid="button-save-screenshot"
            >
              <Save className="h-5 w-5 mr-2" />
              Save
            </Button>
            <Button 
              onClick={downloadScreenshot} 
              variant="outline"
              className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
              data-testid="button-download-screenshot"
            >
              <Download className="h-5 w-5 mr-2" />
              Download
            </Button>
            <Button 
              onClick={() => setScreenshot(null)} 
              variant="outline"
              className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
              data-testid="button-clear-screenshot"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
