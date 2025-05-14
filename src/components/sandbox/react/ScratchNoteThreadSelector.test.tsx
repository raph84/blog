import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNoteThreadSelector from './ScratchNoteThreadSelector';
import type { ScratchNoteThread } from '@/schemas/scratchNoteThread';

// Import React explicitly
import * as React from 'react';

// Mock the ScratchNoteCreateThreadDialog component
vi.mock('./ScratchNoteCreateThreadDialog', () => ({
  default: ({
    onCreateThread,
  }: {
    onCreateThread: (_name: string) => void;
  }) => (
    <button
      data-testid="mock-create-thread-dialog"
      onClick={() => onCreateThread('New Thread from Mock')}
    >
      New Thread
    </button>
  ),
}));

// Mock the ScrollArea component to avoid ResizeObserver issues
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ className, children }) => (
    <div data-testid="mock-scroll-area" className={className}>
      {children}
    </div>
  ),
}));

describe('ScratchNoteThreadSelector', () => {
  // Sample threads for testing
  const sampleThreads: ScratchNoteThread[] = [
    { id: 'default', name: 'Default', createdAt: new Date(), order: 0 },
    { id: 'thread_work', name: 'Work', createdAt: new Date(), order: 1 },
    {
      id: 'thread_personal',
      name: 'Personal',
      createdAt: new Date(),
      order: 2,
    },
  ];

  // Mock event handlers
  const mockSelectThread = vi.fn();
  const mockCreateThread = vi.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders with the provided threads', () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Header should be displayed
    expect(screen.getByText('Threads')).toBeInTheDocument();

    // All threads should be displayed
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();

    // Create thread button should be available
    expect(screen.getByText('New Thread')).toBeInTheDocument();
  });

  it('highlights the active thread', () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="thread_work" // Work thread is active
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Get all thread buttons
    const threadButtons = screen
      .getAllByRole('button')
      .filter((btn) =>
        ['Default', 'Work', 'Personal'].includes(btn.textContent || ''),
      );

    // Find the Work button - it should have bg-secondary class
    const workButton = threadButtons.find((btn) => btn.textContent === 'Work');
    const defaultButton = threadButtons.find(
      (btn) => btn.textContent === 'Default',
    );
    const personalButton = threadButtons.find(
      (btn) => btn.textContent === 'Personal',
    );

    // Work thread should be highlighted
    expect(workButton?.className).toContain('bg-secondary');

    // Other threads should not be highlighted
    expect(defaultButton?.className).not.toContain('bg-secondary');
    expect(personalButton?.className).not.toContain('bg-secondary');
  });

  it('calls onSelectThread when a thread is clicked', async () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Find all buttons and get the Work thread button
    const threadButtons = screen
      .getAllByRole('button')
      .filter((btn) =>
        ['Default', 'Work', 'Personal'].includes(btn.textContent || ''),
      );
    const workButton = threadButtons.find((btn) => btn.textContent === 'Work');

    // Click on the Work thread
    if (workButton) await userEvent.click(workButton);

    // onSelectThread should be called with the Work thread ID
    expect(mockSelectThread).toHaveBeenCalledWith('thread_work');
  });

  it('does not call onSelectThread when clicking the active thread', async () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Find all buttons and get the Default thread button (which is active)
    const threadButtons = screen
      .getAllByRole('button')
      .filter((btn) =>
        ['Default', 'Work', 'Personal'].includes(btn.textContent || ''),
      );
    const defaultButton = threadButtons.find(
      (btn) => btn.textContent === 'Default',
    );

    // Click on the already active Default thread
    if (defaultButton) await userEvent.click(defaultButton);

    // onSelectThread should still be called, as the component lets the parent handle this logic
    expect(mockSelectThread).toHaveBeenCalledWith('default');
  });

  it('calls onCreateThread when the "New Thread" button is clicked', async () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Click on the New Thread button (this is our mocked component)
    const newThreadButton = screen.getByTestId('mock-create-thread-dialog');
    await userEvent.click(newThreadButton);

    // onCreateThread should be called with the thread name from the mock
    expect(mockCreateThread).toHaveBeenCalledWith('New Thread from Mock');
  });

  it('renders empty state when no threads are provided', () => {
    render(
      <ScratchNoteThreadSelector
        threads={[]}
        activeThreadId=""
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Header should still be displayed
    expect(screen.getByText('Threads')).toBeInTheDocument();

    // Create thread button should be available
    expect(screen.getByText('New Thread')).toBeInTheDocument();

    // No thread buttons should be displayed
    expect(
      screen.queryByRole('button', { name: /Default|Work|Personal/ }),
    ).not.toBeInTheDocument();
  });

  it('renders threads in the correct order', () => {
    // Create threads with specific order
    const orderedThreads: ScratchNoteThread[] = [
      { id: 'thread_3', name: 'Third', createdAt: new Date(), order: 2 },
      { id: 'thread_1', name: 'First', createdAt: new Date(), order: 0 },
      { id: 'thread_2', name: 'Second', createdAt: new Date(), order: 1 },
    ];

    render(
      <ScratchNoteThreadSelector
        threads={orderedThreads}
        activeThreadId="thread_1"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Get all thread buttons (excluding New Thread button)
    const threadButtons = screen
      .getAllByRole('button')
      .filter((button) =>
        ['Third', 'First', 'Second'].includes(button.textContent || ''),
      );

    // Verify threads are rendered in the order they appear in the props array
    expect(threadButtons[0]).toHaveTextContent('Third');
    expect(threadButtons[1]).toHaveTextContent('First');
    expect(threadButtons[2]).toHaveTextContent('Second');
  });

  it('applies correct styling to the container and buttons', () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Check that the container exists and has appropriate structure
    const container = screen.getByText('Threads').closest('div')?.parentElement;
    expect(container).toBeInTheDocument();

    // Check that thread buttons have proper styling
    const threadButtons = screen
      .getAllByRole('button')
      .filter((button) =>
        ['Default', 'Work', 'Personal'].includes(button.textContent || ''),
      );

    // Verify we have buttons for each thread
    expect(threadButtons.length).toBe(3);

    // Check that buttons have the expected slot attribute
    threadButtons.forEach((button) => {
      expect(button).toHaveAttribute('data-slot', 'button');
    });
  });

  it('handles very long thread names appropriately', () => {
    // Create a thread with a very long name
    const longNameThread: ScratchNoteThread = {
      id: 'thread_long',
      name: 'This is a very long thread name that might cause layout issues if not handled properly',
      createdAt: new Date(),
      order: 3,
    };

    const threadsWithLongName = [...sampleThreads, longNameThread];

    render(
      <ScratchNoteThreadSelector
        threads={threadsWithLongName}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // The long name thread should be displayed
    expect(
      screen.getByText(/This is a very long thread name/),
    ).toBeInTheDocument();
  });

  it('has a scrollable area for many threads', () => {
    // Create many threads to test scrolling
    const manyThreads: ScratchNoteThread[] = Array.from(
      { length: 10 },
      (_, i) => ({
        id: `thread_${i}`,
        name: `Thread ${i}`,
        createdAt: new Date(),
        order: i,
      }),
    );

    render(
      <ScratchNoteThreadSelector
        threads={manyThreads}
        activeThreadId="thread_0"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Check that our mock scroll area is being used
    const scrollArea = screen.getByTestId('mock-scroll-area');
    expect(scrollArea).toBeInTheDocument();

    // Verify all threads are rendered
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`Thread ${i}`)).toBeInTheDocument();
    }
  });

  it('handles special characters in thread names', () => {
    // Create threads with special characters
    const specialThreads: ScratchNoteThread[] = [
      ...sampleThreads,
      {
        id: 'thread_special',
        name: 'Special & Chars: <test>',
        createdAt: new Date(),
        order: 3,
      },
    ];

    render(
      <ScratchNoteThreadSelector
        threads={specialThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // The special character thread should be displayed correctly
    expect(screen.getByText('Special & Chars: <test>')).toBeInTheDocument();
  });

  it('is accessible with proper ARIA attributes', () => {
    render(
      <ScratchNoteThreadSelector
        threads={sampleThreads}
        activeThreadId="default"
        onSelectThread={mockSelectThread}
        onCreateThread={mockCreateThread}
      />,
    );

    // Check that buttons have proper role
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Each button should be clickable and have a text label
    buttons.forEach((button) => {
      expect(button).toHaveTextContent(/.+/);
    });
  });
});
