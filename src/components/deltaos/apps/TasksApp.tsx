import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export const TasksApp = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('deltaos-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('deltaos-tasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    toast.success('Task added!');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(task => task.id !== id));
    toast.success('Task deleted');
  };

  const clearCompleted = () => {
    saveTasks(tasks.filter(task => !task.completed));
    toast.success('Completed tasks cleared');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-indigo-500/5">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-muted/20">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <ListTodo className="h-8 w-8" />
          Tasks
        </h1>
        
        {/* Add Task */}
        <div className="flex gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1"
            data-testid="input-new-task"
          />
          <Button
            onClick={addTask}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Active: </span>
            <span className="font-semibold">{stats.active}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Completed: </span>
            <span className="font-semibold">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-4 border-b border-border/50">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
          data-testid="filter-all"
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
          data-testid="filter-active"
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
          data-testid="filter-completed"
        >
          Completed
        </Button>
        {stats.completed > 0 && (
          <Button
            variant="outline"
            onClick={clearCompleted}
            size="sm"
            className="ml-auto"
            data-testid="button-clear-completed"
          >
            Clear Completed
          </Button>
        )}
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 p-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Circle className="h-24 w-24 mb-4 opacity-50" />
            <p>No tasks yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-muted/20 border-border/30'
                    : 'bg-muted/40 border-border/50'
                }`}
                data-testid={`task-item-${task.id}`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  data-testid={`checkbox-task-${task.id}`}
                />
                <div className="flex-1">
                  <div className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {task.completed && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
