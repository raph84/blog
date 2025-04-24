// src/components/sandbox/react/utils/domUtils.ts
// Helper to detect if we're in a test environment
export const isTestEnvironment = (): boolean => {
  return (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Node.js') ||
    window.navigator.userAgent.includes('jsdom')
  );
};

// Helper function to ensure the cursor is visible by scrolling the textarea
export const ensureCursorVisible = (textarea: HTMLTextAreaElement): void => {
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
