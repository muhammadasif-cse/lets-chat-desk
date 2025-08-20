import { formatMessage } from "./format-message";
import { hasFormatting } from "./has-formatting";

export const renderMessage = ({
  text,
  mentions,
  isOwn,
}: {
  text: string;
  mentions: Array<{ start: number; length: number; name: string }>;
  isOwn: boolean;
}) => {
  if (!mentions.length && !hasFormatting(text)) return text;

  let processedText = text;
  let mentionElements: React.ReactNode[] = [];

  if (mentions.length > 0) {
    let lastIndex = 0;
    mentions.forEach((mention, index) => {
      if (mention.start > lastIndex) {
        mentionElements.push(processedText.slice(lastIndex, mention.start));
      }
      mentionElements.push(
        <span
          key={`mention-${index}`}
          className={`mention-highlight ${
            isOwn ? "text-white" : "text-blue"
          } font-medium`}
        >
          @{mention.name}
        </span>
      );
      lastIndex = mention.start + mention.length;
    });

    if (lastIndex < processedText.length) {
      mentionElements.push(processedText.slice(lastIndex));
    }
  } else {
    mentionElements = [processedText];
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
