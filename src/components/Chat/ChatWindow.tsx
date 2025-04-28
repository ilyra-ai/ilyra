import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import { BrainCircuit, Loader2 } from 'lucide-react';
import PlansModal from '../../pages/PlansModal';

const ChatWindow: React.FC = () => {
  // Use theme from context to potentially apply theme-specific classes if needed,
  // but rely primarily on theme-aware classes like bg-background, text-text, etc.
  // MODIFIED: Get plans from context
  const { currentConversation, isWaitingForResponse, showPlansModal, setShowPlansModal, user, freeMessageCount, platformSettings, theme, plans } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages]);

  // Check if messages are currently loading for the current conversation
  const isLoadingHistory = currentConversation && currentConversation.messages.length === 0 && !isWaitingForResponse;

  // Get message limit from the user's plan details
  // MODIFIED: Use plans from context to find the user's plan and its limit
  const userPlanDetails = plans.find(p => p.id === user?.plan);
  const messageLimit = userPlanDetails?.message_limit ?? null; // Use limit from plan, null for unlimited


  // Determine if we should show the welcome screen
  const showWelcome = !currentConversation || (currentConversation.messages.length === 0 && !isLoadingHistory && !isWaitingForResponse);

  return (
    // Ensure the main container uses theme-aware background
    <div className="flex flex-col h-full bg-background text-text">
      {/* Conversation Header - Use theme-aware classes */}
      {/* MODIFIED: Only show header with conversation title if a conversation is selected */}
      {currentConversation ? (
        <div className="py-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold flex items-center gap-2 text-text">
            <BrainCircuit size={20} className="text-primary" />
            {currentConversation.title}
          </h1>
          {/* Optional: Add conversation actions here (e.g., delete, rename) */}
        </div>
      ) : (
        // MODIFIED: Show a minimal header or nothing when no conversation is selected
        // Keeping a minimal header for visual consistency, but without the "Selecione ou inicie uma conversa" text
         <div className="py-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-center sticky top-0 z-10">
            <h1 className="text-xl font-bold flex items-center gap-2 text-text/70">
              <BrainCircuit size={20} className="text-primary/70" />
              iLyra Chat
            </h1>
         </div>
      )}


      {/* Message Area - Use theme-aware classes */}
      {/* MODIFIED: Add padding and conditional centering */}
      {/* Added padding-bottom to ensure space above the input */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 pb-24 ${showWelcome ? 'flex flex-col items-center justify-center' : ''}`}> {/* Increased bottom padding */}
        {isLoadingHistory ? (
           // Loading spinner uses theme-aware primary color
           <div className="flex justify-center items-center h-64">
             <Loader2 size={32} className="animate-spin text-primary" />
             <span className="ml-2 text-text/70">Carregando histórico...</span>
           </div>
        ) : showWelcome ? (
          // Show welcome screen if no conversation is selected or no messages yet
          <WelcomeScreen />
        ) : (
          // Messages container - Only show if not showing welcome and not loading history
          <div className="flex flex-col space-y-4">
            {/* ChatMessage component uses theme-aware classes internally */}
            {currentConversation?.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {/* Loading indicator for AI response */}
            {isWaitingForResponse && (
              <div className="chat-message assistant-message"> {/* Uses theme-aware classes */}
                <div className="flex-shrink-0">
                  {/* Use theme-aware secondary color */}
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-sm text-text">iLyra</span> {/* Use theme-aware text color */}
                    <span className="ml-2 text-xs text-text/50">Gerando resposta...</span> {/* Use theme-aware text color */}
                  </div>
                  <div className="message-content"> {/* Uses theme-aware prose styles */}
                    <div className="typing-indicator"> {/* Uses theme-aware text color for dots */}
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
          </div>
        )}
      </div>

      {/* Free Message Count - Use theme-aware text color */}
      {/* MODIFIED: Display message limit from the user's plan */}
      {user?.plan === 'free' && messageLimit !== null && (
        <div className="text-center text-sm text-text/70 mt-2 px-4">
          Você usou {freeMessageCount} de {messageLimit} mensagens gratuitas.
        </div>
      )}

      {/* Chat Input - Uses theme-aware classes internally */}
      {/* MODIFIED: Always render ChatInput if user is logged in */}
      {user && <ChatInput />}


      {/* Render PlansModal based on showPlansModal state */}
      {showPlansModal && (
        <PlansModal onClose={() => setShowPlansModal(false)} />
      )}
    </div>
  );
};

export default ChatWindow;
