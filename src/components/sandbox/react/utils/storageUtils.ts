// src/components/sandbox/react/utils/storageUtils.ts
// Constants for local storage
export const THREADS_CONFIG_KEY = 'scratchNoteThreadsConfig';
export const DEFAULT_THREAD_ID = 'default';
export const LEGACY_NOTES_KEY = 'scratchNotes';

// Create a dynamic key for thread notes
export const getThreadNotesKey = (threadId: string): string =>
  `scratchNotes_thread_${threadId}`;
