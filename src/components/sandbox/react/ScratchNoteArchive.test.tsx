import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNoteArchive from './ScratchNoteArchive';
import type { ArchivedNotes } from './type';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import type { ScratchNoteThreadsConfig } from '@/schemas/scratchNoteThread';
import * as storageUtils from './utils/storageUtils';

// Import React explicitly
import * as React from 'react';

describe('ScratchNoteArchive', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => {
        return store[key] || null;
      }),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  // Replace the global localStorage with our mock
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Sample data
  const sampleThreadsConfig: ScratchNoteThreadsConfig = {
    threads: [
      { id: 'default', name: 'Default', createdAt: new Date(), order: 0 },
      { id: 'work', name: 'Work', createdAt: new Date(), order: 1 },
      { id: 'personal', name: 'Personal', createdAt: new Date(), order: 2 },
    ],
    activeThreadId: 'default',
    version: '1.0.0',
  };

  const sampleArchivedNotes: ArchivedNotes[] = [
    {
      timestamp: new Date().toISOString(),
      notes: [
        {
          id: 'note1',
          note: 'Archived note 1',
          createdAt: new Date(),
          threadId: 'default',
        },
        {
          id: 'note2',
          note: 'Archived note 2',
          createdAt: new Date(),
          threadId: 'default',
        },
      ],
      sourceThreadId: 'default',
    },
    {
      timestamp: new Date().toISOString(),
      notes: [
        {
          id: 'note3',
          note: 'Archived work note',
          createdAt: new Date(),
          threadId: 'work',
        },
      ],
      sourceThreadId: 'work',
    },
  ];

  const sampleActiveThreadNotes: ScratchNoteData[] = [
    {
      id: 'note4',
      note: 'Active note 1',
      createdAt: new Date(),
      threadId: 'default',
    },
  ];

  // Mock setter functions
  const mockSetArchivedNotes = vi.fn();
  const mockSetActiveThreadNotes = vi.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders correctly with archived notes', () => {
    render(
      <ScratchNoteArchive
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="default"
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={sampleThreadsConfig}
      />,
    );

    // Check header is displayed with correct count
    expect(
      screen.getByText(`Archived Notes (${sampleArchivedNotes.length})`),
    ).toBeInTheDocument();

    // Check archive entries are displayed
    expect(
      screen.getByText(/2 notes from thread "Default"/),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 notes from thread "Work"/)).toBeInTheDocument();

    // Check buttons are present
    const restoreToOriginalButtons = screen.getAllByText(
      'Restore to Original Thread',
    );
    const restoreToCurrentButtons = screen.getAllByText(
      'Restore to Current Thread',
    );

    expect(restoreToOriginalButtons).toHaveLength(2);
    expect(restoreToCurrentButtons).toHaveLength(2);
  });

  it('does not render when no archived notes are present', () => {
    const { container } = render(
      <ScratchNoteArchive
        archivedNotes={[]}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="default"
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={sampleThreadsConfig}
      />,
    );

    // Component should return null, so container should be empty
    expect(container).toBeEmptyDOMElement();
  });

  it('restores notes to the original thread when the source thread is active', async () => {
    render(
      <ScratchNoteArchive
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="default"
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={sampleThreadsConfig}
      />,
    );

    // Click "Restore to Original Thread" for the first archive (sourced from default thread)
    const restoreToOriginalButtons = screen.getAllByText(
      'Restore to Original Thread',
    );
    await userEvent.click(restoreToOriginalButtons[0]);

    // Should update active thread notes since we're already on the source thread
    expect(mockSetActiveThreadNotes).toHaveBeenCalledWith([
      ...sampleArchivedNotes[0].notes,
      ...sampleActiveThreadNotes,
    ]);

    // Should remove the archive from archivedNotes
    expect(mockSetArchivedNotes).toHaveBeenCalledWith([sampleArchivedNotes[1]]);
  });

  it('restores notes to the original thread via localStorage when the source thread is not active', async () => {
    // Spy on getThreadNotesKey and localStorage methods
    const getThreadNotesKeySpy = vi.spyOn(storageUtils, 'getThreadNotesKey');

    // Prepare localStorage with existing notes
    const existingWorkNotes = [
      {
        id: 'note5',
        note: 'Existing work note',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingWorkNotes));

    render(
      <ScratchNoteArchive
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="default"
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={sampleThreadsConfig}
      />,
    );

    // Click "Restore to Original Thread" for the second archive (sourced from work thread)
    const restoreToOriginalButtons = screen.getAllByText(
      'Restore to Original Thread',
    );
    await userEvent.click(restoreToOriginalButtons[1]);

    // Should have called getThreadNotesKey with the work thread ID
    expect(getThreadNotesKeySpy).toHaveBeenCalledWith('work');

    // Should have read from localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'scratchNotes_thread_work',
    );

    // Should have updated localStorage for the work thread
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'scratchNotes_thread_work',
      expect.any(String),
    );

    // Verify the content passed to localStorage.setItem
    const setItemCalls = localStorageMock.setItem.mock.calls;
    const workThreadCall = setItemCalls.find(
      (call) => call[0] === 'scratchNotes_thread_work',
    );

    if (workThreadCall) {
      const storedNotes = JSON.parse(workThreadCall[1]);

      // Should contain the archived note + existing note
      expect(storedNotes).toHaveLength(2);

      // Verify both notes are present
      expect(
        storedNotes.some((note: ScratchNoteData) => note.id === 'note3'),
      ).toBe(true);
      expect(
        storedNotes.some((note: ScratchNoteData) => note.id === 'note5'),
      ).toBe(true);
    }

    // Should remove the archive from archivedNotes
    expect(mockSetArchivedNotes).toHaveBeenCalledWith([sampleArchivedNotes[0]]);
  });

  it('restores notes to current thread when thread no longer exists', async () => {
    // Create a modified threads config without the "work" thread
    const reducedThreadsConfig = {
      ...sampleThreadsConfig,
      threads: sampleThreadsConfig.threads.filter((t) => t.id !== 'work'),
    };

    render(
      <ScratchNoteArchive
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="default"
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={reducedThreadsConfig}
      />,
    );

    // Click "Restore to Original Thread" for the second archive (sourced from now deleted work thread)
    const restoreToOriginalButtons = screen.getAllByText(
      'Restore to Original Thread',
    );
    await userEvent.click(restoreToOriginalButtons[1]);

    // Should update active thread notes since the source thread doesn't exist
    expect(mockSetActiveThreadNotes).toHaveBeenCalledWith([
      ...sampleArchivedNotes[1].notes,
      ...sampleActiveThreadNotes,
    ]);

    // Should remove the archive from archivedNotes
    expect(mockSetArchivedNotes).toHaveBeenCalledWith([sampleArchivedNotes[0]]);
  });

  it('restores notes to current thread when using "Restore to Current Thread"', async () => {
    render(
      <ScratchNoteArchive
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="personal" // Active thread is different from source threads
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={sampleThreadsConfig}
      />,
    );

    // Click "Restore to Current Thread" for the second archive
    const restoreToCurrentButtons = screen.getAllByText(
      'Restore to Current Thread',
    );
    await userEvent.click(restoreToCurrentButtons[1]);

    // Should update active thread notes
    expect(mockSetActiveThreadNotes).toHaveBeenCalledWith([
      ...sampleArchivedNotes[1].notes,
      ...sampleActiveThreadNotes,
    ]);

    // Should remove the archive from archivedNotes
    expect(mockSetArchivedNotes).toHaveBeenCalledWith([sampleArchivedNotes[0]]);
  });

  it('displays the correct date format for archived notes', () => {
    // Create a specific date for testing
    const specificDate = new Date('2023-06-15T14:30:00');

    const archivedNotesWithSpecificDate: ArchivedNotes[] = [
      {
        timestamp: specificDate.toISOString(),
        notes: [{ id: 'note1', note: 'Test note', createdAt: new Date() }],
        sourceThreadId: 'default',
      },
    ];

    render(
      <ScratchNoteArchive
        archivedNotes={archivedNotesWithSpecificDate}
        setArchivedNotes={mockSetArchivedNotes}
        activeThreadId="default"
        activeThreadNotes={sampleActiveThreadNotes}
        setActiveThreadNotes={mockSetActiveThreadNotes}
        threadsConfig={sampleThreadsConfig}
      />,
    );

    // The date format will depend on the locale of the test environment
    // so we'll check for the presence of the date rather than the exact format
    const formattedDate = new Date(specificDate).toLocaleString();
    expect(
      screen.getByText(
        new RegExp(formattedDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ),
    ).toBeInTheDocument();
  });
});
