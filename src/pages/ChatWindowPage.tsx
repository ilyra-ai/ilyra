import React from 'react';
import ChatWindow from '../components/Chat/ChatWindow';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';

const ChatWindowPage: React.FC = () => {
  const { user } = useApp();

  // REMOVED: Logic to redirect admin users to the admin users page.
  // Now, all authenticated users will see the ChatWindow.

  // Redirect unauthenticated users to the landing page (or login)
  // Note: The AppProvider handles initial auth check and redirects.
  // This is a fallback in case a user somehow lands here without auth.
  if (!user) {
      return <Navigate to="/" replace />; // Redirect to landing page
  }

  // Render ChatWindow for any authenticated user (user or administrador)
  return <ChatWindow />;
};

export default ChatWindowPage;
