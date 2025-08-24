/**
 * Utility to build file URLs for chat attachments
 */

export const buildFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // If it's already a full URL or blob URL, return as is
  if (filePath.startsWith('http') || filePath.startsWith('blob:')) {
    return filePath;
  }

  // Handle full paths from API response like "/documentfiles/DMS/ChatAttachment/filename.ext"
  let fileName = filePath;
  if (filePath.includes('/')) {
    // Extract just the filename from the full path
    fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  }

  // Use your actual media server URL structure
  const mediaBaseUrl = 'https://media.intertechbd.com/attachment';
  
  return `${mediaBaseUrl}/${fileName}`;
};

export const buildAttachmentDownloadUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  const baseUrl = (import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}/chatservice/chats/downloadAttachment/${filePath}`;
};
