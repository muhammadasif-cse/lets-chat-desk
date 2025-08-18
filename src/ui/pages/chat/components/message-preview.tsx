import React from "react";
import { cn } from "../../../../lib/utils";
import { parseMessage } from "../utils/parse-message";

interface MessagePreviewProps {
  messageData: {
    text: string | null;
    className: string;
    emoji?: string;
  };
  chat: any;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  messageData,
  chat,
}) => {
  const { text, className, emoji } = messageData;
  return (
    <div className="flex items-center gap-1">
      {emoji && (
        <span className="text-xs font-normal leading-5 text-[#FAFAFA] sm:text-sm">
          {emoji}
        </span>
      )}

      <p
        className={cn(
          "truncate text-xs font-normal leading-5 text-[#FAFAFA] sm:text-sm",
          className
        )}
      >
        {parseMessage(text || "").map((part, index) => {
          if (part.type === "mention") {
            return (
              <span key={index} className="text-blue-500">
                @{part.value}
              </span>
            );
          }
          return <span key={index}>{part.value}</span>;
        })}
      </p>
    </div>
  );
};

export default MessagePreview;
