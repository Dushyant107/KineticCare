import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  ClipboardList,
  Dumbbell,
  Video,
  LineChart,
  Flame,
  MessageSquare,
  FileText,
} from 'lucide-react';

export const PatientSidebar = ({ onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Find Therapist', path: '/find-therapist', icon: UserCheck },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'My Program', path: '/my-program', icon: ClipboardList },
    { label: 'Exercise Library', path: '/exercises', icon: Dumbbell },
    { label: 'Live AI Session', path: '/live-session', icon: Video, highlight: true },
    { label: 'Progress Analytics', path: '/progress', icon: LineChart },
    { label: 'Activity & Streaks', path: '/activity', icon: Flame },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3">
          <img src="/logo.svg" alt="KineticCare" className="h-9" />
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
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="px-3 pt-4 border-t border-slate-100">
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 text-xs text-sky-900">
          <p className="font-bold">✨ Need assistance?</p>
          <p className="mt-1 text-sky-700">Connect with your assigned therapist or schedule a consultation anytime.</p>
        </div>
      </div>
    </aside>
  );
};

export default PatientSidebar;
