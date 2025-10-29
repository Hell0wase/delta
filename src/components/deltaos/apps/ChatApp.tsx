import { useState, useEffect, useRef } from 'react';
import { OSData, ChatMessage } from '@/types/deltaos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Trash2, MessageCircle } from 'lucide-react';

interface ChatAppProps {
  userData: OSData;
  onUpdateUserData: (data: OSData) => void;
}

const CHAT_CHANNEL_NAME = 'deltaos-chat';
const CHAT_STORAGE_KEY = 'deltaos-global-chat';

export const ChatApp = ({ userData, onUpdateUserData }: ChatAppProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const globalChat = localStorage.getItem(CHAT_STORAGE_KEY);
    return globalChat ? JSON.parse(globalChat) : [];
  });
  const [input, setInput] = useState('');
  const channelRef = useRef<BroadcastChannel | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHAT_CHANNEL_NAME);
    
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'NEW_MESSAGE') {
        setMessages(event.data.messages);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channelRef.current?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      user: userData.user.name,
      message: input,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'NEW_MESSAGE',
        messages: updatedMessages,
      });
    }
    
    setInput('');
    toast.success('Note added!');
  };

  const clearChat = () => {
    const updatedMessages = messages.filter(msg => msg.user !== userData.user.name);
    setMessages(updatedMessages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'NEW_MESSAGE',
        messages: updatedMessages,
      });
    }
    toast.success('Your notes cleared!');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-green-500/5">
      {/* Header with Clear Button */}
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Notes sync across your browser tabs
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearChat}
          className="hover:bg-red-500/20 hover:border-red-500"
          data-testid="button-clear-chat"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear My Notes
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-sm text-muted-foreground">Start writing personal notes that sync across your tabs!</p>
            </div>
          )}
          {messages.map((msg, index) => {
            const isOwnMessage = msg.user === userData.user.name;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}
                data-testid={`message-${msg.id}`}
              >
                <div className="flex items-center gap-2 px-1">
                  <span className="font-medium text-xs">{msg.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`inline-block px-4 py-2 rounded-lg max-w-[85%] ${
                  isOwnMessage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a note..."
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button 
            onClick={sendMessage}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
