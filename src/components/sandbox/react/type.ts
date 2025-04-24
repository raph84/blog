// src/components/sandbox/react/types.ts
import type { ScratchNoteData } from '@/schemas/scratchNote';

// Define a type for archived note sets
export interface ArchivedNotes {
  timestamp: string;
  notes: ScratchNoteData[];
  sourceThreadId?: string; // Track which thread the notes came from
}
