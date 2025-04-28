import React, { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, MessageSquare, Trash2, Settings, User, HelpCircle, LayoutDashboard, LogOut, Archive, Users, PanelRightOpen, PanelLeftOpen, Palette, CreditCard, Bot, DollarSign, ChevronDown, ChevronUp, Search, MessageCircle, PlusCircle } from 'lucide-react'; // Adicionado PlusCircle
import { useApp } from '../../context/AppContext';
import { formatShortDate } from '../../utils/helpers';
import ModelSelector from '../UI/ModelSelector';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  toggleMobileSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, isCollapsed, toggleCollapse, toggleMobileSidebar }) => {
  const { conversations, currentConversation, setCurrentConversation, createNewConversation, clearConversations, user, logout, setShowPlansModal, platformSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; conversationId: string | null } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [isAdminSectionOpen, setIsAdminSectionOpen] = useState(false);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        handleCloseContextMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleRightClick = (event: React.MouseEvent, conversationId: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      conversationId: conversationId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteConversationLocal = () => {
    if (contextMenu?.conversationId) {
      console.log("Simulado: Excluir conversa", contextMenu.conversationId);
      // deleteConversation(contextMenu.conversationId);
      handleCloseContextMenu();
    }
  };

  const handleArchiveConversationLocal = () => {
    if (contextMenu?.conversationId) {
      alert(`Conversa ${contextMenu?.conversationId} arquivada (simulado - estado local).`);
      handleCloseContextMenu();
    }
  };

  const handleShowPlans = () => {
    navigate('/planos');
  };

  const toggleAdminSection = () => {
    setIsAdminSectionOpen(!isAdminSectionOpen);
  };

  // Close mobile sidebar when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      const target = event.target as Node;

      if (
        sidebar &&
        !sidebar.contains(target) &&
        isMobileOpen &&
        window.innerWidth < 1024
      ) {
        toggleMobileSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen, toggleMobileSidebar]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobileOpen && window.innerWidth < 1024) {
      toggleMobileSidebar();
    }
  }, [location.pathname, isMobileOpen, toggleMobileSidebar]);

  const handleNewConversation = () => {
    createNewConversation().then(newConversation => {
      if (newConversation) {
        setCurrentConversation(newConversation);
        navigate('/chat');
      }
    });
  };

  // Ensure isAdminSectionOpen is false when sidebar is collapsed on desktop
  useEffect(() => {
    if (isCollapsed && window.innerWidth >= 1024) {
      setIsAdminSectionOpen(false);
    }
  }, [isCollapsed]);

  // Helper function to check if an item is visible based on plan settings
  const isItemVisible = (itemKey: string, isSidebarItem: boolean = true) => {
    if (!user || !platformSettings) return false;
    const visibilitySettings = isSidebarItem ? platformSettings.sidebar_item_visibility : platformSettings.admin_sidebar_item_visibility;
    const allowedPlansOrRoles = visibilitySettings?.[itemKey] || [];

    // Check if the user's role OR plan is included in the allowed list
    return allowedPlansOrRoles.includes(user.role) || allowedPlansOrRoles.includes(user.plan);
  };


  return (
    <aside
      className={`fixed inset-y-0 left-0 w-72 bg-background border-r border-border transform transition-transform duration-300 ease-in-out z-30 flex flex-col h-full ${
        isMobileOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
      } lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
    >
      {/* Top Section: Collapse/Expand, Search, New Conversation */}
      <div className={`p-2 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
         {/* Collapse/Expand Button (Desktop Only) */}
         <button
           className="p-2 rounded-md hover:bg-card hidden lg:block"
           onClick={toggleCollapse}
           title={isCollapsed ? 'Expandir' : 'Recolher'}
         >
           {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelRightOpen size={20} />}
         </button>

         {!isCollapsed && (
           <>
             {/* Search Conversations (Placeholder) */}
             <button className="p-2 rounded-md hover:bg-card" title="Pesquisar conversas">
               <Search size={20} />
             </button>
             {/* New Conversation Button */}
             <button
               className="p-2 rounded-md hover:bg-card"
               onClick={handleNewConversation}
               title="Nova conversa"
             >
               <MessageSquarePlus size={20} />
             </button>
           </>
         )}
         {isCollapsed && (
            <button
               className="p-2 rounded-md hover:bg-card lg:hidden" // Show only on mobile when collapsed
               onClick={handleNewConversation}
               title="Nova conversa"
             >
               <PlusCircle size={20} />
             </button>
         )}
      </div>

      {/* Model Selector (Only for non-admin, if enabled by settings) */}
      {user && user.role !== 'administrador' && isItemVisible('show_model_selector') && (
        <div className={`p-4 ${isCollapsed ? 'hidden' : ''}`}>
          <ModelSelector />
        </div>
      )}

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {user && isItemVisible('show_history') && (
           <>
             {!isCollapsed && <h2 className="px-2 mb-2 text-sm font-medium text-text/70">Histórico</h2>}

             {conversations.length === 0 ? (
               <div className={`flex flex-col items-center justify-center h-40 text-center px-4 ${isCollapsed ? 'hidden' : ''}`}>
                 <MessageSquare className="text-text/30 mb-2" size={24} />
                 <p className="text-sm text-text/70">Nenhuma conversa ainda</p>
                 <p className="text-xs text-text/50 mt-1">Inicie uma nova conversa</p>
               </div>
             ) : (
               <ul className="space-y-1">
                 {conversations.map((conversation) => (
                   <li key={conversation.id}>
                     <button
                       className={`sidebar-item w-full text-left ${
                         currentConversation?.id === conversation.id ? 'active' : ''
                       } ${isCollapsed ? 'flex justify-center' : ''}`}
                       onClick={() => {
                         setCurrentConversation(conversation);
                         navigate('/chat'); // Navigate to chat page when a conversation is selected
                       }}
                       title={isCollapsed ? conversation.title : ''}
                       onContextMenu={(e) => !isCollapsed && handleRightClick(e, conversation.id)}
                     >
                       <MessageSquare size={isCollapsed ? 20 : 18} />
                       {!isCollapsed && (
                         <div className="flex-1 overflow-hidden">
                           <p className="text-sm truncate">{conversation.title}</p>
                           <p className="text-xs text-text/70">
                             {formatShortDate(conversation.updatedAt)}
                           </p>
                         </div>
                       )}
                     </button>
                   </li>
                 ))}
               </ul>
             )}
           </>
        )}
      </div>

      {/* Bottom Section: User/Admin Links */}
      <div className="p-4 border-t border-border space-y-2">
        {user && (
          <>
             {/* --- CORRECTED CHAT LINK --- */}
             {/* This button should always navigate to /chat */}
             <button
               className={`sidebar-item w-full ${isCollapsed ? 'flex justify-center' : ''}`}
               onClick={() => navigate('/chat')} // Ensure this navigates to /chat
               title={isCollapsed ? 'Chat' : ''}
             >
               <MessageCircle size={isCollapsed ? 20 : 18} />
               {!isCollapsed && <span className="text-sm">Chat</span>}
             </button>
             {/* --- END CORRECTION --- */}

            {/* New Clear Link (above Users) */}
            <button className={`sidebar-item w-full text-error ${isCollapsed ? 'flex justify-center' : ''}`} onClick={clearConversations} title={isCollapsed ? 'Limpar conversas' : ''}>
              <Trash2 size={isCollapsed ? 20 : 18} />
              {!isCollapsed && <span className="text-sm">Limpar conversas</span>}
            </button>

            {/* Admin Panel (Visible only to admins and if setting allows) */}
            {user.role === 'administrador' && isItemVisible('show_admin_dashboard_link') && (
              <>
                <button className={`sidebar-item w-full ${isCollapsed ? 'flex justify-center' : ''}`} onClick={toggleAdminSection} title={isCollapsed ? 'Painel Admin' : ''}>
                  <LayoutDashboard size={isCollapsed ? 20 : 18} />
                  {!isCollapsed && (
                    <span className="flex-1 flex items-center justify-between text-sm">
                      Painel
                      {isAdminSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  )}
                </button>
                {/* Admin Submenu */}
                {isAdminSectionOpen && !isCollapsed && (
                  <div className="pl-4 space-y-1">
                    {isItemVisible('admin_users', false) && ( <button className="sidebar-item w-full" onClick={() => navigate('/admin/users')}><Users size={18} /><span className="text-sm">Usuários</span></button> )}
                    {isItemVisible('admin_plans', false) && ( <button className="sidebar-item w-full" onClick={() => navigate('/admin/plans')}><DollarSign size={18} /><span className="text-sm">Planos</span></button> )}
                    {isItemVisible('admin_subscriptions', false) && ( <button className="sidebar-item w-full" onClick={() => navigate('/admin/subscriptions')}><CreditCard size={18} /><span className="text-sm">Assinaturas</span></button> )}
                    {isItemVisible('admin_llm', false) && ( <button className="sidebar-item w-full" onClick={() => navigate('/admin/llm')}><Bot size={18} /><span className="text-sm">Provedores LLM</span></button> )}
                    {isItemVisible('admin_branding', false) && ( <button className="sidebar-item w-full" onClick={() => navigate('/admin/branding')}><Palette size={18} /><span className="text-sm">Branding/Layout</span></button> )}
                    {isItemVisible('admin_settings', false) && ( <button className="sidebar-item w-full" onClick={() => navigate('/admin/settings')}><Settings size={18} /><span className="text-sm">Config. Gerais</span></button> )}
                  </div>
                )}
              </>
            )}

            {/* User Specific Links */}
            {user.role !== 'administrador' && (
              <>
                {/* Exibir Planos (as per image) */}
                {isItemVisible('show_plans_link') && (
                  <button className={`sidebar-item w-full ${isCollapsed ? 'flex justify-center' : ''}`} onClick={handleShowPlans} title={isCollapsed ? 'Exibir Planos' : ''}>
                    <DollarSign size={isCollapsed ? 20 : 18} />
                    {!isCollapsed && <span className="text-sm">Exibir Planos</span>}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="dropdown-menu animate-fadeIn"
          style={{ top: contextMenu.y, left: contextMenu.x, position: 'fixed', zIndex: 100 }}
        >
          <div className="py-1">
             <button className="dropdown-item flex items-center gap-2" onClick={handleArchiveConversationLocal}>
              <Archive size={16} />
              <span>Arquivar</span>
            </button>
            <button className="dropdown-item flex items-center gap-2 text-error" onClick={handleDeleteConversationLocal}>
              <Trash2 size={16} />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
