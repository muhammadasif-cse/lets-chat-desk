import { FileIcon, MonitorIcon, PlusIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover";

export default function InputFileOption({
  handleAttachment,
}: {
  handleAttachment: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-dark p-2.5 text-gray hover:text-green transition-colors rounded-full size-6 flex items-center justify-center"
          type="button"
        >
          <PlusIcon className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-dark2 w-auto border border-dark3 px-3 py-1"
        align="start"
        side="top"
        sideOffset={10}
      >
        <div className="space-y-1">
          <button
            className="w-full p-2 -ml-2 flex items-center gap-3 text-gray hover:text-white hover:bg-dark rounded transition-colors whitespace-nowrap"
            onClick={handleAttachment}
          >
            <FileIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-medium">Document</span>
          </button>
          <button
            className="w-full p-2 -ml-2 flex items-center gap-3 text-gray hover:text-white hover:bg-dark rounded transition-colors whitespace-nowrap"
            onClick={handleAttachment}
          >
            <MonitorIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-medium">Photos & Videos</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
