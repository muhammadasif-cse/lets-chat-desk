import { XIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function inputReplyRender({
  replyTo,
  onCancelReply,
}: {
  replyTo: any;
  onCancelReply?: () => void;
}) {
  return (
    <div className="mx-8 my-2 bg-dark3/80 backdrop-blur-sm border-l-4 border-green pl-3 py-2 rounded flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="text-green text-sm font-medium mb-1">
          Replying to {replyTo.senderName}
        </div>
        <div className="text-gray text-sm truncate">{replyTo.text}</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 hover:bg-dark3 text-gray hover:text-gray2 ml-2"
        onClick={onCancelReply}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
