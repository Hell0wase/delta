import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, FileText, Play, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

const sampleFiles: CodeFile[] = [
  {
    id: '1',
    name: 'welcome.js',
    language: 'javascript',
    content: `// Welcome to Delta Code Editor!
// This is a simple JavaScript example

function greet(name) {
  console.log(\`Hello, \${name}! Welcome to Delta OS.\`);
}

greet('Developer');

// Try editing this code or create a new file
const features = ['Syntax Highlighting', 'Multiple Tabs', 'File Management'];
features.forEach(feature => console.log(\`✓ \${feature}\`));`,
  },
  {
    id: '2',
    name: 'example.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delta OS Web Page</title>
</head>
<body>
    <h1>Welcome to Delta OS</h1>
    <p>Build amazing applications with our code editor!</p>
</body>
</html>`,
  },
];

export const CodeEditorApp = () => {
  const [files, setFiles] = useState<CodeFile[]>(sampleFiles);
  const [activeFileId, setActiveFileId] = useState(sampleFiles[0].id);
  const [fontSize, setFontSize] = useState('14');

  const activeFile = files.find(f => f.id === activeFileId);

  const handleContentChange = (content: string) => {
    setFiles(files.map(f =>
      f.id === activeFileId ? { ...f, content } : f
    ));
  };

  const handleSave = () => {
    toast.success('File saved successfully!');
  };

  const handleNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: 'untitled.txt',
      language: 'plaintext',
      content: '',
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const handleRun = () => {
    if (!activeFile) return;
    if (activeFile.language === 'javascript') {
      toast.info('Code execution is disabled for security reasons. Use the Browser DevTools console to test JavaScript code.');
    } else {
      toast.info('Run is only supported for JavaScript files');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewFile}
            data-testid="button-new-file"
          >
            <FileText className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            data-testid="button-download"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-300"
            onClick={handleRun}
            data-testid="button-run"
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={activeFile?.language} onValueChange={(lang) => {
            if (activeFile) {
              setFiles(files.map(f =>
                f.id === activeFileId ? { ...f, language: lang } : f
              ));
            }
          }}>
            <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="javascript" className="text-gray-100" data-testid="select-item-javascript">JavaScript</SelectItem>
              <SelectItem value="html" className="text-gray-100" data-testid="select-item-html">HTML</SelectItem>
              <SelectItem value="css" className="text-gray-100" data-testid="select-item-css">CSS</SelectItem>
              <SelectItem value="python" className="text-gray-100" data-testid="select-item-python">Python</SelectItem>
              <SelectItem value="plaintext" className="text-gray-100" data-testid="select-item-plaintext">Plain Text</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="w-24 h-8 bg-gray-800 border-gray-700" data-testid="select-font-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="12" className="text-gray-100" data-testid="select-item-12">12px</SelectItem>
              <SelectItem value="14" className="text-gray-100" data-testid="select-item-14">14px</SelectItem>
              <SelectItem value="16" className="text-gray-100" data-testid="select-item-16">16px</SelectItem>
              <SelectItem value="18" className="text-gray-100" data-testid="select-item-18">18px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* File Tabs */}
      <Tabs value={activeFileId} onValueChange={setActiveFileId} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-gray-800 bg-gray-900/30 h-auto p-0">
          {files.map((file) => (
            <TabsTrigger
              key={file.id}
              value={file.id}
              className="rounded-none border-r border-gray-800 data-[state=active]:bg-gray-900 data-[state=active]:text-blue-400 px-4 py-2"
              data-testid={`tab-${file.id}`}
            >
              {file.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {files.map((file) => (
          <TabsContent
            key={file.id}
            value={file.id}
            className="flex-1 m-0 data-[state=active]:flex data-[state=active]:flex-col"
          >
            <textarea
              value={file.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 w-full p-4 bg-gray-950 text-gray-100 font-mono outline-none resize-none"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
              spellCheck={false}
              data-testid={`editor-${file.id}`}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs border-t border-gray-800 bg-gray-900/50 text-gray-400">
        <div className="flex items-center gap-4">
          <span>Line: 1, Col: 1</span>
          <span>Length: {activeFile?.content.length || 0} chars</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{activeFile?.language.toUpperCase()}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
