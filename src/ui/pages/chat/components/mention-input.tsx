import React, { useCallback, useEffect, useRef } from "react";
import { Mention, MentionsInput, OnChangeHandlerFunc } from "react-mentions";
import { IMentionInputProps } from "../../../../interfaces/mention-input";
import {
  enhancedDisplayMentionStyle,
  enhancedMentionStyle,
} from "../../../styles/mention.style";

const MentionInputComponent: React.FC<IMentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message",
  users = [],
  disabled = false,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mentionUsers = users
    .filter((user) => user.type === "user")
    .map((user) => ({
      id: user.id,
      display: user.name,
      avatar: user.photo,
    }));

  const renderMentionSuggestion = (
    suggestion: any,
    search: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean
  ) => (
    <div className="flex items-center gap-3 w-full">
      <div className="text-gray2 text-sm font-medium truncate">
        {highlightedDisplay}
      </div>
    </div>
  );

  const handleMentionChange: OnChangeHandlerFunc = useCallback(
    (event, newValue, newPlainTextValue, mentions) => {
      const formattedValue = applyFormatting(newValue);

      const extractedMentions = mentions.map((mention) => ({
        id: mention.id,
        name: mention.display,
        start: mention.plainTextIndex,
        length: mention.display.length + 1,
      }));

      onChange(formattedValue, extractedMentions);
    },
    [onChange]
  );

  const applyFormatting = (text: string): string => {
    return text;
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 128);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  return (
    <div className="mention-input-wrapper w-full">
      <MentionsInput
        value={value}
        onChange={handleMentionChange}
        style={enhancedMentionStyle}
        placeholder={placeholder}
        disabled={disabled}
        allowSpaceInQuery={false}
        a11ySuggestionsListLabel="Suggested mentions"
        inputRef={inputRef}
        onKeyDown={handleKeyDown}
        forceSuggestionsAboveCursor={true}
        allowSuggestionsAboveCursor={true}
      >
        <Mention
          trigger="@"
          data={mentionUsers}
          style={enhancedDisplayMentionStyle}
          renderSuggestion={renderMentionSuggestion}
          appendSpaceOnAdd={true}
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>
    </div>
  );
};

export default MentionInputComponent;
