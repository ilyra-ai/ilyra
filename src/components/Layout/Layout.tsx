import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation(); // Get current location

  // Determine if the current route should use the layout
  const useLayout = !['/', '/auth/login', '/auth/register'].includes(location.pathname);

  // Close mobile sidebar when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      const target = event.target as Node;

      // Check if the click is outside the sidebar AND the sidebar is open in mobile view
      if (
        sidebar &&
        !sidebar.contains(target) &&
        isMobileSidebarOpen &&
        window.innerWidth < 1024 // Only for mobile
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSidebarOpen]); // Depend on isMobileSidebarOpen

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobileSidebarOpen && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname]); // Depend on location.pathname


  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // If not using layout, just render the Outlet
  if (!useLayout) {
    return <Outlet />;
  }

  // If using layout, render Header, Sidebar, and main content
  return (
    <div className="h-screen flex flex-col">
      <Header toggleSidebar={toggleMobileSidebar} isSidebarOpen={isMobileSidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Pass the mobile toggle function */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
          toggleMobileSidebar={toggleMobileSidebar}
        />

        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Removed transition classes from main element */}
        <main className={`flex-1 overflow-y-auto flex flex-col ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
