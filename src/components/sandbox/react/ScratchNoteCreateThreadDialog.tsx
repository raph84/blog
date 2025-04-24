import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from '@phosphor-icons/react';
import type { ScratchNoteThread } from '@/schemas/scratchNoteThread';

interface ScratchNoteCreateThreadDialogProps {
  onCreateThread: (threadName: string) => void;
  trigger?: React.ReactNode;
}

function ScratchNoteCreateThreadDialog({
  onCreateThread,
  trigger,
}: ScratchNoteCreateThreadDialogProps) {
  const [threadName, setThreadName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleCreateThread = () => {
    // Validate the thread name
    if (!threadName.trim()) {
      setNameError('Thread name cannot be empty');
      return;
    }

    if (threadName.trim().length > 30) {
      setNameError('Thread name must be 30 characters or less');
      return;
    }

    // Create the thread
    onCreateThread(threadName.trim());

    // Reset the form and close the dialog
    setThreadName('');
    setNameError('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Thread</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Threads help you organize your notes into separate categories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="thread-name" className="text-left">
              Thread Name
            </Label>
            <Input
              id="thread-name"
              placeholder="e.g., Work, Personal, Ideas"
              value={threadName}
              onChange={(e) => {
                setThreadName(e.target.value);
                setNameError('');
              }}
              className={nameError ? 'border-red-500' : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateThread();
                }
              }}
            />
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleCreateThread}
            disabled={!threadName.trim()}
          >
            Create Thread
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ScratchNoteCreateThreadDialog;
