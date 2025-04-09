import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNote from './ScratchNote';
import * as UseLocalStorageModule from './UseLocalStorage';
import type { ScratchNoteData } from '@/schemas/scratchNote'; // Import the type

// Mock the useLocalStorage hook
vi.mock('./UseLocalStorage', () => ({
  useLocalStorage: vi.fn(),
}));

describe('ScratchNote', () => {
  // Setup mock data and reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementation for useLocalStorage
    // Provide a more specific type for mockNotes
    let mockNotes: ScratchNoteData[] = [];
    const mockSetNotes = vi.fn((updater) => {
      // Handle both direct value and function updater
      if (typeof updater === 'function') {
        mockNotes = updater(mockNotes);
      } else {
        mockNotes = Array.isArray(updater) ? updater : [];
      }
    });

    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      mockNotes,
      mockSetNotes,
    ]);
  });

  // Clean up fake timers after each test
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the ScratchNote component', () => {
    render(<ScratchNote />);
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Take a new note')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should call useLocalStorage with the correct key and initial value', () => {
    render(<ScratchNote />);
    expect(UseLocalStorageModule.useLocalStorage).toHaveBeenCalledWith(
      'scratchNotes',
      [],
    );
  });

  it('allows entering text in the textarea', async () => {
    const user = userEvent.setup();
    render(<ScratchNote />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test note content');

    expect(textarea).toHaveValue('Test note content');
  });

  it('adds a new note when the button is clicked', async () => {
    vi.useFakeTimers();
    const mockDate = new Date('2025-04-08T12:00:00Z');
    vi.setSystemTime(mockDate);

    const mockSetNotes = vi.fn();
    // Ensure the mock returns the correct types
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [] as ScratchNoteData[],
      mockSetNotes,
    ]);

    const user = userEvent.setup();
    render(<ScratchNote />);

    // Type in the textarea
    await user.type(screen.getByRole('textbox'), 'New test note');

    // Click the submit button
    const button = screen.getByRole('button');
    await user.click(button);

    // Check if setNotes was called with the correct arguments
    // new Date() inside the component will now use the fake time
    expect(mockSetNotes).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.any(String),
        note: 'New test note',
        createdAt: mockDate, // Expect the Date object set by the fake timer
      }),
    ]);
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('adds a new note when Enter is pressed', async () => {
    // Use fake timers
    vi.useFakeTimers();
    const mockDate = new Date('2025-04-08T12:00:00Z');
    vi.setSystemTime(mockDate);

    const mockSetNotes = vi.fn();
    // Ensure the mock returns the correct types
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [] as ScratchNoteData[],
      mockSetNotes,
    ]);

    const user = userEvent.setup();
    render(<ScratchNote />);

    // Type in the textarea and press Enter
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Note submitted with Enter');
    // Use fireEvent for specific key events like Enter without Shift
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Check if setNotes was called with the correct arguments
    expect(mockSetNotes).toHaveBeenCalledWith([
      expect.objectContaining({
        note: 'Note submitted with Enter',
        id: expect.any(String),
        createdAt: mockDate, // Expect the Date object set by the fake timer
      }),
    ]);
    vi.runOnlyPendingTimers();
  });

  it('does not add empty notes', async () => {
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [] as ScratchNoteData[],
      mockSetNotes,
    ]);

    const user = userEvent.setup();
    render(<ScratchNote />);

    // Click the submit button without typing anything
    const button = screen.getByRole('button');
    await user.click(button);

    // SetNotes should not be called
    expect(mockSetNotes).not.toHaveBeenCalled();

    // Also test with Enter key
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '   '); // Type only whitespace
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(mockSetNotes).not.toHaveBeenCalled();
  });

  it('renders existing notes from local storage', () => {
    // Mock existing notes with correct type
    const existingNotes: ScratchNoteData[] = [
      { id: '1', note: 'First test note', createdAt: new Date() },
      { id: '2', note: 'Second test note', createdAt: new Date() },
    ];

    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      existingNotes,
      vi.fn(),
    ]);

    render(<ScratchNote />);

    // Check if both notes are rendered
    expect(screen.getByText('First test note')).toBeInTheDocument();
    expect(screen.getByText('Second test note')).toBeInTheDocument();
  });

  it('clears textarea after adding a note', async () => {
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [] as ScratchNoteData[],
      mockSetNotes,
    ]);

    const user = userEvent.setup();
    render(<ScratchNote />);

    // Type in the textarea
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Note to be cleared');

    // Click the submit button
    const button = screen.getByRole('button');
    await user.click(button);

    // Textarea should be empty after submission
    expect(textarea).toHaveValue('');
  });

  it('adds new notes at the beginning of the list', async () => {
    // Use fake timers
    vi.useFakeTimers();
    const mockDate = new Date('2025-04-08T12:00:00Z');
    vi.setSystemTime(mockDate);

    // Mock existing notes with correct type
    const existingNotes: ScratchNoteData[] = [
      {
        id: '1',
        note: 'Existing note',
        createdAt: new Date('2025-04-07T10:00:00Z'),
      },
    ];

    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      existingNotes,
      mockSetNotes,
    ]);

    const user = userEvent.setup();
    render(<ScratchNote />);

    // Type and submit a new note
    await user.type(screen.getByRole('textbox'), 'New note');
    await user.click(screen.getByRole('button'));

    // Check if new note is added at the beginning
    expect(mockSetNotes).toHaveBeenCalledWith([
      expect.objectContaining({ note: 'New note', createdAt: mockDate }), // Expect the Date object set by the fake timer
      ...existingNotes,
    ]);
    vi.runOnlyPendingTimers();
  });
});
