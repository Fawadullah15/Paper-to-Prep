/**
 * Accurately counts whitespace-delimited words in a string.
 * Strips markdown formatting symbols that are not words.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // Clean markdown bold/italic asterisks or backticks while keeping hyphenated/compound words
  const cleaned = text
    .replace(/[*_#`~]/g, ' ')
    .trim();
  
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(w => Boolean(w && w.length > 0)).length;
}

/**
 * Returns list of words
 */
export function getWords(text: string): string[] {
  if (!text) return [];
  const cleaned = text
    .replace(/[*_#`~]/g, ' ')
    .trim();
  if (!cleaned) return [];
  return cleaned.split(/\s+/).filter(Boolean);
}

/**
 * Validates that an English summary is strictly 50 words.
 */
export function validate50Words(summary: string): { isValid: boolean; count: number; difference: number } {
  const count = countWords(summary);
  return {
    isValid: count === 50,
    count,
    difference: count - 50,
  };
}
