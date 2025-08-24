import { IMessageAttachment } from "../../../../interfaces/chat";
import { buildFileUrl } from "../../../../lib/utils/file-url-builder";

export const processAttachments = (
  attachments: any[]
): IMessageAttachment[] => {
  if (!attachments || attachments.length === 0) return [];

  return attachments.map((attachment) => {
    const fileName = attachment.fileName || attachment.name || "";
    const filePath = attachment.filePath || attachment.url || "";

    const getFileType = (
      fileName: string
    ): "image" | "video" | "audio" | "document" => {
      const ext = fileName.toLowerCase().split(".").pop() || "";

      if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) {
        return "image";
      }
      if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(ext)) {
        return "video";
      }
      if (["mp3", "wav", "aac", "ogg", "flac", "m4a"].includes(ext)) {
        return "audio";
      }
      return "document";
    };

    return {
      fileId: attachment.fileId,
      fileName,
      filePath,
      type: getFileType(fileName),
      url: buildFileUrl(filePath),
      size: attachment.size,
      duration: attachment.duration,
    };
  });
};
