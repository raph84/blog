import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChatsCircle } from '@phosphor-icons/react';
import ScratchNoteCreateThreadDialog from './ScratchNoteCreateThreadDialog';
import type { ScratchNoteThread } from '@/schemas/scratchNoteThread';

interface ScratchNoteThreadSelectorProps {
  threads: ScratchNoteThread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: (threadName: string) => void;
}

function ScratchNoteThreadSelector({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
}: ScratchNoteThreadSelectorProps) {
  return (
    <div className="mb-2 rounded-sm border bg-white p-1">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <ChatsCircle className="h-4 w-4" />
          <span>Threads</span>
        </div>
        <ScratchNoteCreateThreadDialog onCreateThread={onCreateThread} />
      </div>

      <Separator className="my-1" />

      <ScrollArea className="h-28 px-1">
        <div className="space-y-1 pr-2">
          {threads.map((thread) => (
            <Button
              key={thread.id}
              variant={activeThreadId === thread.id ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start px-2 py-1 text-xs"
              onClick={() => onSelectThread(thread.id)}
            >
              {thread.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ScratchNoteThreadSelector;
