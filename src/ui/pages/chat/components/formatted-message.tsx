import React from 'react';
import { formatWhatsAppMessage } from '../utils/whatsapp-formatter';

interface FormattedMessageProps {
  text: string;
  mentions?: Array<{ id: string; name: string; start: number; length: number }>;
  className?: string;
}

/**
 * component to display messages with WhatsApp-style formatting and mentions
 * use this in your message components to display formatted text
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({
  text,
  mentions = [],
  className = "",
}) => {
  const formattedContent = formatWhatsAppMessage(text, mentions);
  
  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {formattedContent}
    </div>
  );
};

export default FormattedMessage;
