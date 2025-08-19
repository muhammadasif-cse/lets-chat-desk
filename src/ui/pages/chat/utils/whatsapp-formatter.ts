import React from 'react';

export interface FormattedTextPart {
  type: 'text' | 'bold' | 'italic' | 'strikethrough' | 'code' | 'mention';
  content: string;
  mentionId?: string;
}

/**
 * Parse WhatsApp-style formatting in text
 * Supports: *bold*, _italic_, ~strikethrough~, ```code```
 */
export function parseWhatsAppFormatting(text: string, mentions: Array<{ id: string; name: string; start: number; length: number }> = []): FormattedTextPart[] {
  const parts: FormattedTextPart[] = [];
  
  // Sort mentions by start position
  const sortedMentions = [...mentions].sort((a, b) => a.start - b.start);
  
  let currentIndex = 0;
  
  // Process mentions first
  for (const mention of sortedMentions) {
    // Add text before mention
    if (mention.start > currentIndex) {
      const textBefore = text.slice(currentIndex, mention.start);
      parts.push(...parseFormattingInText(textBefore));
    }
    
    // Add mention
    parts.push({
      type: 'mention',
      content: `@${mention.name}`,
      mentionId: mention.id,
    });
    
    currentIndex = mention.start + mention.length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    parts.push(...parseFormattingInText(remainingText));
  }
  
  return parts;
}

/**
 * Parse formatting in a text segment (without mentions)
 */
function parseFormattingInText(text: string): FormattedTextPart[] {
  const parts: FormattedTextPart[] = [];
  
  // Regular expressions for WhatsApp formatting
  const patterns = [
    { type: 'code' as const, regex: /```([^`]+)```/g },
    { type: 'bold' as const, regex: /\*([^*]+)\*/g },
    { type: 'italic' as const, regex: /_([^_]+)_/g },
    { type: 'strikethrough' as const, regex: /~([^~]+)~/g },
  ];
  
  let remainingText = text;
  let processedParts: Array<{ type: FormattedTextPart['type']; content: string; start: number; end: number }> = [];
  
  // Find all formatting matches
  for (const pattern of patterns) {
    const matches = Array.from(remainingText.matchAll(pattern.regex));
    for (const match of matches) {
      if (match.index !== undefined) {
        processedParts.push({
          type: pattern.type,
          content: match[1], // Content without formatting markers
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }
  }
  
  // Sort by start position
  processedParts.sort((a, b) => a.start - b.start);
  
  // Resolve overlapping matches (first match wins)
  const validParts: typeof processedParts = [];
  let lastEnd = 0;
  
  for (const part of processedParts) {
    if (part.start >= lastEnd) {
      validParts.push(part);
      lastEnd = part.end;
    }
  }
  
  // Build final parts array
  let currentPos = 0;
  
  for (const part of validParts) {
    // Add plain text before formatted part
    if (part.start > currentPos) {
      const plainText = text.slice(currentPos, part.start);
      if (plainText) {
        parts.push({ type: 'text', content: plainText });
      }
    }
    
    // Add formatted part
    parts.push({ type: part.type, content: part.content });
    currentPos = part.end;
  }
  
  // Add remaining plain text
  if (currentPos < text.length) {
    const remainingPlainText = text.slice(currentPos);
    if (remainingPlainText) {
      parts.push({ type: 'text', content: remainingPlainText });
    }
  }
  
  // If no formatting was found, return the entire text as plain
  if (parts.length === 0 && text) {
    parts.push({ type: 'text', content: text });
  }
  
  return parts;
}

/**
 * Render formatted text parts as React elements
 */
export function renderFormattedText(parts: FormattedTextPart[]): React.ReactNode[] {
  return parts.map((part, index) => {
    const key = `${part.type}-${index}`;
    
    switch (part.type) {
      case 'bold':
        return React.createElement('strong', { key, className: 'font-semibold' }, part.content);
      
      case 'italic':
        return React.createElement('em', { key, className: 'italic' }, part.content);
      
      case 'strikethrough':
        return React.createElement('span', { key, className: 'line-through' }, part.content);
      
      case 'code':
        return React.createElement('code', { 
          key, 
          className: 'bg-gray-700 text-green-300 px-1 py-0.5 rounded text-sm font-mono' 
        }, part.content);
      
      case 'mention':
        return React.createElement('span', { 
          key, 
          className: 'bg-green-700 text-white px-1 py-0.5 rounded font-medium',
          'data-mention-id': part.mentionId 
        }, part.content);
      
      case 'text':
      default:
        return part.content;
    }
  });
}

/**
 * Complete formatting function that combines parsing and rendering
 */
export function formatWhatsAppMessage(
  text: string, 
  mentions: Array<{ id: string; name: string; start: number; length: number }> = []
): React.ReactNode[] {
  const parts = parseWhatsAppFormatting(text, mentions);
  return renderFormattedText(parts);
}
