import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Save, Download, RefreshCw, Sparkles } from 'lucide-react';
import { OSData, StoredFile } from '@/types/deltaos';
import { toast } from 'sonner';

interface CameraAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

export const CameraApp = ({ userData, onUpdateUserData }: CameraAppProps) => {
  const [image, setImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        toast.success('Camera started!');
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please connect a camera and try again.');
      } else {
        toast.error('Failed to access camera. Please check your permissions.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setImage(canvas.toDataURL('image/png'));
        stopCamera();
        toast.success('Photo captured!');
      }
    }
  };

  const saveToFiles = () => {
    if (!image) return;

    const newFile: StoredFile = {
      id: `photo-${Date.now()}`,
      name: `Photo_${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      type: 'image',
      data: image,
      createdAt: new Date().toISOString(),
      folder: 'Pictures',
    };

    const updatedData = {
      ...userData,
      files: [...(userData.files || []), newFile],
    };

    onUpdateUserData(updatedData);
    toast.success('Photo saved to Pictures folder!');
    setImage(null);
  };

  const downloadImage = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image;
    a.download = `photo-${Date.now()}.png`;
    a.click();
    toast.success('Photo downloaded!');
  };

  return (
    <div className="p-8 space-y-6 h-full flex flex-col bg-gradient-to-br from-background via-background to-pink-500/5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center shadow-lg">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">Camera</h2>
          <p className="text-xs text-muted-foreground">Capture moments instantly</p>
        </div>
      </div>
      
      {!isStreaming && !image && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-rose-500/30 to-red-500/30 blur-3xl" />
              <div className="relative bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-red-500/20 backdrop-blur-3xl rounded-3xl p-12 border border-white/15 shadow-2xl">
                <Camera className="h-24 w-24 text-pink-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to capture</h3>
              <p className="text-muted-foreground mb-6">Start your camera to take photos</p>
              <Button 
                onClick={startCamera} 
                size="lg"
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-500/90 hover:via-rose-500/90 hover:to-red-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                data-testid="button-start-camera"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </Button>
            </div>
          </div>
        </div>
      )}

      {isStreaming && (
        <div className="space-y-4 flex-1 flex flex-col animate-fade-in">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="flex-1 w-full rounded-3xl bg-black border-2 border-white/15 shadow-2xl"
          />
          <div className="flex gap-3">
            <Button 
              onClick={captureImage} 
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-500/90 hover:via-rose-500/90 hover:to-red-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              data-testid="button-capture-photo"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Capture Photo
            </Button>
            <Button 
              onClick={stopCamera} 
              variant="outline"
              className="h-14 px-6 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
              data-testid="button-stop-camera"
            >
              Stop
            </Button>
          </div>
        </div>
      )}

      {image && (
        <div className="space-y-4 flex-1 flex flex-col animate-fade-in">
          <div className="flex-1 relative rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl">
            <img 
              src={image} 
              alt="Captured" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button 
              onClick={saveToFiles} 
              className="h-14 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-500/90 hover:via-emerald-500/90 hover:to-teal-500/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              data-testid="button-save-photo"
            >
              <Save className="h-5 w-5 mr-2" />
              Save
            </Button>
            <Button 
              onClick={downloadImage} 
              variant="outline"
              className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
              data-testid="button-download-photo"
            >
              <Download className="h-5 w-5 mr-2" />
              Download
            </Button>
            <Button 
              onClick={() => setImage(null)} 
              variant="outline"
              className="h-14 rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10"
              data-testid="button-retake-photo"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Retake
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
