import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import { Menu, X, Settings, Moon, Sun, Users, HelpCircle, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PlanBadge from '../UI/PlanBadge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme, user, logout, setShowPlansModal } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container

  const handleLogout = async () => {
    console.log('Logout clicked');
    await logout();
    setShowDropdown(false);
  };

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <header className="w-full border-b border-border py-3 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm relative z-20"> {/* Ensure z-index */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-md hover:bg-card mr-2 lg:hidden"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo and Plan Badge */}
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            iLyra
          </span>
          {user?.plan && <PlanBadge plan={user.plan} />}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-full hover:bg-card"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}> {/* Attach ref here */}
          <button
            className="p-2 rounded-full hover:bg-card"
            onClick={() => {
               console.log('User icon clicked, toggling dropdown');
               setShowDropdown(prev => !prev); // Toggle state correctly
            }}
            aria-label="Menu do usuário"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
            </div>
          </button>

          {showDropdown && (
            <div className="dropdown-menu animate-fadeIn"> {/* Ensure z-index is handled by CSS */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{user?.email || 'Usuário'}</p>
                <p className="text-xs text-text/70">Plano {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Grátis'}</p>
              </div>
              <div className="py-1">
                <button className="dropdown-item flex items-center gap-2" onClick={() => handleNavigation('/profile')}>
                  <UserIcon size={16} />
                  <span>Perfil</span>
                </button>
                {/* Show Settings only if user is administrador */}
                {user?.role === 'administrador' && (
                  <button className="dropdown-item flex items-center gap-2" onClick={() => handleNavigation('/settings')}>
                    <Settings size={16} />
                    <span>Configurações</span>
                  </button>
                )}
                 {/* Show Admin Dashboard link only if user is administrador */}
                 {user?.role === 'administrador' && (
                  <button className="dropdown-item flex items-center gap-2" onClick={() => handleNavigation('/admin/users')}> {/* Corrected path */}
                    <LayoutDashboard size={16} />
                    <span>Admin Dashboard</span>
                  </button>
                )}
                {/* Link to plans page/modal */}
                <button className="dropdown-item flex items-center gap-2" onClick={() => handleNavigation('/planos')}>
                  <Users size={16} />
                  <span>Atualizar plano</span>
                </button>
                <button className="dropdown-item flex items-center gap-2" onClick={() => handleNavigation('/help')}>
                  <HelpCircle size={16} />
                  <span>Ajuda</span>
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button className="dropdown-item flex items-center gap-2" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
