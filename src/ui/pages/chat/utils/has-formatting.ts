export const hasFormatting = (text: string): boolean => {
  return /\*[^*]+\*|_[^_]+_|~[^~]+~|```[^`]+```/.test(text);
};
