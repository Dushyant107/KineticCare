import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, Shield } from 'lucide-react';

export const AdminSidebar = ({ onClose }) => {
  const navItems = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Exercise Registry', path: '/admin/exercises', icon: Dumbbell },
    { label: 'System Logs', path: '/admin/system', icon: Shield },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3">
          <img src="/logo.svg" alt="KineticCare Admin" className="h-9" />
          <span className="text-[10px] uppercase font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
            Admin
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
                      ? 'bg-slate-100 text-slate-900 font-bold'
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

export default AdminSidebar;
