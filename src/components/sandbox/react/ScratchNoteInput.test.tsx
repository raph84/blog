import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScratchNoteInput from './ScratchNoteInput';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import type { ArchivedNotes } from './type';
import * as markdownUtils from './utils/markdownUtils';
import * as clipboardUtils from './utils/clipboardUtils';
import * as domUtils from './utils/domUtils';
import pkg from '../../../../package.json';

// Import React explicitly
import * as React from 'react';

// Mock package.json version
vi.mock('../../../../package.json', () => ({
  default: { version: '1.0.0' },
}));

// Mock the utility functions
vi.mock('./utils/markdownUtils', () => ({
  formatMarkdownWithRemark: vi.fn().mockImplementation(async (text) => text),
  compileNotesToMarkdown: vi
    .fn()
    .mockImplementation(
      (notes, threadName) =>
        `# ${threadName}\n\n${notes.map((n) => n.note).join('\n\n')}`,
    ),
}));

vi.mock('./utils/clipboardUtils', () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock('./utils/domUtils', () => ({
  ensureCursorVisible: vi.fn(),
  isTestEnvironment: vi.fn().mockReturnValue(true),
}));

describe('ScratchNoteInput', () => {
  // Sample data for tests
  const threadName = 'Test Thread';
  const threadId = 'test_thread';
  const mockSetNotes = vi.fn();
  const mockSetArchivedNotes = vi.fn();

  const sampleNotes: ScratchNoteData[] = [
    {
      id: '1',
      note: 'Test note 1',
      createdAt: new Date('2023-05-15T10:00:00'),
      threadId: 'test_thread',
      meta: { version: '1.0.0' },
    },
    {
      id: '2',
      note: 'Test note 2',
      createdAt: new Date('2023-05-15T09:00:00'),
      threadId: 'test_thread',
      meta: { version: '1.0.0' },
    },
  ];

  const sampleArchivedNotes: ArchivedNotes[] = [
    {
      timestamp: new Date('2023-05-14').toISOString(),
      notes: [
        {
          id: '3',
          note: 'Archived note',
          createdAt: new Date('2023-05-14'),
          threadId: 'test_thread',
        },
      ],
      sourceThreadId: 'test_thread',
    },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations if needed
    vi.mocked(markdownUtils.formatMarkdownWithRemark).mockImplementation(
      async (text) => text,
    );
    vi.mocked(markdownUtils.compileNotesToMarkdown).mockImplementation(
      (notes, threadName) =>
        `# ${threadName}\n\n${notes.map((n) => n.note).join('\n\n')}`,
    );

    // Reset date behavior for predictable test outcomes
    vi.setSystemTime(new Date('2023-05-15T12:00:00'));
  });

  it('renders with the correct thread name and description', () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    // Check for thread name and description
    expect(screen.getByText(threadName)).toBeInTheDocument();
    expect(screen.getByText('Take a new note')).toBeInTheDocument();

    // Textarea should be present
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // Buttons should be present
    expect(
      screen.getByTitle('Copy all notes to clipboard'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Clear notes (copies to clipboard and archives)'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Send note')).toBeInTheDocument();
  });

  it('handles input text changes correctly', async () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const textarea = screen.getByRole('textbox');
    const testText = 'New note text';

    // Type in the textarea
    await userEvent.type(textarea, testText);

    // The textarea should contain the typed text
    expect(textarea).toHaveValue(testText);
  });

  it('adds a new note when the send button is clicked with valid input', async () => {
    // Mock Date.now() to return a predictable value
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890);

    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByLabelText('Send note');
    const testText = 'New note text';

    // Type in the textarea
    await userEvent.type(textarea, testText);

    // Click the send button
    await userEvent.click(sendButton);

    // Verify formatMarkdownWithRemark was called with the input text
    expect(markdownUtils.formatMarkdownWithRemark).toHaveBeenCalledWith(
      testText,
    );

    // Verify setNotes was called with the new note prepended to the existing notes
    expect(mockSetNotes).toHaveBeenCalledWith([
      {
        id: '1234567890',
        note: 'New note text', // Since we mocked formatMarkdownWithRemark to return the input text
        createdAt: expect.any(Date),
        meta: { version: pkg.version },
        threadId: 'test_thread',
      },
      ...sampleNotes,
    ]);

    // Verify the textarea was cleared
    expect(textarea).toHaveValue('');

    // Restore the original Date.now implementation
    dateSpy.mockRestore();
  });

  it('does not add a note when the input is empty or whitespace', async () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByLabelText('Send note');

    // Test with empty string
    await userEvent.clear(textarea);
    await userEvent.click(sendButton);
    expect(mockSetNotes).not.toHaveBeenCalled();

    // Test with whitespace only
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '   ');
    await userEvent.click(sendButton);
    expect(mockSetNotes).not.toHaveBeenCalled();
  });

  it('copies notes to clipboard when the copy button is clicked', async () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const copyButton = screen.getByTitle('Copy all notes to clipboard');

    // Click the copy button
    await userEvent.click(copyButton);

    // Verify compileNotesToMarkdown was called with the notes and thread name
    expect(markdownUtils.compileNotesToMarkdown).toHaveBeenCalledWith(
      sampleNotes,
      threadName,
    );

    // Verify copyToClipboard was called with the compiled markdown and a success message
    expect(clipboardUtils.copyToClipboard).toHaveBeenCalledWith(
      expect.any(String),
      'Notes copied to clipboard!',
    );
  });

  it('clears notes and archives them when the clear button is clicked', async () => {
    // Mock Date to return a predictable timestamp
    const dateSpy = vi
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2023-05-15T12:00:00.000Z');

    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const clearButton = screen.getByTitle(
      'Clear notes (copies to clipboard and archives)',
    );

    // Click the clear button
    await userEvent.click(clearButton);

    // Verify compileNotesToMarkdown was called with the notes and thread name
    expect(markdownUtils.compileNotesToMarkdown).toHaveBeenCalledWith(
      sampleNotes,
      threadName,
    );

    // Verify copyToClipboard was called with the compiled markdown and a success message
    expect(clipboardUtils.copyToClipboard).toHaveBeenCalledWith(
      expect.any(String),
      'Notes cleared and copied to clipboard!',
    );

    // Verify setNotes was called to clear the notes
    expect(mockSetNotes).toHaveBeenCalledWith([]);

    // Verify setArchivedNotes was called to add the archived notes
    expect(mockSetArchivedNotes).toHaveBeenCalledWith([
      {
        timestamp: '2023-05-15T12:00:00.000Z',
        notes: sampleNotes,
        sourceThreadId: threadId,
      },
      ...sampleArchivedNotes,
    ]);

    // Restore the original Date implementation
    dateSpy.mockRestore();
  });

  it('limits archived notes to 3 entries when clearing', async () => {
    // Create a lot of archived notes
    const manyArchivedNotes: ArchivedNotes[] = Array.from(
      { length: 3 },
      (_, i) => ({
        timestamp: new Date(`2023-05-${12 - i}`).toISOString(),
        notes: [
          {
            id: `archived-${i}`,
            note: `Archived note ${i}`,
            createdAt: new Date(`2023-05-${12 - i}`),
            threadId: 'test_thread',
          },
        ],
        sourceThreadId: 'test_thread',
      }),
    );

    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={manyArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const clearButton = screen.getByTitle(
      'Clear notes (copies to clipboard and archives)',
    );

    // Click the clear button
    await userEvent.click(clearButton);

    // Verify setArchivedNotes was called with the new archive plus only the first 2 old ones (to make 3 total)
    expect(mockSetArchivedNotes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(String),
          notes: sampleNotes,
          sourceThreadId: threadId,
        }),
        expect.objectContaining({ timestamp: manyArchivedNotes[0].timestamp }),
        expect.objectContaining({ timestamp: manyArchivedNotes[1].timestamp }),
      ]),
    );

    // Check that the array length is exactly 3
    const calledWith = mockSetArchivedNotes.mock.calls[0][0];
    expect(calledWith.length).toBe(3);
  });

  it('disables the copy and clear buttons when there are no notes', () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={[]}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const copyButton = screen.getByTitle('Copy all notes to clipboard');
    const clearButton = screen.getByTitle(
      'Clear notes (copies to clipboard and archives)',
    );

    // Both buttons should be disabled
    expect(copyButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it('does not attempt to copy/clear when there are no notes', async () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={[]}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const copyButton = screen.getByTitle('Copy all notes to clipboard');
    const clearButton = screen.getByTitle(
      'Clear notes (copies to clipboard and archives)',
    );

    // Try to click the buttons even though they're disabled
    await userEvent.click(copyButton);
    await userEvent.click(clearButton);

    // Verify the utility functions were not called
    expect(markdownUtils.compileNotesToMarkdown).not.toHaveBeenCalled();
    expect(clipboardUtils.copyToClipboard).not.toHaveBeenCalled();
    expect(mockSetNotes).not.toHaveBeenCalled();
    expect(mockSetArchivedNotes).not.toHaveBeenCalled();
  });

  it('handles markdown formatting of new notes correctly', async () => {
    // Mock formatMarkdownWithRemark to simulate markdown formatting
    vi.mocked(markdownUtils.formatMarkdownWithRemark).mockResolvedValue(
      '**Formatted** markdown',
    );

    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByLabelText('Send note');

    // Type plain text that would be formatted
    await userEvent.type(textarea, 'Plain text to be formatted');
    await userEvent.click(sendButton);

    // Verify formatMarkdownWithRemark was called
    expect(markdownUtils.formatMarkdownWithRemark).toHaveBeenCalledWith(
      'Plain text to be formatted',
    );

    // Verify the formatted text was used in the new note
    expect(mockSetNotes).toHaveBeenCalledWith([
      expect.objectContaining({
        note: '**Formatted** markdown',
      }),
      ...sampleNotes,
    ]);
  });

  it('applies the correct meta information to new notes', async () => {
    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByLabelText('Send note');

    await userEvent.type(textarea, 'New note');
    await userEvent.click(sendButton);

    // Verify the note contains the correct meta information
    expect(mockSetNotes).toHaveBeenCalledWith([
      expect.objectContaining({
        meta: { version: pkg.version },
        threadId: threadId,
      }),
      ...sampleNotes,
    ]);
  });

  it('verifies cursor-related behavior exists', async () => {
    // Mock isTestEnvironment to return false to test the scrolling code path
    const isTestEnvSpy = vi
      .spyOn(domUtils, 'isTestEnvironment')
      .mockReturnValue(false);

    render(
      <ScratchNoteInput
        threadName={threadName}
        threadId={threadId}
        notes={sampleNotes}
        setNotes={mockSetNotes}
        archivedNotes={sampleArchivedNotes}
        setArchivedNotes={mockSetArchivedNotes}
      />,
    );

    const textarea = screen.getByRole('textbox');

    // Manually trigger the onKeyDown event since userEvent may not reliably trigger it in JSDOM
    await textarea.focus();
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    );

    // Verify isTestEnvironment was called during the event handler
    expect(isTestEnvSpy).toHaveBeenCalled();

    // Restore the spy
    isTestEnvSpy.mockRestore();
  });
});
