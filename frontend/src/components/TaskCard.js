import React, { useState } from 'react';
import { MoreVertical, Trash2, Edit, CheckCircle2, Circle, Calendar, Bell, Tag, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const TaskCard = ({ task, onUpdate, onDelete, isOverdue }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    reminderDate: task.reminderDate ? new Date(task.reminderDate).toISOString().slice(0, 16) : '',
    tags: task.tags?.join(', ') || '',
    notes: task.notes || ''
  });

  const toggleStatus = () => {
    onUpdate(task.id, { status: task.status === 'pending' ? 'completed' : 'pending' });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const updates = {
      ...editedTask,
      tags: editedTask.tags ? editedTask.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      dueDate: editedTask.dueDate || null,
      reminderDate: editedTask.reminderDate || null
    };
    onUpdate(task.id, updates);
    setIsEditOpen(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <div
        className={`bg-card border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 group ${
          isOverdue ? 'border-red-300 bg-red-50/30' : 'border-border'
        } ${task.status === 'completed' ? 'opacity-60' : ''}`}
        data-testid={`task-card-${task.id}`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={toggleStatus}
            className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
            data-testid={`task-status-toggle-${task.id}`}
          >
            {task.status === 'completed' ? (
              <CheckCircle2 size={24} className="text-brand-600" strokeWidth={1.5} />
            ) : (
              <Circle size={24} className="text-muted-foreground hover:text-brand-500" strokeWidth={1.5} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3
                className={`text-lg font-semibold text-foreground ${
                  task.status === 'completed' ? 'line-through' : ''
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <div className="flex items-center gap-1 text-red-600" data-testid="overdue-indicator">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-medium">Overdue</span>
                  </div>
                )}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(task.priority)}`}
                  data-testid={`task-priority-${task.id}`}
                >
                  {task.priority}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`task-menu-${task.id}`}
                    >
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)} data-testid={`edit-task-${task.id}`}>
                      <Edit size={16} className="mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                      data-testid={`delete-task-${task.id}`}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {task.dueDate && (
                <div className="flex items-center gap-1.5" data-testid={`task-due-date-${task.id}`}>
                  <Calendar size={14} />
                  <span>Due: {new Date(task.dueDate).toLocaleString()}</span>
                </div>
              )}
              {task.reminderDate && (
                <div className="flex items-center gap-1.5" data-testid={`task-reminder-${task.id}`}>
                  <Bell size={14} />
                  <span>Reminder: {new Date(task.reminderDate).toLocaleString()}</span>
                </div>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1.5" data-testid={`task-tags-${task.id}`}>
                  <Tag size={14} />
                  <div className="flex gap-1">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {task.notes && (
              <div className="mt-3 p-3 bg-secondary/50 rounded-md text-sm text-foreground">
                <p className="font-medium mb-1">Notes:</p>
                <p>{task.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="edit-task-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                required
                className="mt-1"
                data-testid="edit-task-title-input"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="mt-1"
                rows={3}
                data-testid="edit-task-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={editedTask.priority} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}>
                  <SelectTrigger className="mt-1" data-testid="edit-task-priority-select">
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
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input
                  id="edit-due-date"
                  type="datetime-local"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="mt-1"
                  data-testid="edit-task-due-date-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-reminder">Reminder Date & Time</Label>
              <Input
                id="edit-reminder"
                type="datetime-local"
                value={editedTask.reminderDate}
                onChange={(e) => setEditedTask({ ...editedTask, reminderDate: e.target.value })}
                className="mt-1"
                data-testid="edit-task-reminder-input"
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={editedTask.tags}
                onChange={(e) => setEditedTask({ ...editedTask, tags: e.target.value })}
                className="mt-1"
                data-testid="edit-task-tags-input"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editedTask.notes}
                onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                className="mt-1"
                rows={2}
                data-testid="edit-task-notes-input"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="submit-edit-task-button">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="delete-task-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-task">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(task.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-task"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCard;