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

// Helper to detect if we're in a test environment
const isTestEnvironment = () => {
  return (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Node.js') ||
    window.navigator.userAgent.includes('jsdom')
  );
};

const formatMarkdownWithRemark = async (text: string): Promise<string> => {
  try {
    // Skip formatting if the text is empty or only contains whitespace/newlines
    if (!text.trim()) {
      return text; // Preserve empty lines and whitespace
    }

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

  // Improved function to handle Shift+Enter
  const handleShiftEnter = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    const textarea = e.currentTarget;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Directly insert a newline character at the cursor position
    const newText =
      inputText.substring(0, selectionStart) +
      '\n' +
      inputText.substring(selectionEnd);

    // Set the input text directly without formatting for newline operations
    setInputText(newText);

    // Use setTimeout to focus, set cursor position, and scroll to cursor after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);

      // Ensure the cursor is visible by scrolling to it
      ensureCursorVisible(textarea);
    }, 0);
  };

  // Helper function to ensure the cursor is visible by scrolling the textarea
  const ensureCursorVisible = (textarea: HTMLTextAreaElement) => {
    // Skip in test environment to avoid JSDOM issues
    if (isTestEnvironment()) {
      return;
    }

    try {
      // Get the line height (approximate)
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const paddingTop = parseInt(computedStyle.paddingTop) || 0;
      const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;

      // Calculate the cursor's position
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const lineCount = (textBeforeCursor.match(/\n/g) || []).length;

      // Calculate the approximate position of the cursor
      const cursorY = lineCount * lineHeight;

      // Add a buffer to ensure the full line is visible (not just the cursor)
      const bufferSpace = lineHeight;

      // If the cursor would be outside the visible area, scroll to it
      if (cursorY < textarea.scrollTop + paddingTop) {
        // Cursor is above visible area - scroll up to show it with buffer space
        textarea.scrollTop = Math.max(0, cursorY - bufferSpace);
      } else if (
        cursorY >
        textarea.scrollTop + textarea.clientHeight - paddingBottom - lineHeight
      ) {
        // Cursor is below visible area - scroll down to show it with buffer space
        textarea.scrollTop =
          cursorY -
          textarea.clientHeight +
          lineHeight +
          bufferSpace +
          paddingBottom;
      }
    } catch (error) {
      // Silently fail in case of any issues with scrolling
      console.debug('Error ensuring cursor visibility:', error);
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
              className="h-[150px] font-mono text-xs"
              onChange={handleInputChange}
              value={inputText}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Prevent default to avoid newline
                  addNote();
                } else if (e.key === 'Enter' && e.shiftKey) {
                  // Use the improved Shift+Enter handler
                  handleShiftEnter(e);
                } else {
                  // For any other key press, ensure cursor is visible after a short delay
                  // This handles normal typing when the text is long
                  if (!isTestEnvironment()) {
                    setTimeout(() => ensureCursorVisible(e.currentTarget), 0);
                  }
                }
              }}
              // Also handle input events for paste operations
              onInput={(e) => {
                if (!isTestEnvironment()) {
                  setTimeout(
                    () =>
                      ensureCursorVisible(
                        e.currentTarget as HTMLTextAreaElement,
                      ),
                    0,
                  );
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
