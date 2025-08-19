import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { SmileIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover";

export default function InputEmoji({
  setMessage,
}: {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-dark text-gray hover:text-green transition-colors rounded-full p-2.5 size-6 flex items-center justify-center"
          type="button"
        >
          <SmileIcon className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-none bg-transparent shadow-none"
        align="end"
        side="top"
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            setMessage((prev) => prev + emojiData.emoji);
          }}
          theme={Theme.DARK}
          height={400}
          width={350}
          previewConfig={{
            defaultEmoji: "1f60a",
            defaultCaption: "Choose an emoji",
            showPreview: true,
          }}
          searchDisabled={false}
          autoFocusSearch={false}
          lazyLoadEmojis={false}
          emojiStyle={EmojiStyle.NATIVE}
        />
      </PopoverContent>
    </Popover>
  );
}
