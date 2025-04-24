// src/components/sandbox/react/utils/clipboardUtils.ts
import { isTestEnvironment } from './domUtils';

export const copyToClipboard = (
  content: string,
  successMessage: string = 'Copied to clipboard!',
): void => {
  if (isTestEnvironment()) return;

  navigator.clipboard
    .writeText(content)
    .then(() => {
      alert(successMessage);
    })
    .catch((err) => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard.');
    });
};
