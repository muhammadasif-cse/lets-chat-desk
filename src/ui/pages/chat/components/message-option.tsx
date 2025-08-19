import { MoreVerticalIcon, ReplyIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export default function messageOption({
  isOwn,
  onReply,
}: {
  isOwn: boolean;
  onReply?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-dark3/80 hover:bg-dark3 text-gray hover:text-light rounded-full backdrop-blur-sm border border-dark2"
        >
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isOwn ? "end" : "start"}
        className="bg-dark3 border-dark2 text-light shadow-lg z-50"
        sideOffset={5}
      >
        {onReply && (
          <DropdownMenuItem
            onClick={onReply}
            className="hover:bg-dark2 focus:bg-dark2 cursor-pointer text-light"
          >
            <ReplyIcon className="mr-2 h-4 w-4" />
            Reply
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="hover:bg-dark2 focus:bg-dark2 cursor-pointer text-light">
          Copy
        </DropdownMenuItem>
        {isOwn && (
          <DropdownMenuItem className="hover:bg-dark2 focus:bg-dark2 cursor-pointer text-danger">
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
