import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScratchNote from './ScratchNote';

describe('NoteCard', () => {
  it('renders the NoteCard component', () => {
    render(<ScratchNote />);
    expect(screen.getByText('Note')).toBeDefined();
    screen.debug(); // prints out the jsx in the App component unto the command line
  });
});
