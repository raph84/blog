// src/components/sandbox/react/ScratchNoteArchive.tsx
import { Button } from '@/components/ui/button';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import type { ScratchNoteThreadsConfig } from '@/schemas/scratchNoteThread';
import type { ArchivedNotes } from './types';
import { getThreadNotesKey } from './utils/storageUtils';

interface ScratchNoteArchiveProps {
  archivedNotes: ArchivedNotes[];
  setArchivedNotes: React.Dispatch<React.SetStateAction<ArchivedNotes[]>>;
  activeThreadId: string;
  activeThreadNotes: ScratchNoteData[];
  setActiveThreadNotes: React.Dispatch<React.SetStateAction<ScratchNoteData[]>>;
  threadsConfig: ScratchNoteThreadsConfig;
}

export default function ScratchNoteArchive({
  archivedNotes,
  setArchivedNotes,
  activeThreadId,
  activeThreadNotes,
  setActiveThreadNotes,
  threadsConfig
}: ScratchNoteArchiveProps) {
  if (!archivedNotes || archivedNotes.length === 0) {
    return null;
  }

  const handleRestoreToOriginal = (archive: ArchivedNotes, index: number) => {
    if (archive.notes) {
      // Get the thread ID from the archive or default to the default thread
      const threadId = archive.sourceThreadId || 'default';

      // Check if the thread exists
      const threadExists = threadsConfig.threads.some(
        (t) => t.id === threadId
      );

      if (threadExists) {
        // If not currently on the source thread, handle differently
        if (activeThreadId !== threadId) {
          // Get the current thread's notes from localStorage
          const threadKey = getThreadNotesKey(threadId);
          const currentNotes = JSON.parse(
            localStorage.getItem(threadKey) || '[]'
          );

          // Restore notes to their original thread
          localStorage.setItem(
            threadKey,
            JSON.stringify([...archive.notes, ...currentNotes])
          );
        } else {
          // If restoring to the active thread, update the state
          setActiveThreadNotes([...archive.notes, ...activeThreadNotes]);
        }
      } else {
        // If the thread doesn't exist anymore, restore to current thread
        setActiveThreadNotes([...archive.notes, ...activeThreadNotes]);
      }

      // Remove this archive from the archived notes
      setArchivedNotes(archivedNotes.filter((_, i) => i !== index));
    }
  };

  const handleRestoreToCurrent = (archive: ArchivedNotes, index: number) => {
    if (archive.notes) {
      // Restore to current thread regardless of source
      setActiveThreadNotes([...archive.notes, ...activeThreadNotes]);

      // Remove this archive from the archived notes
      setArchivedNotes(archivedNotes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="mt-4 mb-2">
      <h3 className="mb-2 text-sm font-medium text-gray-500">
        Archived Notes ({archivedNotes.length})
      </h3>
      <div className="flex flex-col space-y-1">
        {archivedNotes.map((archive, index) => {
          // Find the thread name for this archive
          const threadName =
            threadsConfig.threads.find(
              (t) => t.id === (archive.sourceThreadId || 'default')
            )?.name || 'Default';

          return (
            <div key={index} className="rounded-sm border bg-gray-50 p-2">
              <p className="mb-1 text-xs text-gray-500">
                {new Date(archive.timestamp).toLocaleString()} (
                {archive.notes ? archive.notes.length : 0} notes from
                thread "{threadName}")
              </p>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-1 text-xs"
                  onClick={() => handleRestoreToOriginal(archive, index)}
                >
                  Restore to Original Thread
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-1 text-xs"
                  onClick={() => handleRestoreToCurrent(archive, index)}
                >
                  Restore to Current Thread
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}