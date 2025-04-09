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

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';

const formatMarkdownWithRemark = async (text: string): Promise<string> => {
  try {
    // Définissez les options comme un objet séparé avec le type correct
    const stringifyOptions: RemarkStringifyOptions = {
      bullet: '-', // Utilise - pour les listes à puces
      emphasis: '*', // Utilise * pour l'italique
      strong: '**', // Utilise ** pour le gras
      fence: '```', // Utilise ``` pour les blocs de code
      fences: true, // Active les blocs de code avec ```
      incrementListMarker: true, // Incrémente les marqueurs de liste numérotée
      listItemIndent: 'one', // Niveau d'indentation des éléments de liste
      resourceLink: true, // Utilise le format standard des liens [texte](url)
      rule: '-', // Utilise - pour les lignes horizontales
      ruleRepetition: 3, // Utilise --- pour les lignes horizontales
      setext: false, // N'utilise pas les titres setext (===)
      tightDefinitions: true, // Définitions compactes
    };

    // Configuration du processeur remark
    const result = await unified()
      .use(remarkParse)
      .use(remarkStringify, stringifyOptions)
      .process(text);

    return String(result);
  } catch (error) {
    console.error('Erreur lors du formatage markdown:', error);
    return text; // En cas d'erreur, retourne le texte non formaté
  }
};

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
  const addNote = async () => {
    if (inputText.trim() !== '') {
      const dt = new Date();
      const text = await formatMarkdownWithRemark(inputText);
      const scratch = {
        id: Date.now().toString(),
        note: text,
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
              className="font-mono"
              onChange={handleInputChange}
              value={inputText}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Prevent default to avoid newline
                  addNote();
                } else if (e.key === 'Enter' && e.shiftKey) {
                  e.preventDefault();
                  const textarea = e.currentTarget;
                  const selectionStart = textarea.selectionStart;
                  const selectionEnd = textarea.selectionEnd;

                  // Insert a newline at the current cursor position
                  const newText =
                    inputText.substring(0, selectionStart) +
                    '\n' +
                    inputText.substring(selectionEnd);

                  const formattedText = await formatMarkdownWithRemark(newText);
                  setInputText(formattedText);

                  setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(
                      selectionStart + 1,
                      selectionStart + 1,
                    );
                  }, 0);
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
                className="mb-[2px] rounded-sm border bg-white p-4 text-sm whitespace-pre-wrap"
              >
                <p className="font-mono">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ScratchNote;
