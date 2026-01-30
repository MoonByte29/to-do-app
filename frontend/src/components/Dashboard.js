import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Plus, LayoutGrid, LogOut, Clock, CheckCircle2, Circle } from 'lucide-react';
import BoardCard from './BoardCard';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = ({ user, onLogout }) => {
  const [boards, setBoards] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '', color: '#7694b8' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
    fetchUpcomingTasks();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/boards`);
      setBoards(response.data.boards);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load boards');
      setLoading(false);
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/upcoming`);
      setUpcomingTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to load upcoming tasks');
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/boards`, newBoard);
      setBoards([response.data.board, ...boards]);
      setNewBoard({ title: '', description: '', color: '#7694b8' });
      setIsCreateOpen(false);
      toast.success('Board created successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create board');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      await axios.delete(`${API_URL}/api/boards/${boardId}`);
      setBoards(boards.filter(b => b.id !== boardId));
      toast.success('Board deleted successfully');
    } catch (error) {
      toast.error('Failed to delete board');
    }
  };

  const predefinedColors = ['#7694b8', '#53769d', '#2e4057', '#a6b9d2', '#405e82', '#344c69'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-brand-600" size={28} strokeWidth={1.5} />
            <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="hover:bg-accent transition-colors"
              data-testid="logout-button"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold font-heading tracking-tight text-foreground">My Boards</h2>
              <p className="text-muted-foreground mt-1">Organize your tasks across different projects</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm active:scale-95" data-testid="create-board-button">
                  <Plus size={18} className="mr-2" />
                  Create Board
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="create-board-dialog">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-heading">Create New Board</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateBoard} className="space-y-4">
                  <div>
                    <Label htmlFor="board-title">Board Title</Label>
                    <Input
                      id="board-title"
                      value={newBoard.title}
                      onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                      placeholder="e.g., Work, Personal, Study"
                      required
                      className="mt-1"
                      data-testid="board-title-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="board-description">Description (optional)</Label>
                    <Input
                      id="board-description"
                      value={newBoard.description}
                      onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                      placeholder="Brief description of this board"
                      className="mt-1"
                      data-testid="board-description-input"
                    />
                  </div>
                  <div>
                    <Label>Board Color</Label>
                    <div className="flex gap-2 mt-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewBoard({ ...newBoard, color })}
                          className={`w-10 h-10 rounded-md transition-transform hover:scale-110 ${
                            newBoard.color === color ? 'ring-2 ring-ring ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          data-testid={`color-option-${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" data-testid="submit-board-button">
                    Create Board
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {boards.length === 0 ? (
            <div className="text-center py-16" data-testid="empty-boards-state">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                <LayoutGrid size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No boards yet</h3>
              <p className="text-muted-foreground mb-6">Create your first board to start organizing tasks</p>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="empty-create-board-button">
                <Plus size={18} className="mr-2" />
                Create Your First Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onDelete={handleDeleteBoard}
                  onClick={() => navigate(`/board/${board.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {upcomingTasks.length > 0 && (
          <div className="mt-12" data-testid="upcoming-tasks-section">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-brand-600" size={24} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                Upcoming Tasks
              </h3>
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors"
                    data-testid={`upcoming-task-${task.id}`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={20} className="text-brand-500 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-md ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;