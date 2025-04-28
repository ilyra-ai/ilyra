import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Search, Lightbulb } from 'lucide-react'; // Added Search, Lightbulb
import { useApp } from '../../context/AppContext';
import { getInputPlaceholder } from '../../utils/helpers';

const ChatInput: React.FC = () => {
  const { sendMessage, isWaitingForResponse, selectedModel, user } = useApp(); // Get user
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isWaitingForResponse && user) { // Ensure user is logged in
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Arquivo selecionado para upload (simulado):", file.name);
      alert(`Simulado: Arquivo "${file.name}" pronto para upload. A funcionalidade de upload real depende do backend.`);
      // In a real app, you would handle the file upload here, likely sending it to the backend
    }
  };


  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      // Set height based on scroll height, capped at max-h-32 (defined by Tailwind class)
      const maxHeight = 128; // 32 * 4 (assuming base font size leads to 4px line height) - adjust if needed
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  return (
    // Use theme-aware background and border colors
    <div className="p-4 border-t border-border bg-background sticky bottom-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Use theme-aware input container styles */}
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getInputPlaceholder(selectedModel)}
            rows={1}
            disabled={isWaitingForResponse || !user} // Disable if not logged in
            // Use theme-aware text color and ensure max-height works
            className="w-full resize-none bg-transparent focus:outline-none py-1 max-h-32 text-text overflow-y-auto"
          />
          <div className="flex items-center gap-1 pl-2"> {/* Reduced gap */}
            {/* File Upload Button - Use theme-aware hover background */}
            <label className={`p-2 rounded-full ${user ? 'hover:bg-card' : 'cursor-not-allowed opacity-50'}`} aria-label="Anexar arquivo">
              <Paperclip size={18} className="text-text/70" />
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={!user || isWaitingForResponse} />
            </label>
            {/* Search Button (Placeholder) - Use theme-aware hover background */}
            <button
              type="button"
              className={`p-2 rounded-full ${user ? 'hover:bg-card' : 'cursor-not-allowed opacity-50'}`}
              aria-label="Pesquisar"
              disabled={!user || isWaitingForResponse}
            >
              <Search size={18} className="text-text/70" />
            </button>
            {/* Lightbulb Button (Placeholder) - Use theme-aware hover background */}
             <button
              type="button"
              className={`p-2 rounded-full ${user ? 'hover:bg-card' : 'cursor-not-allowed opacity-50'}`}
              aria-label="Sugestões"
              disabled={!user || isWaitingForResponse}
            >
              <Lightbulb size={18} className="text-text/70" />
            </button>
            {/* Send Button - Use theme-aware primary color */}
            <button
              type="submit"
              className={`p-2 rounded-full transition-colors ${
                message.trim() && !isWaitingForResponse && user
                  ? 'bg-primary text-white hover:bg-primary-light'
                  : 'bg-primary/30 text-white cursor-not-allowed'
              }`}
              disabled={!message.trim() || isWaitingForResponse || !user}
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        {/* Disclaimer - Use theme-aware text color */}
        <div className="text-center mt-2 text-xs text-text/50 px-2">
          <p>A iLyra pode gerar informações incorretas. Verifique fatos importantes.</p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
