import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox, Send, Star, Trash2, Archive, PenSquare, Reply, Forward, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Email {
  id: number;
  from: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  starred: boolean;
  read: boolean;
}

const STORAGE_KEY = 'deltaos_emails';
const USER_EMAIL = 'me@deltaos.local';

const getInitialEmails = (): Email[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  // Initial welcome emails
  return [
    {
      id: Date.now(),
      from: 'team@deltaos.com',
      subject: 'Welcome to Delta OS Email!',
      preview: 'This is a fully functional email client that stores your emails locally...',
      body: 'Welcome to Delta OS Email! This is a real, functional email client that stores all your emails in your browser\'s local storage. All emails you compose and send are saved persistently. Try composing a new email to yourself!',
      date: new Date().toLocaleString(),
      starred: true,
      read: false,
    },
  ];
};

export const EmailApp = () => {
  const [emails, setEmails] = useState<Email[]>(getInitialEmails);

  // Persist emails to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  }, [emails]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [view, setView] = useState<'inbox' | 'compose'>('inbox');
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStar = (id: number) => {
    setEmails(emails.map(email =>
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };

  const deleteEmail = (id: number) => {
    setEmails(emails.filter(email => email.id !== id));
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
  };

  const markAsRead = (id: number) => {
    setEmails(emails.map(email =>
      email.id === id ? { ...email, read: true } : email
    ));
  };

  const handleCompose = () => {
    setView('compose');
    setSelectedEmail(null);
  };

  const handleSend = () => {
    if (!composeData.body.trim()) {
      toast.error('Email body cannot be empty');
      return;
    }

    const newEmail: Email = {
      id: Date.now(),
      from: USER_EMAIL,
      subject: composeData.subject.trim() || '(No Subject)',
      preview: composeData.body.substring(0, 50) + (composeData.body.length > 50 ? '...' : ''),
      body: composeData.body,
      date: new Date().toLocaleString(),
      starred: false,
      read: true,
    };
    
    setEmails([newEmail, ...emails]);
    setComposeData({ to: '', subject: '', body: '' });
    setView('inbox');
    toast.success('Email sent and saved to inbox!');
  };

  const filteredEmails = emails.filter(email =>
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter(e => !e.read).length;

  return (
    <div className="h-full flex bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg"
            onClick={handleCompose}
            data-testid="button-compose"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={view === 'inbox' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setView('inbox')}
              data-testid="button-inbox"
            >
              <Inbox className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-starred">
              <Star className="h-4 w-4 mr-3" />
              Starred
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-sent">
              <Send className="h-4 w-4 mr-3" />
              Sent
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-archive">
              <Archive className="h-4 w-4 mr-3" />
              Archive
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-trash">
              <Trash2 className="h-4 w-4 mr-3" />
              Trash
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {view === 'inbox' ? (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b bg-card/30 backdrop-blur-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Email List */}
              <div className="w-96 border-r">
                <ScrollArea className="h-full">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedEmail?.id === email.id ? 'bg-accent' : ''
                      } ${!email.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      onClick={() => {
                        setSelectedEmail(email);
                        markAsRead(email.id);
                      }}
                      data-testid={`email-item-${email.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(email.id);
                          }}
                          data-testid={`button-star-${email.id}`}
                        >
                          <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold ${!email.read ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                              {email.from}
                            </span>
                            <span className="text-xs text-muted-foreground">{email.date}</span>
                          </div>
                          <div className={`text-sm truncate ${!email.read ? 'font-semibold' : ''}`}>
                            {email.subject}
                          </div>
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {email.preview}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              {/* Email View */}
              <div className="flex-1">
                {selectedEmail ? (
                  <div className="h-full flex flex-col">
                    <div className="p-6 border-b bg-card/30 backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" data-testid="button-reply">
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid="button-forward">
                            <Forward className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEmail(selectedEmail.id)}
                            data-testid="button-delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {selectedEmail.from.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{selectedEmail.from}</div>
                          <div className="text-sm text-muted-foreground">{selectedEmail.date}</div>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select an email to read
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Compose View */
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">New Message</h2>
                <Button variant="ghost" onClick={() => setView('inbox')} data-testid="button-cancel-compose">
                  Cancel
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To</label>
                <Input
                  placeholder="recipient@example.com"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  data-testid="input-to"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Email subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  data-testid="input-subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Write your message here..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  className="min-h-[300px] resize-none"
                  data-testid="textarea-body"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  onClick={handleSend}
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <Button variant="outline" data-testid="button-save-draft">
                  Save Draft
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
