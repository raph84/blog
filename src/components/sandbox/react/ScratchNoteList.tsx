// src/components/sandbox/react/ScratchNoteList.tsx
import type { ScratchNoteData } from '@/schemas/scratchNote';

interface ScratchNoteListProps {
  notes: ScratchNoteData[];
}

export default function ScratchNoteList({ notes }: ScratchNoteListProps) {
  if (!notes || notes.length === 0) {
    return null;
  }

  return (
    <div className="my-2 mb-2 flex flex-col space-y-1">
      {notes.map((note) => (
        <div
          key={note.id}
          className="mb-[2px] rounded-sm border bg-white p-2 font-mono text-xs whitespace-pre-wrap"
        >
          <p className="font-mono">{note.note}</p>
        </div>
      ))}
    </div>
  );
}
