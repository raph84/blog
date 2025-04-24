export interface ScratchNoteThread {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
  order: number; // For sorting threads
}

export interface ScratchNoteThreadsConfig {
  threads: ScratchNoteThread[];
  activeThreadId: string;
  version: string; // For potential migrations
}
