// src/components/sandbox/react/ScratchNoteInput.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PaperPlaneRight, ClipboardText, Trash } from '@phosphor-icons/react';
import {
  formatMarkdownWithRemark,
  compileNotesToMarkdown,
} from './utils/markdownUtils';
import {
  copyToClipboard,
} from './utils/clipboardUtils';
import pkg from '../../../../package.json';
import type { ScratchNoteData } from '@/schemas/scratchNote';
import type { Meta } from '@/schemas/meta';
import { ensureCursorVisible, isTestEnvironment } from './utils/domUtils';
import type { ArchivedNotes } from './type';

interface ScratchNoteInputProps {
  threadName: string;
  threadId: string;
  notes: ScratchNoteData[];
  setNotes: React.Dispatch<React.SetStateAction<ScratchNoteData[]>>;
  archivedNotes: ArchivedNotes[];
  setArchivedNotes: React.Dispatch<React.SetStateAction<ArchivedNotes[]>>;
}

export default function ScratchNoteInput({
  threadName,
  threadId,
  notes,
  setNotes,
  archivedNotes,
  setArchivedNotes,
}: ScratchNoteInputProps) {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const addNote = async () => {
    if (inputText.trim() !== '') {
      const dt = new Date();
      const text = await formatMarkdownWithRemark(inputText);

      // Create meta information with current package version
      const meta: Meta = {
        version: pkg.version,
      };

      const scratch = {
        id: Date.now().toString(),
        note: text,
        createdAt: dt,
        meta,
        threadId,
      } as ScratchNoteData;

      setNotes([scratch, ...notes]);
      setInputText('');
    }
  };

  // Copy notes to clipboard
  const copyNotesToClipboard = () => {
    if (!notes || notes.length === 0) return;
    const markdownContent = compileNotesToMarkdown(notes, threadName);
    copyToClipboard(markdownContent, 'Notes copied to clipboard!');
  };

  // Clear notes but keep a backup
  const clearNotes = () => {
    if (!notes || notes.length === 0) return;

    // Create markdown content for clipboard
    const markdownContent = compileNotesToMarkdown(notes, threadName);

    // Create an archive entry
    const archiveEntry: ArchivedNotes = {
      timestamp: new Date().toISOString(),
      notes: [...notes],
      sourceThreadId: threadId,
    };

    // Add to archives, keeping only the last 3
    const updatedArchives = [archiveEntry, ...archivedNotes].slice(0, 3);
    setArchivedNotes(updatedArchives);

    // Clear the current notes
    setNotes([]);

    // Copy to clipboard
    copyToClipboard(markdownContent, 'Notes cleared and copied to clipboard!');
  };

  return (
    <Card className="rounded-sm">
      <CardHeader className="pb-3">
        <CardTitle>{threadName}</CardTitle>
        <CardDescription>Take a new note</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-1">
        <Textarea
          className="h-[150px] p-1 font-mono text-xs"
          onChange={handleInputChange}
          value={inputText}
          onKeyDown={(e) => {
            if (!isTestEnvironment()) {
              setTimeout(() => ensureCursorVisible(e.currentTarget), 0);
            }
          }}
          onInput={(e) => {
            if (!isTestEnvironment()) {
              setTimeout(
                () =>
                  ensureCursorVisible(e.currentTarget as HTMLTextAreaElement),
                0,
              );
            }
          }}
        />
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyNotesToClipboard}
              title="Copy all notes to clipboard"
              disabled={!notes || notes.length === 0}
            >
              <ClipboardText size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearNotes}
              title="Clear notes (copies to clipboard and archives)"
              disabled={!notes || notes.length === 0}
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <Trash size={24} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={addNote}
            aria-label="Send note"
          >
            <PaperPlaneRight size={32} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
