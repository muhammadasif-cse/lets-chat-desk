import { FileIcon, ImageIcon, VideoIcon, VolumeIcon } from "lucide-react";

export const renderReply = ({
  replyTo,
  isOwn,
  attachments = [],
}: {
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  isOwn: boolean;
  attachments?: any[];
}) => {
  if (!replyTo) return null;

  const getAttachmentIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop() || "";
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-3 h-3" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) {
      return <VideoIcon className="w-3 h-3" />;
    }
    if (['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'].includes(ext)) {
      return <VolumeIcon className="w-3 h-3" />;
    }
    return <FileIcon className="w-3 h-3" />;
  };

  const hasAttachments = attachments && attachments.length > 0;
  const displayText = replyTo.text || (hasAttachments ? `${attachments.length} attachment${attachments.length > 1 ? 's' : ''}` : 'Message');

  return (
    <div
      className={`rounded-md border-l-4 border-green p-3 py-2 mb-2 ${
        isOwn ? "bg-dark2/50" : "bg-dark4/50"
      }`}
    >
      {/* <div className="text-green text-xs font-medium mb-1">
        {replyTo.senderName}
      </div> */}
      <div className="text-gray2 text-xs leading-tight">
        {hasAttachments && !replyTo.text && (
          <div className="flex items-center gap-1 mb-1">
            {getAttachmentIcon(attachments[0]?.fileName || "")}
            <span className="truncate">{displayText}</span>
          </div>
        )}
        {replyTo.text && (
          <div className="truncate">{replyTo.text}</div>
        )}
        {hasAttachments && replyTo.text && (
          <div className="flex items-center gap-1 mt-1 text-gray2/70">
            {getAttachmentIcon(attachments[0]?.fileName || "")}
            <span className="text-xs">{attachments.length} attachment{attachments.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
