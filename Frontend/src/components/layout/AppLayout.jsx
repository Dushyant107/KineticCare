import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from './PatientSidebar';
import TherapistSidebar from './TherapistSidebar';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';

export const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderSidebar = () => {
    if (user?.role === 'THERAPIST') {
      return <TherapistSidebar onClose={() => setMobileSidebarOpen(false)} />;
    } else if (user?.role === 'ADMIN') {
      return <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />;
    }
    return <PatientSidebar onClose={() => setMobileSidebarOpen(false)} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Topbar onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16">
          {renderSidebar()}
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 h-full bg-white">
              {renderSidebar()}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
