import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export const TerminalApp = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Delta OS Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands\n' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, { description: string; execute: (args: string[]) => string }> = {
    help: {
      description: 'Show available commands',
      execute: () => {
        return Object.entries(commands)
          .map(([cmd, info]) => `  ${cmd.padEnd(15)} - ${info.description}`)
          .join('\n');
      },
    },
    clear: {
      description: 'Clear the terminal',
      execute: () => {
        setHistory([]);
        return '';
      },
    },
    echo: {
      description: 'Print text to the terminal',
      execute: (args) => args.join(' '),
    },
    date: {
      description: 'Display current date and time',
      execute: () => new Date().toString(),
    },
    whoami: {
      description: 'Display current user',
      execute: () => 'delta-user',
    },
    about: {
      description: 'About Delta OS',
      execute: () => 'Delta OS - A modern web-based operating system\nVersion: 8.0.0.0\nBuilt with React & TypeScript',
    },
    theme: {
      description: 'Display theme info',
      execute: () => 'Current theme: Delta Dark\nCustomize in Settings app',
    },
    neofetch: {
      description: 'Display system information',
      execute: () => {
        return `
        ██████╗ ███████╗██╗  ████████╗ █████╗     ██████╗ ███████╗
        ██╔══██╗██╔════╝██║  ╚══██╔══╝██╔══██╗   ██╔═══██╗██╔════╝
        ██║  ██║█████╗  ██║     ██║   ███████║   ██║   ██║███████╗
        ██║  ██║██╔══╝  ██║     ██║   ██╔══██║   ██║   ██║╚════██║
        ██████╔╝███████╗███████╗██║   ██║  ██║   ╚██████╔╝███████║
        ╚═════╝ ╚══════╝╚══════╝╚═╝   ╚═╝  ╚═╝    ╚═════╝ ╚══════╝

        OS: Delta OS 8.0.0.0
        Browser: ${navigator.userAgent.split(' ').slice(-2).join(' ')}
        Resolution: ${window.innerWidth}x${window.innerHeight}
        Terminal: Delta Terminal v1.0.0
        Theme: Dark Mode`;
      },
    },
    calc: {
      description: 'Simple calculator (e.g., calc 2 + 2)',
      execute: (args) => {
        try {
          const expression = args.join(' ');
          const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
          if (sanitized !== expression) {
            return 'Error: Only numbers and basic operators (+, -, *, /, parentheses) are allowed';
          }
          const result = Function('"use strict"; return (' + sanitized + ')')();
          return `${expression} = ${result}`;
        } catch {
          return 'Error: Invalid expression';
        }
      },
    },
    fortune: {
      description: 'Display a random quote',
      execute: () => {
        const quotes = [
          'The only way to do great work is to love what you do. - Steve Jobs',
          'Innovation distinguishes between a leader and a follower. - Steve Jobs',
          'Code is like humor. When you have to explain it, it\'s bad. - Cory House',
          'First, solve the problem. Then, write the code. - John Johnson',
          'Experience is the name everyone gives to their mistakes. - Oscar Wilde',
          'The best error message is the one that never shows up. - Thomas Fuchs',
          'Simplicity is the soul of efficiency. - Austin Freeman',
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
      },
    },
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory((prev) => [...prev, { type: 'input', content: `$ ${trimmedCmd}` }]);
    setCommandHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    const [command, ...args] = trimmedCmd.split(' ');
    const commandDef = commands[command.toLowerCase()];

    if (command.toLowerCase() === 'clear') {
      setHistory([]);
    } else if (commandDef) {
      const output = commandDef.execute(args);
      if (output) {
        setHistory((prev) => [...prev, { type: 'output', content: output }]);
      }
    } else {
      setHistory((prev) => [
        ...prev,
        { type: 'error', content: `Command not found: ${command}. Type "help" for available commands.` },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-green-400 font-mono">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900">
        <TerminalIcon className="h-4 w-4" />
        <span className="text-sm font-semibold">Delta Terminal</span>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1">
          {history.map((line, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap ${
                line.type === 'input'
                  ? 'text-green-400 font-semibold'
                  : line.type === 'error'
                  ? 'text-red-400'
                  : 'text-gray-300'
              }`}
              data-testid={`terminal-line-${index}`}
            >
              {line.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-semibold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 font-mono"
            placeholder="Type a command..."
            autoFocus
            data-testid="input-terminal"
          />
        </div>
      </form>
    </div>
  );
};
