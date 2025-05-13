import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScratchNoteList from './ScratchNoteList';
import type { ScratchNoteData } from '@/schemas/scratchNote';

// Import React explicitly
import * as React from 'react';

describe('ScratchNoteList', () => {
  // Sample notes for testing
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
    {
      id: '3',
      note: 'Test note 3 with **markdown**',
      createdAt: new Date('2023-05-14T15:30:00'),
      threadId: 'test_thread',
      meta: { version: '1.0.0' },
    },
  ];

  it('renders a list of notes correctly', () => {
    render(<ScratchNoteList notes={sampleNotes} />);

    // Check that all notes are rendered
    expect(screen.getByText('Test note 1')).toBeInTheDocument();
    expect(screen.getByText('Test note 2')).toBeInTheDocument();
    expect(
      screen.getByText('Test note 3 with **markdown**'),
    ).toBeInTheDocument();

    // Check the container structure
    const noteElements = screen.getAllByText(/Test note/);
    expect(noteElements).toHaveLength(3);

    // Verify each note is in its own container
    noteElements.forEach((note) => {
      expect(note.closest('div')).toHaveClass('rounded-sm');
      expect(note.closest('div')).toHaveClass('border');
      expect(note.closest('div')).toHaveClass('bg-white');
      expect(note.closest('div')).toHaveClass('whitespace-pre-wrap');
    });
  });

  it('renders notes in the order they are provided', () => {
    render(<ScratchNoteList notes={sampleNotes} />);

    // Get all note elements in the document
    const noteElements = screen.getAllByText(/Test note/);

    // Check that the notes are rendered in the same order they are provided
    expect(noteElements[0]).toHaveTextContent('Test note 1');
    expect(noteElements[1]).toHaveTextContent('Test note 2');
    expect(noteElements[2]).toHaveTextContent('Test note 3 with **markdown**');
  });

  it('renders markdown content as text without interpreting it', () => {
    render(<ScratchNoteList notes={sampleNotes} />);

    // Find the note with markdown content
    const markdownNote = screen.getByText('Test note 3 with **markdown**');

    // The markdown should be rendered as text, not as formatted bold text
    expect(markdownNote).toHaveTextContent('**markdown**');
    // Check the HTML content doesn't contain <strong> tags
    expect(markdownNote.outerHTML).not.toContain('<strong>');

    // The text should be wrapped in a paragraph with the font-mono class
    expect(markdownNote.tagName).toBe('P');
    expect(markdownNote).toHaveClass('font-mono');
  });

  it('preserves whitespace in note content', () => {
    const notesWithWhitespace: ScratchNoteData[] = [
      {
        id: '4',
        note: 'Note with\n  indented\n    text',
        createdAt: new Date(),
        threadId: 'test_thread',
      },
    ];

    render(<ScratchNoteList notes={notesWithWhitespace} />);

    // Check that the whitespace is preserved
    const noteElement = screen.getByText(/Note with/);
    expect(noteElement.textContent).toBe('Note with\n  indented\n    text');

    // Verify the container has whitespace-pre-wrap class
    expect(noteElement.closest('div')).toHaveClass('whitespace-pre-wrap');
  });

  it('returns null when notes array is empty', () => {
    const { container } = render(<ScratchNoteList notes={[]} />);

    // The component should return null, resulting in an empty container
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when notes is undefined', () => {
    // @ts-ignore - Testing an invalid input to ensure proper handling
    const { container } = render(<ScratchNoteList notes={undefined} />);

    // The component should return null, resulting in an empty container
    expect(container).toBeEmptyDOMElement();
  });

  it('handles notes with special characters correctly', () => {
    const notesWithSpecialChars: ScratchNoteData[] = [
      {
        id: '5',
        note: 'Note with <tags> & special "characters"',
        createdAt: new Date(),
        threadId: 'test_thread',
      },
    ];

    render(<ScratchNoteList notes={notesWithSpecialChars} />);

    // Special characters should be rendered correctly, not interpreted as HTML
    expect(
      screen.getByText('Note with <tags> & special "characters"'),
    ).toBeInTheDocument();
  });

  it('renders multiple notes with the correct spacing', () => {
    render(<ScratchNoteList notes={sampleNotes} />);

    // Check that the container has the correct classes for spacing
    const container = screen.getAllByText(/Test note/)[0].closest('.my-2');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('space-y-1');

    // Check that each note has the correct margin-bottom for spacing
    const noteElements = screen.getAllByText(/Test note/);
    noteElements.forEach((note) => {
      expect(note.closest('div')).toHaveClass('mb-[2px]');
    });
  });

  it('gives each note a unique key based on its id', () => {
    // We can't directly test React keys, but we can check the rendered DOM structure
    render(<ScratchNoteList notes={sampleNotes} />);

    // Get all note containers
    const noteContainers = screen
      .getAllByText(/Test note/)
      .map((note) => note.closest('div'));

    // Verify there are 3 note containers
    expect(noteContainers).toHaveLength(3);

    // Each container should exist and be unique (this is an indirect test for key usage)
    for (let i = 0; i < noteContainers.length; i++) {
      for (let j = i + 1; j < noteContainers.length; j++) {
        expect(noteContainers[i]).not.toBe(noteContainers[j]);
      }
    }
  });
});
