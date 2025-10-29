import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
}

export const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('deltaos-calendar-events');
    return saved ? JSON.parse(saved) : [];
  });
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('12:00');

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('deltaos-calendar-events', JSON.stringify(newEvents));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const addEvent = () => {
    if (!selectedDate || !eventTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      date: selectedDate.toISOString().split('T')[0],
      time: eventTime,
    };

    saveEvents([...events, newEvent]);
    setShowEventDialog(false);
    setEventTitle('');
    setEventDescription('');
    setEventTime('12:00');
    toast.success('Event added!');
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
    toast.success('Event deleted');
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full p-6 bg-gradient-to-br from-background via-background to-green-500/5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{monthName}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(-1)}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(1)}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCurrentDate(new Date())}
            data-testid="button-today"
          >
            Today
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-sm p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={day}
              onClick={() => {
                setSelectedDate(date);
                setShowEventDialog(true);
              }}
              className={`aspect-square p-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                isToday
                  ? 'bg-primary/20 border-primary'
                  : 'bg-muted/40 border-border/50 hover:bg-muted/60'
              }`}
              data-testid={`calendar-day-${day}`}
            >
              <div className="font-semibold text-sm">{day}</div>
              {dateEvents.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dateEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs truncate bg-primary/30 rounded px-1"
                      data-testid={`event-${event.id}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dateEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dateEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && getEventsForDate(selectedDate).length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-muted/40 border border-border/50">
          <h3 className="font-semibold mb-3">
            Events for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className="flex items-start justify-between p-3 rounded-lg bg-background/50"
              >
                <div className="flex-1">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-muted-foreground">{event.time}</div>
                  {event.description && (
                    <div className="text-sm mt-1">{event.description}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteEvent(event.id)}
                  data-testid={`button-delete-event-${event.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event - {selectedDate?.toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Event Title</label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Meeting, Birthday, etc."
                data-testid="input-event-title"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Time</label>
              <Input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                data-testid="input-event-time"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Description (Optional)</label>
              <Textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Additional details..."
                data-testid="textarea-event-description"
              />
            </div>
            <Button
              onClick={addEvent}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
              data-testid="button-add-event"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
