import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c];
  });
}

function formatLang(raw: string): string {
  if (!raw) return 'Code';
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function renderReplyWithCode(text: string): string {
  const re = /```(\w+)?\n([\s\S]*?)```/g;
  let html = '';
  let last = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    const preText = text.slice(last, m.index).trim();
    if (preText) html += `<div class="bot-chunk">${escapeHtml(preText)}</div>`;

    const langRaw = m[1] || '';
    const langLabel = formatLang(langRaw);
    const code = m[2];

    html += `
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">${escapeHtml(langLabel)}</span>
          <button class="copy-btn" data-code="${escapeHtml(code)}" title="Copy">
            Copy
          </button>
        </div>
        <pre><code class="language-${escapeHtml(langRaw)}">${escapeHtml(code)}</code></pre>
      </div>
    `;
    last = re.lastIndex;
  }

  const postText = text.slice(last).trim();
  if (postText) html += `<div class="bot-chunk">${escapeHtml(postText)}</div>`;

  return html;
}

export const AIApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [introText, setIntroText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const INTRO_TEXT = 'What can I help you with?';

  useEffect(() => {
    if (messages.length > 0) return;

    let pos = 0;
    let deleting = false;
    let timer: NodeJS.Timeout;

    const step = () => {
      if (!deleting) {
        pos++;
        setIntroText(INTRO_TEXT.slice(0, pos));
        if (pos >= INTRO_TEXT.length) {
          deleting = true;
          timer = setTimeout(step, 900);
          return;
        }
      } else {
        pos--;
        setIntroText(INTRO_TEXT.slice(0, pos));
        if (pos <= 0) {
          deleting = false;
          timer = setTimeout(step, 500);
          return;
        }
      }
      timer = setTimeout(step, deleting ? 40 : 80);
    };

    timer = setTimeout(step, 500);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => {
      hljs.highlightAll();
    }, 100);
  }, [messages]);

  const handleCopyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('copy-btn')) {
      const code = target.getAttribute('data-code') || '';
      if (code) {
        navigator.clipboard.writeText(code).catch(() => {});
        const oldText = target.textContent;
        target.textContent = '✅ Copied';
        setTimeout(() => {
          target.textContent = oldText;
        }, 1500);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {

      const response = await fetch('https://nexora-learning-logs55.fly.dev/chat', {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'user', content: userInput }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'No response received';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      console.error('AI Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: typeof error,
      });
      
      let errorMessage = 'I apologize, but I encountered an error while processing your request. ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'The request took too long and timed out (30 seconds). The AI service might be slow or unavailable. Please try again.';
        toast.error('Request timeout. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Unable to connect to the AI service. This could be due to: network connectivity issues, firewall restrictions, or the AI service being temporarily unavailable. Please check your internet connection and try again.';
        toast.error('Connection failed. Check console for details.');
      } else {
        errorMessage += `${error.message}. Please try again.`;
        toast.error(`AI Error: ${error.message}`);
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
      <div
        className="relative overflow-hidden border-b backdrop-blur-3xl"
        style={{
          backgroundColor: 'rgba(30, 30, 50, 0.8)',
          borderColor: 'rgba(255,255,255,0.15)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Delta Chat
              </h2>
              <p className="text-xs text-muted-foreground">Powered by Llama 3.3 70B</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-6 animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent blur-3xl" />
                <Bot className="h-24 w-24 relative z-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2 min-h-[2.5rem]">
                  {introText}
                </h1>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 animate-fade-in-up ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={`max-w-[75%] ${
                  msg.role === 'user'
                    ? 'p-5 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border border-primary/50 backdrop-blur-3xl shadow-lg'
                    : ''
                }`}
                onClick={handleCopyClick}
              >
                {msg.role === 'assistant' && (
                  <div className="mb-2 text-sm font-semibold text-primary">Llama 3.3 70B</div>
                )}
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div
                    className="chatbot-message"
                    dangerouslySetInnerHTML={{ __html: renderReplyWithCode(msg.content) }}
                  />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div
                className="p-5 rounded-3xl backdrop-blur-3xl border border-white/15 shadow-lg"
                style={{
                  backgroundColor: 'rgba(30, 30, 50, 0.6)',
                }}
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div
        className="p-6 border-t backdrop-blur-3xl"
        style={{
          backgroundColor: 'rgba(20, 20, 35, 0.8)',
          borderColor: 'rgba(255,255,255,0.15)',
        }}
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Message AI..."
            disabled={isLoading}
            className="flex-1 h-14 rounded-2xl border-white/15 bg-white/5 backdrop-blur-xl focus-visible:ring-primary focus-visible:ring-2 text-base px-6"
            data-testid="input-ai-message"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            data-testid="button-send-ai-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <style>{`
        .chatbot-message .bot-chunk {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: hsl(var(--foreground));
        }

        .chatbot-message .code-block {
          margin: 1rem 0;
          border-radius: 1rem;
          overflow: hidden;
          background: rgba(30, 30, 50, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chatbot-message .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(20, 20, 35, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chatbot-message .code-lang {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--primary));
        }

        .chatbot-message .copy-btn {
          background: hsl(var(--primary));
          color: white;
          border: none;
          padding: 0.375rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .chatbot-message .copy-btn:hover {
          background: hsl(var(--primary) / 0.8);
          transform: scale(1.05);
        }

        .chatbot-message pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          background: transparent;
        }

        .chatbot-message code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .chatbot-message pre code {
          background: transparent;
          padding: 0;
          border: none;
        }
      `}</style>
    </div>
  );
};
