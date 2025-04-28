import React from 'react';
import { Message } from '../../types';
import { User, Zap, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { formatDate } from '../../utils/helpers';
import { marked } from 'marked'; // Import marked

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system'; // Handle system messages (e.g., errors)

  // Use marked to render markdown content, handle potential errors
  let renderedContent = '';
  try {
    // Ensure content is a string before parsing
    const contentToParse = typeof message.content === 'string' ? message.content : String(message.content);
    renderedContent = marked(contentToParse) as string; // Cast to string
  } catch (error) {
    console.error("Error parsing markdown:", error);
    renderedContent = `<p>Erro ao renderizar mensagem: ${message.content}</p>`; // Fallback
  }


  const getIcon = () => {
    if (isUser) {
      return (
        // Use theme-aware primary color
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <User size={16} />
        </div>
      );
    } else if (isAssistant) {
      return (
        // Use theme-aware secondary color
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
          <Zap size={16} />
        </div>
      );
    } else if (isSystem) {
       return (
        // Use theme-aware error color
        <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center text-error">
          <AlertTriangle size={16} />
        </div>
      );
    }
    return null; // Should not happen
  };

  const getMessageStyle = () => {
    // Use theme-aware classes defined in index.css
    if (isUser) return 'user-message'; // bg-card/50
    if (isAssistant) return 'assistant-message'; // bg-background
    if (isSystem) return 'bg-error/10'; // Style for system/error messages
    return '';
  };

  const getDisplayName = () => {
    if (isUser) return 'Você';
    if (isAssistant) return 'iLyra';
    if (isSystem) return 'Sistema';
    return '';
  };

  return (
    // chat-message applies base padding and flex layout
    <div className={`chat-message ${getMessageStyle()}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          {/* Use theme-aware text color, with specific error color for system messages */}
          <span className={`font-medium text-sm ${isSystem ? 'text-error' : 'text-text'}`}>
            {getDisplayName()}
          </span>
          {/* Use theme-aware text color for timestamp */}
          <span className="ml-2 text-xs text-text/50">
            {formatDate(message.timestamp)}
          </span>
        </div>
        {/* Render HTML from markdown using theme-aware prose styles defined in index.css */}
        <div className={`message-content ${isSystem ? 'text-error' : ''}`} dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </div>
    </div>
  );
};

export default ChatMessage;
