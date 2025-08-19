import { useMemo } from "react";

interface IMessagePreviewProps {
  message?: string;
  lastMessage?: string;
  isTyping?: boolean;
  hasUnreadMessages: boolean;
  isGroup: boolean;
}

interface IMessagePreviewResult {
  text: string;
  className: string;
  isTyping?: boolean;
}

const MessagePreview = ({
  message,
  lastMessage,
  isTyping,
  hasUnreadMessages,
  isGroup,
}: IMessagePreviewProps) => {
  const preview: IMessagePreviewResult = useMemo(() => {
    if (isTyping) {
      return {
        text: "typing...",
        className: "text-green2 italic",
        isTyping: true,
      };
    }

    let messageText = message || lastMessage || "No messages yet";

    if (messageText === "Attachment(s)" || messageText.includes("📎")) {
      return {
        text: "🗃️ Document(s)",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (messageText.includes("📷") || messageText === "Photo") {
      return {
        text: "📷 Photo(s)",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (messageText.includes("🎵") || messageText.includes("audio")) {
      return {
        text: "🎵 Audio(s)",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (messageText.includes("@[")) {
      const mentionMatch = messageText.match(/@\[(.+?)\]\((\d+)\)/);
      if (mentionMatch) {
        const mentionName = mentionMatch[1];
        return {
          text: `@${mentionName}`,
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      }
      return {
        text: "@mention",
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (messageText.startsWith("http")) {
      try {
        const url = new URL(messageText);
        return {
          text: `🔗 ${url.hostname}`,
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      } catch {
        return {
          text: "🔗 Link",
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      }
    }

    if (isGroup && messageText.includes(":")) {
      const parts = messageText.split(":");
      const sender = parts[0];
      const content = parts.slice(1).join(":").trim();

      if (content.length > 30) {
        return {
          text: `${sender}: ${content.substring(0, 30)}...`,
          className: hasUnreadMessages ? "text-light" : "text-gray",
        };
      }

      return {
        text: messageText,
        className: hasUnreadMessages ? "text-light" : "text-gray",
      };
    }

    if (messageText.length > 35) {
      messageText = messageText.substring(0, 35) + "...";
    }

    return {
      text: messageText,
      className: hasUnreadMessages ? "text-light" : "text-gray",
    };
  }, [message, lastMessage, isTyping, hasUnreadMessages, isGroup]);

  return (
    <>
      {preview.isTyping && (
        <div className="flex space-x-0.5 mr-1">
          <div className="w-1 h-1 bg-green2 rounded-full animate-bounce"></div>
          <div
            className="w-1 h-1 bg-green2 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-1 h-1 bg-green2 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      )}

      <p className={`text-sm truncate ${preview.className}`}>{preview.text}</p>
    </>
  );
};

export default MessagePreview;
