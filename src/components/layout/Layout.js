import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AlertContainer from '../common/AlertContainer';
import VetNavbar from './VetNavbar';
import ReceptionNavbar from './ReceptionNavbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVetRoute = location.pathname.startsWith('/vet');
  const isReceptionRoute = location.pathname.startsWith('/reception');

  return (
    <div className="min-h-screen bg-gray-100">
      {isVetRoute ? (
        <VetNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      ) : isReceptionRoute ? (
        <ReceptionNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      ) : null}
      
      <div className="flex h-full">
        {/* Sidebar Container - Only for admin */}
        {isAdminRoute && (
          <div className="w-64 flex-shrink-0 h-screen fixed left-0 top-0 z-30">
            <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
          </div>
        )}
        
        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col min-h-screen ${
            isAdminRoute ? 'md:ml-64' : ''
          }`}
        >
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">
              <AlertContainer />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;