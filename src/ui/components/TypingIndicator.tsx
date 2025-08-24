import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-green rounded-full animate-bounce"></div>
        <div 
          className="w-2 h-2 bg-green rounded-full animate-bounce" 
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div 
          className="w-2 h-2 bg-green rounded-full animate-bounce" 
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
