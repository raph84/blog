import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNoteCreateThreadDialog from './ScratchNoteCreateThreadDialog';

// Import React explicitly
import * as React from 'react';

describe('ScratchNoteCreateThreadDialog', () => {
  // Mock the onCreateThread function
  const mockCreateThread = vi.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders with default trigger button', () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // The default trigger button should be visible
    const newThreadButton = screen.getByText('New Thread');
    expect(newThreadButton).toBeInTheDocument();
    expect(newThreadButton.closest('button')).toHaveClass('text-xs');
  });

  it('renders with custom trigger element', () => {
    // Create a custom trigger element
    const customTrigger = (
      <button data-testid="custom-trigger">Create Custom Thread</button>
    );

    render(
      <ScratchNoteCreateThreadDialog
        onCreateThread={mockCreateThread}
        trigger={customTrigger}
      />,
    );

    // The custom trigger should be used instead of the default
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    expect(screen.queryByText('New Thread')).not.toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Click the trigger button to open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Dialog content should be visible
    expect(screen.getByText('Create New Thread')).toBeInTheDocument();
    expect(screen.getByLabelText('Thread Name')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Thread')).toBeInTheDocument();
  });

  it('validates thread name - empty value', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // The create button should be disabled with empty input
    const createButton = screen.getByText('Create Thread');
    expect(createButton).toBeDisabled();

    // Click create button anyway (shouldn't actually work due to disabled state)
    await act(async () => {
      await userEvent.click(createButton);
    });

    // The onCreateThread should not have been called
    expect(mockCreateThread).not.toHaveBeenCalled();
  });

  it('validates thread name - whitespace only', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter only whitespace
    const nameInput = screen.getByLabelText('Thread Name');
    await act(async () => {
      await userEvent.type(nameInput, '   ');
    });

    // The create button should still be disabled
    const createButton = screen.getByText('Create Thread');
    expect(createButton).toBeDisabled();
  });

  it('validates thread name - too long', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter a very long name
    const nameInput = screen.getByLabelText('Thread Name');
    const longName =
      'This thread name is definitely too long and should trigger validation error';
    await act(async () => {
      await userEvent.type(nameInput, longName);
    });

    // Click create button
    const createButton = screen.getByText('Create Thread');
    await act(async () => {
      await userEvent.click(createButton);
    });

    // Error message should be displayed
    expect(
      screen.getByText('Thread name must be 30 characters or less'),
    ).toBeInTheDocument();

    // The onCreateThread should not have been called
    expect(mockCreateThread).not.toHaveBeenCalled();
  });

  it('creates thread with valid name', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter a valid name
    const nameInput = screen.getByLabelText('Thread Name');
    await act(async () => {
      await userEvent.type(nameInput, 'Valid Thread Name');
    });

    // Click create button
    const createButton = screen.getByText('Create Thread');
    await act(async () => {
      await userEvent.click(createButton);
    });

    // The onCreateThread should have been called with the thread name
    expect(mockCreateThread).toHaveBeenCalledWith('Valid Thread Name');

    // Dialog should be closed
    expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
  });

  it('creates thread when Enter key is pressed', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter a valid name and press Enter
    const nameInput = screen.getByLabelText('Thread Name');
    await act(async () => {
      await userEvent.type(nameInput, 'Enter Key Thread{enter}');
    });

    // The onCreateThread should have been called with the thread name
    expect(mockCreateThread).toHaveBeenCalledWith('Enter Key Thread');

    // Dialog should be closed
    expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
  });

  it('closes dialog without creating thread when Cancel is clicked', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter a valid name
    const nameInput = screen.getByLabelText('Thread Name');
    await act(async () => {
      await userEvent.type(nameInput, 'Canceled Thread');
    });

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    await act(async () => {
      await userEvent.click(cancelButton);
    });

    // The onCreateThread should not have been called
    expect(mockCreateThread).not.toHaveBeenCalled();

    // Dialog should be closed
    expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
  });

  it('resets error message when input changes', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter a very long name
    const nameInput = screen.getByLabelText('Thread Name');
    const longName =
      'This thread name is definitely too long and should trigger validation error';
    await act(async () => {
      await userEvent.type(nameInput, longName);
    });

    // Click create button to trigger error
    const createButton = screen.getByText('Create Thread');
    await act(async () => {
      await userEvent.click(createButton);
    });

    // Error message should be displayed
    expect(
      screen.getByText('Thread name must be 30 characters or less'),
    ).toBeInTheDocument();

    // Clear input and type a valid name
    await act(async () => {
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Valid Name');
    });

    // Error message should be gone
    expect(
      screen.queryByText('Thread name must be 30 characters or less'),
    ).not.toBeInTheDocument();
  });

  it('trims whitespace from thread name', async () => {
    render(<ScratchNoteCreateThreadDialog onCreateThread={mockCreateThread} />);

    // Open the dialog
    const triggerButton = screen.getByText('New Thread');
    await act(async () => {
      await userEvent.click(triggerButton);
    });

    // Enter a name with whitespace
    const nameInput = screen.getByLabelText('Thread Name');
    await act(async () => {
      await userEvent.type(nameInput, '  Padded Name  ');
    });

    // Click create button
    const createButton = screen.getByText('Create Thread');
    await act(async () => {
      await userEvent.click(createButton);
    });

    // The onCreateThread should have been called with the trimmed name
    expect(mockCreateThread).toHaveBeenCalledWith('Padded Name');
  });
});
