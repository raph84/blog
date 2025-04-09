import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNote from './ScratchNote';
import * as UseLocalStorageModule from './UseLocalStorage';
import type { ScratchNoteData } from '@/schemas/scratchNote';

// Import React explicitly
import * as React from 'react';

// Mock the useLocalStorage hook
vi.mock('./UseLocalStorage', () => ({
  useLocalStorage: vi.fn().mockImplementation((key, initialValue) => {
    return [initialValue, vi.fn()];
  }),
}));

describe('ScratchNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the ScratchNote component', () => {
    // Simple minimal mocking approach
    render(<ScratchNote />);
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Take a new note')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should call useLocalStorage with the correct key and initial value', () => {
    render(<ScratchNote />);
    expect(UseLocalStorageModule.useLocalStorage).toHaveBeenCalledWith(
      'scratchNotes',
      expect.any(Array),
    );
  });

  it('allows entering text in the textarea', async () => {
    const user = userEvent.setup();
    render(<ScratchNote />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test note content');

    // Check that input received the content
    expect(textarea).toHaveValue('Test note content');
  });

  it('adds a new note when the button is clicked', async () => {
    // Spy on Date.now() for predictable IDs
    const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);

    // Create a spy for the setNotes function
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      mockSetNotes,
    ]);

    // Render with the mocks
    render(<ScratchNote />);

    // Type some text in the textarea
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New test note' } });

    // Click the button
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify the mock was called with the correct data
    expect(mockSetNotes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          note: 'New test note',
          id: expect.any(String),
        }),
      ]),
    );

    // Clean up the spy
    mockDateNow.mockRestore();
  });

  it('adds a new note when Enter is pressed', async () => {
    // Spy on Date.now() for predictable IDs
    const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);

    // Create a spy for the setNotes function
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      mockSetNotes,
    ]);

    // Render with the mocks
    render(<ScratchNote />);

    // Type some text and press Enter
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Note submitted with Enter' },
    });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    // Verify the mock was called with the correct data
    expect(mockSetNotes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          note: 'Note submitted with Enter',
          id: expect.any(String),
        }),
      ]),
    );

    // Clean up the spy
    mockDateNow.mockRestore();
  });

  it('does not add empty notes', async () => {
    // Create a spy for the setNotes function
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      mockSetNotes,
    ]);

    // Render with the mocks
    render(<ScratchNote />);

    // Test with empty input - input is already empty by default
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify setNotes was not called
    expect(mockSetNotes).not.toHaveBeenCalled();

    // Test with whitespace-only input
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(button);

    // Verify setNotes was still not called
    expect(mockSetNotes).not.toHaveBeenCalled();
  });

  it('renders existing notes from local storage', () => {
    // Mock existing notes
    const existingNotes: ScratchNoteData[] = [
      { id: '1', note: 'First test note', createdAt: new Date() },
      { id: '2', note: 'Second test note', createdAt: new Date() },
    ];

    // Set up the mock to return our existing notes
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      existingNotes,
      vi.fn(),
    ]);

    render(<ScratchNote />);

    // Check if both notes are rendered
    expect(screen.getByText('First test note')).toBeInTheDocument();
    expect(screen.getByText('Second test note')).toBeInTheDocument();
  });

  it('adds new notes at the beginning of the list', async () => {
    // Mock existing notes
    const existingNotes: ScratchNoteData[] = [
      {
        id: '1',
        note: 'Existing note',
        createdAt: new Date('2023-04-07T10:00:00Z'),
      },
    ];

    // Create a spy for the setNotes function
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      existingNotes,
      mockSetNotes,
    ]);

    // Render with the mocks
    render(<ScratchNote />);

    // Add a new note
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New note' } });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check if the new note was added at the beginning of the list
    expect(mockSetNotes).toHaveBeenCalledWith([
      expect.objectContaining({ note: 'New note' }),
      ...existingNotes,
    ]);
  });
});
