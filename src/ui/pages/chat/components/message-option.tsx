import { ChevronDownIcon, CopyIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export default function messageOption({
  isOwn,
  onReply,
  onDropdownChange,
}: {
  isOwn: boolean;
  onReply?: () => void;
  onDropdownChange?: (isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onDropdownChange?.(open);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger>
        <button
          className={`h-8 w-8 bg-transparent group-hover:bg-[radial-gradient(circle,_rgba(0,0,0,0.3)_0%,_transparent_80%)]
             group-hover:rounded-tr-xl transition-all duration-500 text-light p-1 -ml-0.5 -mr-2 -mt-1 ${
               isOpen &&
               "bg-[radial-gradient(circle,_rgba(0,0,0,0.3)_0%,_transparent_80%)] rounded-tr-xl"
             }`}
        >
          <ChevronDownIcon className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isOwn ? "end" : "start"}
        className="bg-dark3 border-dark2 text-light shadow-lg z-50"
        sideOffset={8}
      >
        {onReply && (
          <DropdownMenuItem
            onClick={onReply}
            className="hover:bg-dark focus:bg-dark cursor-pointer text-light"
          >
            <ReplyIcon className="size-4 text-light" />
            <span className="font-medium text-light">Reply</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="hover:bg-dark focus:bg-dark cursor-pointer text-light">
          <CopyIcon className="size-4 text-light" />
          <span className="font-medium text-light">Copy</span>
        </DropdownMenuItem>
        {isOwn && (
          <DropdownMenuItem className="hover:bg-danger focus:bg-danger cursor-pointer">
            <Trash2Icon className="size-4 text-light" />
            <span className="font-medium text-light">Delete</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
