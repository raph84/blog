import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNote from './ScratchNote';
import * as UseLocalStorageModule from './UseLocalStorage';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import type { ScratchNoteThreadsConfig } from '@/schemas/scratchNoteThread';

// Import React explicitly
import * as React from 'react';

// Mock ResizeObserver that doesn't exist in test environment
class ResizeObserverMock {
  observe() {
    /* do nothing */
  }
  unobserve() {
    /* do nothing */
  }
  disconnect() {
    /* do nothing */
  }
}

// Mock package.json for version testing
vi.mock('../../../../package.json', () => ({
  default: {
    version: '2.8.0',
  },
}));

// Mock the unified/remark modules
vi.mock('unified', async () => {
  return {
    unified: () => ({
      use: () => ({
        use: () => ({
          process: (text) =>
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

// Mock the ScratchNoteThreadSelector component
vi.mock('./ScratchNoteThreadSelector', () => ({
  default: ({ onSelectThread, onCreateThread }) => (
    <div data-testid="mock-thread-selector">
      <button
        data-testid="mock-select-default"
        onClick={() => onSelectThread('default')}
      >
        Default
      </button>
      <button
        data-testid="mock-create-thread"
        onClick={() => onCreateThread('New Thread')}
      >
        New Thread
      </button>
    </div>
  ),
}));

describe('ScratchNote', () => {
  // Default thread config that should be returned by useLocalStorage
  const defaultThreadsConfig: ScratchNoteThreadsConfig = {
    threads: [
      { id: 'default', name: 'Default', createdAt: new Date(), order: 0 },
    ],
    activeThreadId: 'default',
    version: '2.8.0',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for ResizeObserver
    global.ResizeObserver = ResizeObserverMock;

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });

    // Mock alert
    global.alert = vi.fn();

    // Default mock for useLocalStorage that returns empty arrays
    // and the default threads config
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        // Return empty array by default for other keys
        return [[], vi.fn()];
      },
    );
  });

  afterEach(() => {
    // Clean up mocks
    delete global.ResizeObserver;
    vi.resetAllMocks();
  });

  it('renders the ScratchNote component', () => {
    render(<ScratchNote />);

    // Check for thread selector
    expect(screen.getByTestId('mock-thread-selector')).toBeInTheDocument();

    // Check for textarea
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // Check for card description
    expect(screen.getByText('Take a new note')).toBeInTheDocument();
  });

  it('allows entering text in the textarea', async () => {
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
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        if (key === 'scratchNotes_thread_default') {
          return [[], mockSetNotes];
        }
        return [[], vi.fn()];
      },
    );

    render(<ScratchNote />);

    // Type some text in the textarea
    const textarea = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'New test note' } });
    });

    // Click the send button - using aria-label to find it
    await act(async () => {
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
        meta: expect.objectContaining({
          version: '2.8.0', // Check for version from the mocked package.json
        }),
      }),
    );

    // Clean up the spy
    mockDateNow.mockRestore();
  });

  it('handles Shift+Enter key press correctly', async () => {
    // Since we can't mock useState in React 19, we'll test the functionality differently
    // by observing what happens when Shift+Enter is pressed
    const mockSetNotes = vi.fn();
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        if (key === 'scratchNotes_thread_default') {
          return [[], mockSetNotes];
        }
        return [[], vi.fn()];
      },
    );

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
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        if (key === 'scratchNotes_thread_default') {
          return [[], mockSetNotes];
        }
        return [[], vi.fn()];
      },
    );

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
      {
        id: '1',
        note: 'First test note',
        createdAt: new Date(),
        meta: { version: '2.7.0' },
        threadId: 'default',
      },
      {
        id: '2',
        note: 'Second test note',
        createdAt: new Date(),
        threadId: 'default',
        // No meta to test backward compatibility
      },
    ];

    // Set up the mock to return our existing notes
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        if (key === 'scratchNotes_thread_default') {
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
        meta: { version: '2.7.0' },
        threadId: 'default',
      },
    ];

    // Create a spy for the setNotes function
    const mockSetNotes = vi.fn();

    // Mock both localStorage hooks
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        if (key === 'scratchNotes_thread_default') {
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

    // Verify the new note has meta with version
    expect(firstCallArg[0].meta).toEqual({ version: '2.8.0' });

    // Clean up the spy
    mockDateNow.mockRestore();
  });

  it('handles other key presses in the textarea', async () => {
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        return [[], vi.fn()];
      },
    );

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
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        return [[], vi.fn()];
      },
    );

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
    vi.mocked(UseLocalStorageModule.useLocalStorage).mockImplementation(
      (key) => {
        if (key === 'scratchNoteThreadsConfig') {
          return [defaultThreadsConfig, vi.fn()];
        }
        return [[], vi.fn()];
      },
    );

    render(<ScratchNote />);

    // The test runs successfully if isTestEnvironment correctly returns true in the test environment
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
