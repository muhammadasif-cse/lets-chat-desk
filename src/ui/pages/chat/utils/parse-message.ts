interface ParsedPart {
  type: "text" | "mention" | "url";
  value: string;
  userId?: string;
}

const isValidUrl = (text: string): boolean => {
  const trimmedText = text.trim();
  if (!trimmedText) return false;

  const cleanText = trimmedText.replace(/[.,;!?]+$/, "");

  try {
    new URL(cleanText.includes("://") ? cleanText : `https://${cleanText}`);
    return true;
  } catch {}

  const urlPatterns = [
    /^https?:\/\/\S+$/i,
    /^www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/,
    /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/,
  ];

  return urlPatterns.some((pattern) => pattern.test(cleanText));
};

export function parseMessage(message: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  let lastIndex = 0;

  const urlRegex =
    /\b(https?:\/\/[^\s"'<>\[\]{}|\\^`]*(?:\([^\s"'<>\[\]{}|\\^`]*\))?[^\s"'<>\[\]{}|\\^`]*)/gi;

  const combinedRegex =
    /(@\[([^\]]+)\]\(([^)]+)\))|(\b(https?:\/\/[^\s"'<>\[\]{}|\\^`]*(?:\([^\s"'<>\[\]{}|\\^`]*\))?[^\s"'<>\[\]{}|\\^`]*))/gi;

  let match: RegExpExecArray | null;
  while ((match = combinedRegex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: message.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      parts.push({
        type: "mention",
        value: match[2],
        userId: match[3],
      });
    } else if (match[4]) {
      const urlCandidate = match[4];
      const cleanUrl = urlCandidate.replace(/[.,;!?]+$/, "");

      if (isValidUrl(cleanUrl)) {
        parts.push({ type: "url", value: cleanUrl });
      } else {
        parts.push({ type: "text", value: urlCandidate });
      }
    }

    lastIndex = combinedRegex.lastIndex;
  }

  if (lastIndex < message.length) {
    parts.push({ type: "text", value: message.slice(lastIndex) });
  }

  return parts;
}
