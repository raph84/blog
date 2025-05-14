// src/components/sandbox/react/ScratchNote.tsx
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ScratchNoteThreadSelector from './ScratchNoteThreadSelector';
import ScratchNoteInput from './ScratchNoteInput';
import ScratchNoteList from './ScratchNoteList';
import ScratchNoteArchive from './ScratchNoteArchive';
import { useScratchNoteThread } from './hooks/useScratchNoteThread';
import { useLocalStorage } from './UseLocalStorage';
import type { ArchivedNotes } from './type';

type CardProps = React.ComponentProps<typeof Card>;

function ScratchNote({ className, ...props }: CardProps) {
  const {
    activeThreadId,
    activeThreadNotes,
    setActiveThreadNotes,
    threadsConfig,
    handleCreateThread,
    handleSelectThread,
  } = useScratchNoteThread();

  const [archivedNotes, setArchivedNotes] = useLocalStorage<ArchivedNotes[]>(
    'scratchNotesArchive',
    [],
  );

  // Pass thread name to child components
  const activeThreadName =
    threadsConfig.threads.find((t) => t.id === activeThreadId)?.name || 'Note';

  return (
    <div className="flex flex-col">
      <div className={cn('w-[380px]', className)} {...props}>
        <ScratchNoteThreadSelector
          threads={threadsConfig.threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onCreateThread={handleCreateThread}
        />

        <ScratchNoteInput
          threadName={activeThreadName}
          threadId={activeThreadId}
          notes={activeThreadNotes}
          setNotes={setActiveThreadNotes}
          archivedNotes={archivedNotes}
          setArchivedNotes={setArchivedNotes}
        />

        <ScratchNoteList notes={activeThreadNotes} />

        <ScratchNoteArchive
          archivedNotes={archivedNotes}
          setArchivedNotes={setArchivedNotes}
          activeThreadId={activeThreadId}
          activeThreadNotes={activeThreadNotes}
          setActiveThreadNotes={setActiveThreadNotes}
          threadsConfig={threadsConfig}
        />
      </div>
    </div>
  );
}

export default ScratchNote;
