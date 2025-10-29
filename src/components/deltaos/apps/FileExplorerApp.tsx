import { useState } from 'react';
import { OSData, StoredFile } from '@/types/deltaos';
import { Folder, File, ArrowLeft, Image, Download, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileExplorerAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

type FolderType = 'Pictures' | 'Documents' | 'Downloads' | null;

export const FileExplorerApp = ({ userData, onUpdateUserData }: FileExplorerAppProps) => {
  const [currentFolder, setCurrentFolder] = useState<FolderType>(null);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);

  const files = userData.files || [];
  
  const folderCounts = {
    Pictures: files.filter(f => f.folder === 'Pictures').length,
    Documents: files.filter(f => f.folder === 'Documents').length,
    Downloads: files.filter(f => f.folder === 'Downloads').length,
  };

  const currentFiles = currentFolder 
    ? files.filter(f => f.folder === currentFolder)
    : [];

  const deleteFile = (fileId: string) => {
    const updatedData = {
      ...userData,
      files: files.filter(f => f.id !== fileId),
    };
    onUpdateUserData(updatedData);
    setSelectedFile(null);
    toast.success('File deleted');
  };

  const downloadFile = (file: StoredFile) => {
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.name;
    a.click();
    toast.success('File downloaded!');
  };

  const folderData = [
    { name: 'Documents', count: folderCounts.Documents, color: 'from-blue-500 via-blue-600 to-blue-700', icon: Folder },
    { name: 'Downloads', count: folderCounts.Downloads, color: 'from-green-500 via-emerald-600 to-teal-700', icon: Folder },
    { name: 'Pictures', count: folderCounts.Pictures, color: 'from-purple-500 via-pink-600 to-rose-700', icon: Folder },
  ];

  if (selectedFile) {
    return (
      <div className="p-8 h-full flex flex-col bg-gradient-to-br from-background via-background to-purple-500/5">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedFile(null)}
            className="rounded-2xl hover:scale-105 transition-all duration-200"
            data-testid="button-back-from-file"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {currentFolder}
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => downloadFile(selectedFile)}
              className="rounded-2xl border-white/15 backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all duration-200"
              data-testid="button-download-file"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteFile(selectedFile.id)}
              className="rounded-2xl hover:scale-105 transition-all duration-200"
              data-testid="button-delete-file"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center backdrop-blur-3xl rounded-3xl border border-white/15 p-8"
          style={{ backgroundColor: 'rgba(30, 30, 50, 0.6)' }}
        >
          <h3 className="text-xl font-bold mb-2">{selectedFile.name}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Created: {new Date(selectedFile.createdAt).toLocaleString()}
          </p>
          {selectedFile.type === 'image' && (
            <div className="max-w-full max-h-[70vh] rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl">
              <img 
                src={selectedFile.data} 
                alt={selectedFile.name} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentFolder) {
    return (
      <div className="p-8 h-full flex flex-col bg-gradient-to-br from-background via-background to-purple-500/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentFolder(null)}
              className="rounded-2xl hover:scale-105 transition-all duration-200"
              data-testid="button-back-to-folders"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 flex items-center justify-center shadow-lg">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentFolder}</h2>
                <p className="text-xs text-muted-foreground">
                  {currentFiles.length} {currentFiles.length === 1 ? 'file' : 'files'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {currentFiles.length === 0 ? (
            <div className="text-center py-20 space-y-6 animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-rose-500/30 blur-3xl" />
                <div className="relative bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 backdrop-blur-3xl rounded-3xl p-12 border border-white/15 shadow-2xl">
                  <Folder className="h-24 w-24 text-purple-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Empty Folder</h3>
                <p className="text-muted-foreground">This folder doesn't have any files yet</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentFiles.map((file, index) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="p-5 border border-white/15 rounded-3xl backdrop-blur-3xl hover:border-primary/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden animate-fade-in-up"
                  style={{ 
                    backgroundColor: 'rgba(30, 30, 50, 0.4)',
                    animationDelay: `${index * 0.05}s` 
                  }}
                  data-testid={`file-${file.id}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent transition-all duration-300 rounded-3xl" />
                  {file.type === 'image' ? (
                    <div className="relative rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/10">
                      <img 
                        src={file.data} 
                        alt={file.name} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <Image className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 rounded-2xl border border-white/10 mb-3"
                      style={{ backgroundColor: 'rgba(20, 20, 35, 0.4)' }}
                    >
                      <File className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm font-semibold truncate relative z-10">{file.name}</p>
                  <p className="text-xs text-muted-foreground relative z-10">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-8 h-full bg-gradient-to-br from-background via-background to-purple-500/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 flex items-center justify-center shadow-lg">
          <FolderOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">File Explorer</h2>
          <p className="text-xs text-muted-foreground">Browse your files and folders</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {folderData.map((folder, index) => (
          <div 
            key={folder.name}
            className="p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 border backdrop-blur-3xl shadow-lg hover:shadow-2xl group relative overflow-hidden animate-fade-in-up"
            style={{
              backgroundColor: 'rgba(30, 30, 50, 0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
              animationDelay: `${index * 0.1}s`
            }}
            onClick={() => setCurrentFolder(folder.name as FolderType)}
            data-testid={`folder-${folder.name.toLowerCase()}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${folder.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${folder.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <folder.icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{folder.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {folder.count} {folder.count === 1 ? 'file' : 'files'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
