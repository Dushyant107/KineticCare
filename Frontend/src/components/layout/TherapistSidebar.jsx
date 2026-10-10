import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
} from 'lucide-react';

export const TherapistSidebar = ({ onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/therapist/dashboard', icon: LayoutDashboard },
    { label: 'Patient Roster', path: '/therapist/patients', icon: Users },
    { label: 'Program Builder', path: '/therapist/programs', icon: ClipboardList },
    { label: 'Set Availability', path: '/therapist/availability', icon: Clock },
    { label: 'Appointments', path: '/therapist/appointments', icon: Calendar },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3">
          <img src="/logo.svg" alt="KineticCare Clinical" className="h-9" />
          <span className="text-[10px] uppercase font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
            Clinical
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default TherapistSidebar;
