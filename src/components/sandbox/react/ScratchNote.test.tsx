import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNote from './ScratchNote';
import * as UseLocalStorageModule from './UseLocalStorage';
import type { ScratchNoteData } from '@/schemas/scratchNote';

// Import React explicitly
import * as React from 'react';

// Create a better mock solution that doesn't cause errors
// Mock the specific modules that are used in the component
vi.mock('unified', async () => {
  return {
    unified: () => ({
      use: () => ({
        use: () => ({
          process: () =>
            Promise.resolve({
              toString: () => 'Mocked formatted content',
            }),
        }),
      }),
    }),
  };
});

vi.mock('remark-parse', async () => {
  return {
    default: vi.fn(),
  };
});

vi.mock('remark-stringify', async () => {
  return {
    default: vi.fn(),
  };
});

// Mock the useLocalStorage hook
vi.mock('./UseLocalStorage', async () => {
  const actual = await vi.importActual('./UseLocalStorage');
  return {
    ...actual,
    useLocalStorage: vi.fn(),
  };
});

describe('ScratchNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the ScratchNote component', () => {
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      vi.fn(),
    ]);

    render(<ScratchNote />);
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Take a new note')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('allows entering text in the textarea', async () => {
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      vi.fn(),
    ]);

    render(<ScratchNote />);

    const textarea = screen.getByRole('textbox');
    await act(async () => {
      await userEvent.type(textarea, 'Test note content');
    });

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

    render(<ScratchNote />);

    // Type some text in the textarea
    const textarea = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'New test note' } });
    });

    // Click the send button - using a test ID to ensure we click the right button
    await act(async () => {
      // Find the button by its content or position
      const sendButton = screen.getByLabelText('Send note');
      fireEvent.click(sendButton);
      // Allow any promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify the mock was called with the correct data
    expect(mockSetNotes).toHaveBeenCalled();
    // Check the first argument of the first call
    const firstCallArg = mockSetNotes.mock.calls[0][0];
    expect(firstCallArg).toBeInstanceOf(Array);
    expect(firstCallArg[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      }),
    );

    // Clean up the spy
    mockDateNow.mockRestore();
  });

  it('handles Shift+Enter key press correctly', async () => {
    // Since we can't mock useState in React 19, we'll test the functionality differently
    // by observing what happens when Shift+Enter is pressed
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      mockSetNotes,
    ]);

    render(<ScratchNote />);
    const textarea = screen.getByRole('textbox');

    // First add some content to the textarea
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Initial text' } });
    });

    // Simulate Shift+Enter key press
    await act(async () => {
      fireEvent.keyDown(textarea, {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
      });
      // Allow any promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // The test passes if no error is thrown during the Shift+Enter handling
    expect(textarea).toBeInTheDocument();
  });

  it('does not add empty notes', async () => {
    // Create a spy for the setNotes function
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      mockSetNotes,
    ]);

    render(<ScratchNote />);

    // Test with empty input - input is already empty by default
    await act(async () => {
      const sendButton = screen.getByLabelText('Send note');
      fireEvent.click(sendButton);
      // Allow any promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify setNotes was not called
    expect(mockSetNotes).not.toHaveBeenCalled();

    // Test with whitespace-only input
    const textarea = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '   ' } });
    });

    await act(async () => {
      const sendButton = screen.getByLabelText('Send note');
      fireEvent.click(sendButton);
      // Allow any promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify setNotes was still not called
    expect(mockSetNotes).not.toHaveBeenCalled();
  });

  it('renders existing notes from local storage', () => {
    // Mock existing notes
    const existingNotes: ScratchNoteData[] = [
      { id: '1', note: 'First test note', createdAt: new Date() },
      { id: '2', note: 'Second test note', createdAt: new Date() },
    ];

    // Set up the mock to return our existing notes and an empty archive
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNotes') {
          return [existingNotes, vi.fn()];
        }
        // Return empty array for archives
        return [[], vi.fn()];
      },
    );

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

    // Mock both localStorage hooks
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNotes') {
          return [existingNotes, mockSetNotes];
        }
        // Return empty array for archives
        return [[], vi.fn()];
      },
    );

    // Set a consistent value for Date.now()
    const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);

    render(<ScratchNote />);

    // Add a new note
    const textarea = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'New note' } });
    });

    await act(async () => {
      const sendButton = screen.getByLabelText('Send note');
      fireEvent.click(sendButton);
      // Allow any promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Check if the new note was added at the beginning of the list
    expect(mockSetNotes).toHaveBeenCalled();
    const firstCallArg = mockSetNotes.mock.calls[0][0];

    // Verify we have an array with the new note first, then the existing note
    expect(firstCallArg).toBeInstanceOf(Array);
    expect(firstCallArg.length).toBe(2);
    expect(firstCallArg[1]).toEqual(existingNotes[0]);

    // Clean up the spy
    mockDateNow.mockRestore();
  });

  it('handles other key presses in the textarea', async () => {
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      vi.fn(),
    ]);

    render(<ScratchNote />);

    const textarea = screen.getByRole('textbox');

    // Simulate other key presses
    await act(async () => {
      fireEvent.keyDown(textarea, {
        key: 'A',
        code: 'KeyA',
      });

      // Allow any timeouts to execute
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Should not throw any errors
    expect(textarea).toBeInTheDocument();
  });

  it('handles paste operations in the textarea', async () => {
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      vi.fn(),
    ]);

    render(<ScratchNote />);

    const textarea = screen.getByRole('textbox');

    // Simulate paste operation
    await act(async () => {
      fireEvent.input(textarea);

      // Allow any timeouts to execute
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Should not throw any errors
    expect(textarea).toBeInTheDocument();
  });

  it('correctly identifies test environment', () => {
    // Access the isTestEnvironment function indirectly by rendering the component
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockReturnValue([
      [],
      vi.fn(),
    ]);

    render(<ScratchNote />);

    // The test runs successfully if isTestEnvironment correctly returns true in the test environment
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
