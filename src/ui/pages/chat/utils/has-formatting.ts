export const hasFormatting = (text: string): boolean => {
  // Check for markdown patterns OR if the text has multiple lines (could be formatted)
  return /\*[^*]+\*|_[^_]+_|~[^~]+~|```[^`]+```|^#{1,6}\s+|^\s*-\s+|^\s*\d+\.\s+|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|\\n/.test(text) || text.includes('\n') || text.length > 100;
};
