import React from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
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

const BoardCard = ({ board, onDelete, onClick }) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(board.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-6 cursor-pointer group"
        data-testid={`board-card-${board.id}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-md shadow-sm"
            style={{ backgroundColor: board.color }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`board-menu-${board.id}`}
              >
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive focus:text-destructive"
                data-testid={`delete-board-${board.id}`}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-xl font-semibold font-heading text-foreground mb-2 truncate">
          {board.title}
        </h3>
        {board.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{board.description}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{board.taskCount || 0}</span> tasks
          </div>
          {board.completedCount > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-brand-600">{board.completedCount}</span> completed
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="delete-board-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{board.title}"? This will permanently delete the board and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-board">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-board"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BoardCard;