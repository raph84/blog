// src/components/sandbox/react/utils/markdownUtils.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { ScratchNoteData } from '@/schemas/scratchNote';

export const formatMarkdownWithRemark = async (
  text: string,
): Promise<string> => {
  try {
    // Skip formatting if the text is empty or only contains whitespace/newlines
    if (!text.trim()) {
      return text; // Preserve empty lines and whitespace
    }

    // Define options as a separate object with the correct type
    const stringifyOptions: RemarkStringifyOptions = {
      bullet: '-', // Use - for bullet lists
      emphasis: '*', // Use * for italics
      strong: '**', // Use ** for bold
      fence: '```', // Use ``` for code blocks
      fences: true, // Enable code blocks with ```
      incrementListMarker: true, // Increment numbered list markers
      listItemIndent: 'one', // Indentation level for list items
      resourceLink: true, // Use standard link format [text](url)
      rule: '-', // Use - for horizontal lines
      ruleRepetition: 3, // Use --- for horizontal lines
      setext: false, // Don't use setext headers (===)
      tightDefinitions: true, // Compact definitions
    };

    // Configure remark processor
    const result = await unified()
      .use(remarkParse)
      .use(remarkStringify, stringifyOptions)
      .process(text);

    return String(result);
  } catch (error) {
    console.error('Error formatting markdown:', error);
    return text; // In case of error, return unformatted text
  }
};

export const compileNotesToMarkdown = (
  notes: ScratchNoteData[],
  threadName: string,
): string => {
  if (!notes || notes.length === 0) return '';

  // Group notes by date
  const groupedNotes: Record<string, ScratchNoteData[]> = {};

  notes.forEach((note) => {
    // Convert to local date string, just take the date part (YYYY-MM-DD)
    const date = new Date(note.createdAt).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format

    if (!groupedNotes[date]) {
      groupedNotes[date] = [];
    }

    groupedNotes[date].push(note);
  });

  // Create markdown content with date headers
  let markdownContent = '';

  // Add thread name as title
  markdownContent += `# ${threadName}\n\n`;

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedNotes).sort().reverse();

  sortedDates.forEach((date) => {
    markdownContent += `## ${date}\n\n`;

    // Add each note under this date
    groupedNotes[date].forEach((note) => {
      // Process the note to increase heading levels if they exist
      let processedNote = note.note;

      // Check if the note contains headings (lines starting with #)
      processedNote = processedNote.replace(
        /^(#{1,4}) (.+)$/gm,
        (match, hashes, text) => {
          // Add two more # to the heading to make it a sublevel of the date heading
          return `${hashes}## ${text}`;
        },
      );

      markdownContent += `${processedNote}\n\n`;
    });
  });

  return markdownContent;
};
