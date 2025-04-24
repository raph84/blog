// src/components/sandbox/react/hooks/useScratchNoteThread.ts
import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../UseLocalStorage';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import type {
  ScratchNoteThread,
  ScratchNoteThreadsConfig,
} from '@/schemas/scratchNoteThread';
import {
  THREADS_CONFIG_KEY,
  DEFAULT_THREAD_ID,
  getThreadNotesKey,
  LEGACY_NOTES_KEY,
} from '../utils/storageUtils';
import pkg from '../../../../../package.json';

// Initialize default thread
const DEFAULT_THREAD: ScratchNoteThread = {
  id: DEFAULT_THREAD_ID,
  name: 'Default',
  createdAt: new Date(),
  order: 0,
};

// Initialize default threads config
const DEFAULT_THREADS_CONFIG: ScratchNoteThreadsConfig = {
  threads: [DEFAULT_THREAD],
  activeThreadId: DEFAULT_THREAD_ID,
  version: pkg.version,
};

export function useScratchNoteThread() {
  // Use useMemo to ensure initialValues are stable across renders
  const initialThreadsConfig = useMemo(() => DEFAULT_THREADS_CONFIG, []);
  const initialNotes = useMemo(() => [] as ScratchNoteData[], []);

  // State for threads configuration
  const [threadsConfig, setThreadsConfig] =
    useLocalStorage<ScratchNoteThreadsConfig>(
      THREADS_CONFIG_KEY,
      initialThreadsConfig,
    );

  // State for the active thread's notes
  const [activeThreadId, setActiveThreadId] = useState(
    threadsConfig.activeThreadId,
  );

  // Hook for the active thread's notes - this will change when activeThreadId changes
  const [activeThreadNotes, setActiveThreadNotes] = useLocalStorage<
    ScratchNoteData[]
  >(getThreadNotesKey(activeThreadId), initialNotes);

  // Add missing legacyNotes state
  const [legacyNotes, setLegacyNotes] = useLocalStorage<ScratchNoteData[]>(
    LEGACY_NOTES_KEY,
    [],
  );

  // Handle migration from legacy notes to threaded structure on initial load
  useEffect(() => {
    const migrateNotesIfNeeded = async () => {
      // Check if we need to migrate legacy notes
      if (legacyNotes.length > 0 && activeThreadId === DEFAULT_THREAD_ID) {
        const defaultThreadKey = getThreadNotesKey(DEFAULT_THREAD_ID);
        const defaultThreadNotes = JSON.parse(
          localStorage.getItem(defaultThreadKey) || '[]',
        );

        // Only migrate if the default thread is empty
        if (defaultThreadNotes.length === 0) {
          console.log('Migrating legacy notes to default thread');

          // Add threadId to each note before migration
          const migratedNotes = legacyNotes.map((note) => ({
            ...note,
            threadId: DEFAULT_THREAD_ID,
          }));

          localStorage.setItem(defaultThreadKey, JSON.stringify(migratedNotes));
          setActiveThreadNotes(migratedNotes);

          // Clear legacy notes after migration
          setLegacyNotes([]);
        }
      }
    };

    migrateNotesIfNeeded();
  }, [legacyNotes, activeThreadId, setLegacyNotes, setActiveThreadNotes]);

  // Update the threadsConfig when changing active thread
  useEffect(() => {
    if (activeThreadId !== threadsConfig.activeThreadId) {
      setThreadsConfig({
        ...threadsConfig,
        activeThreadId,
      });
    }
  }, [activeThreadId, threadsConfig, setThreadsConfig]);

  // Create a new thread
  const handleCreateThread = (threadName: string) => {
    const newThread: ScratchNoteThread = {
      id: `thread_${Date.now()}`,
      name: threadName,
      createdAt: new Date(),
      order: threadsConfig.threads.length,
    };

    // Update threads config
    const updatedThreads = [...threadsConfig.threads, newThread];
    setThreadsConfig({
      ...threadsConfig,
      threads: updatedThreads,
      activeThreadId: newThread.id, // Switch to the new thread
    });

    // Set active thread
    setActiveThreadId(newThread.id);
  };

  // Switch between threads
  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  return {
    threadsConfig,
    setThreadsConfig,
    activeThreadId,
    setActiveThreadId,
    activeThreadNotes,
    setActiveThreadNotes,
    handleCreateThread,
    handleSelectThread,
  };
}
