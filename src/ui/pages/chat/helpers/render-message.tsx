import { formatMessage } from "../utils/format-message";
import { hasFormatting } from "../utils/has-formatting";


export const renderMessage = ({
  text,
  isOwn,
}: {
  text: string;
  isOwn: boolean;
}) => {
  // Parse mentions directly from the message text
  const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
  const hasMentions = mentionRegex.test(text);
  
  if (!hasMentions && !hasFormatting(text)) return text;

  let mentionElements: React.ReactNode[] = [];

  if (hasMentions) {
    // Reset regex to find all matches
    const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
    const parsedMentions: Array<{ name: string; id: string; match: string }> = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      parsedMentions.push({
        name: match[1],
        id: match[2],
        match: match[0]
      });
    }

    if (parsedMentions.length > 0) {
      // Replace mentions in the original text
      let textWithMentions = text;
      parsedMentions.forEach((mention, index) => {
        const mentionPattern = new RegExp(`@\\[${mention.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\(${mention.id}\\)`, 'g');
        textWithMentions = textWithMentions.replace(mentionPattern, `__MENTION_${index}__`);
      });

      // Split text and create elements
      const parts = textWithMentions.split(/(__MENTION_\d+__)/);
      parts.forEach((part, index) => {
        const mentionMatch = part.match(/^__MENTION_(\d+)__$/);
        if (mentionMatch) {
          const mentionIndex = parseInt(mentionMatch[1]);
          const mention = parsedMentions[mentionIndex];
          mentionElements.push(
            <span
              key={`mention-${index}`}
              className={`mention-highlight ${
                isOwn ? "text-white" : "text-blue-600"
              } font-medium`}
            >
              @{mention.name}
            </span>
          );
        } else if (part) {
          mentionElements.push(part);
        }
      });
    } else {
      mentionElements = [text];
    }
  } else {
    mentionElements = [text];
  }

  return mentionElements.map((element, index) => {
    if (typeof element === "string") {
      const formattedHtml = formatMessage(element);
      return (
        <div 
          key={index}
          className="formatted-message"
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      );
    }
    return element;
  });
};
