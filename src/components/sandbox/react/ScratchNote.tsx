import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { PaperPlaneRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from './UseLocalStorage';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import { useState, useMemo } from 'react';

type CardProps = React.ComponentProps<typeof Card>;

function ScratchNote({ className, ...props }: CardProps) {
  // Use useMemo to ensure the initialValue is stable across renders
  const initialNotes = useMemo(() => [], []);
  const [notes, setNotes] = useLocalStorage<ScratchNoteData[]>(
    'scratchNotes',
    initialNotes,
  );
  const [inputText, setInputText] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // Function to add a note to the list
  const addNote = () => {
    if (inputText.trim() !== '') {
      const dt = new Date();
      const scratch = {
        id: Date.now().toString(),
        note: inputText,
        createdAt: dt,
      } as ScratchNoteData;
      setNotes([scratch, ...notes]);
      // Reset the text field
      setInputText('');
    }
  };

  return (
    <>
      <div className={cn('h-[400px] w-[380px]', className)} {...props}>
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Note</CardTitle>
            <CardDescription>Take a new note</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-1">
            <Textarea
              onChange={handleInputChange}
              value={inputText}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Prevent default to avoid newline
                  addNote();
                }
              }}
            />
            <div className="grid justify-items-end">
              <Button variant="ghost" size="icon" onClick={addNote}>
                <PaperPlaneRight size={32} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {notes.length > 0 && (
          <div className="my-2 h-[200px] overflow-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="mb-[2px] rounded-sm border bg-white p-4 text-sm"
              >
                {note.note}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ScratchNote;
