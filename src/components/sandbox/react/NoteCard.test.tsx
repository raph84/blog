import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteCard from './NoteCard';

describe('NoteCard', () => {
  it('renders the NoteCard component', () => {
    render(<NoteCard />);
    expect(screen.getByText('Note')).toBeDefined();
    screen.debug(); // prints out the jsx in the App component unto the command line
  });
});
