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
import type { ScratchNote } from '@/schemas/scratchNote';
import { useState } from 'react';

type CardProps = React.ComponentProps<typeof Card>;

function ScratchNote({ className, ...props }: CardProps) {
  const [notes, setNotes] = useLocalStorage<ScratchNote[]>('scratchNotes', []);

  const [inputText, setInputText] = useState('');
  
  const [notesList, setNotesList] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // Fonction pour ajouter une note à la liste
  const addNote = () => {
    if (inputText.trim() !== '') {
      // Ajouter le texte à la liste des notes
      setNotesList([...notesList, inputText]);
      // Réinitialiser le champ de texte
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
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <div className="grid justify-items-end">
              <Button variant="ghost" size="icon" onClick={addNote}>
                <PaperPlaneRight size={32} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {notesList.length > 0 && (
          <div className="my-2 h-[200px] overflow-auto">
            {notesList.map((note, index) => (
              <div
                key={index}
                className="rounded-sm border bg-white p-4 text-sm"
              >
                {note}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ScratchNote;
