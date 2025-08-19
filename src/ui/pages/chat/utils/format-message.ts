export const formatMessage = (text: string): string => {
  return (
    text
      // Bold: *text*
      .replace(/\*([^*]+)\*/g, '<strong class="font-bold">$1</strong>')
      // Italic: _text_
      .replace(/_([^_]+)_/g, '<em class="italic">$1</em>')
      // Strikethrough: ~text~
      .replace(/~([^~]+)~/g, '<span class="line-through">$1</span>')
      // Code: ```text```
      .replace(
        /```([^`]+)```/g,
        '<code class="bg-dark2 px-1 rounded text-green font-mono text-sm">$1</code>'
      )
  );
};
