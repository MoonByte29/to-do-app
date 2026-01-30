import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Filter, Bell } from 'lucide-react';
import TaskCard from './TaskCard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BoardView = ({ user, onLogout }) => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    reminderDate: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    fetchBoard();
    fetchTasks();
    requestNotificationPermission();
  }, [boardId]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filterStatus, filterPriority]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const fetchBoard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/boards/${boardId}`);
      setBoard(response.data.board);
    } catch (error) {
      toast.error('Failed to load board');
      navigate('/dashboard');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/board/${boardId}`);
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load tasks');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        boardId,
        tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        dueDate: newTask.dueDate || null,
        reminderDate: newTask.reminderDate || null
      };

      const response = await axios.post(`${API_URL}/api/tasks`, taskData);
      setTasks([response.data.task, ...tasks]);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', reminderDate: '', tags: '', notes: '' });
      setIsCreateOpen(false);
      toast.success('Task created successfully');

      if (taskData.reminderDate) {
        scheduleNotification(response.data.task);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${taskId}`, updates);
      setTasks(tasks.map(t => t.id === taskId ? response.data.task : t));
      toast.success('Task updated successfully');

      if (updates.reminderDate) {
        scheduleNotification(response.data.task);
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const scheduleNotification = (task) => {
    if ('Notification' in window && Notification.permission === 'granted' && task.reminderDate) {
      const reminderTime = new Date(task.reminderDate).getTime();
      const now = Date.now();
      const timeUntilReminder = reminderTime - now;

      if (timeUntilReminder > 0) {
        setTimeout(() => {
          new Notification('TaskFlow Reminder', {
            body: `Task: ${task.title}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }, timeUntilReminder);
      }
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                data-testid="back-to-dashboard"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">{board.title}</h1>
                {board.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{board.description}</p>
                )}
              </div>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm active:scale-95" data-testid="create-task-button">
              <Plus size={18} className="mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40" data-testid="filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40" data-testid="filter-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {overdueTasks.length > 0 && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-sm font-medium" data-testid="overdue-indicator">
              <Bell size={16} />
              {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-tasks-state">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Plus size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6">Create your first task to get started</p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="empty-create-task-button">
              <Plus size={18} className="mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingTasks.length > 0 && (
              <div data-testid="pending-tasks-section">
                <h2 className="text-xl font-semibold font-heading text-foreground mb-4">Pending ({pendingTasks.length})</h2>
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      isOverdue={isOverdue(task.dueDate)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div data-testid="completed-tasks-section">
                <h2 className="text-xl font-semibold font-heading text-foreground mb-4">Completed ({completedTasks.length})</h2>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      isOverdue={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-task-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                required
                className="mt-1"
                data-testid="task-title-input"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add more details about this task"
                className="mt-1"
                rows={3}
                data-testid="task-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger className="mt-1" data-testid="task-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1"
                  data-testid="task-due-date-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="task-reminder">Reminder Date & Time</Label>
              <Input
                id="task-reminder"
                type="datetime-local"
                value={newTask.reminderDate}
                onChange={(e) => setNewTask({ ...newTask, reminderDate: e.target.value })}
                className="mt-1"
                data-testid="task-reminder-input"
              />
              <p className="text-xs text-muted-foreground mt-1">You'll receive browser and email notifications</p>
            </div>
            <div>
              <Label htmlFor="task-tags">Tags (comma-separated)</Label>
              <Input
                id="task-tags"
                value={newTask.tags}
                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                placeholder="e.g., urgent, client, review"
                className="mt-1"
                data-testid="task-tags-input"
              />
            </div>
            <div>
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea
                id="task-notes"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Additional notes or reminders"
                className="mt-1"
                rows={2}
                data-testid="task-notes-input"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="submit-task-button">
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardView;