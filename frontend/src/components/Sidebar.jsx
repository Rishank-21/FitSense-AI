import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Activity, 
  LineChart, 
  Brain, 
  User, 
  ShieldAlert, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Live Workout', path: '/workout', icon: Dumbbell },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'AI Coach', path: '/coach', icon: Brain },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className={`w-64 h-screen glass-panel fixed left-0 top-0 flex flex-col justify-between p-6 z-50 border-r border-indigo-500/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col gap-8 relative">
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 absolute -right-2 -top-2 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Dumbbell className="w-6 h-6 text-dark-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-200 to-cyan-300 bg-clip-text text-transparent">
              FitSense AI
            </h1>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
              Contactless Coach
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-350 font-medium text-sm group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-650/30 to-cyan-600/15 border-l-4 border-indigo-500 text-indigo-250 shadow-md shadow-indigo-500/5'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-100'
                    }`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile brief & Logout */}
      <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-dark-950 shadow-md">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name || 'User'}</p>
              <p className="text-[10px] text-cyan-400/80 truncate capitalize">
                {(user.fitnessGoal || 'maintenance').replace('-', ' ')}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
