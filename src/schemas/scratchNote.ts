// src/schemas/scratchNote.ts
import type { Meta } from './meta';

export interface ScratchNoteData {
  id: string;
  note: string;
  createdAt: Date;
  meta?: Meta; // Optional meta field for version tracking
}
