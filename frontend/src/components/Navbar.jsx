import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, Menu } from 'lucide-react';

const Navbar = ({ setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Performance Dashboard';
      case '/workout': return 'Live Workout Session';
      case '/analytics': return 'Fitness Analytics';
      case '/coach': return 'AI Coaching Assistant';
      case '/profile': return 'My Coach Settings';
      case '/admin': return 'System Admin Console';
      default: return 'FitSense AI';
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="w-full flex items-center justify-between py-5 px-4 md:px-8 border-b border-slate-800/40 sticky top-0 bg-dark-950/80 backdrop-blur-md z-40">
      <div className="flex items-center">
        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 mr-3 inline-flex items-center justify-center transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-350 bg-clip-text text-transparent">
            {getPageTitle()}
          </h2>
          <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
            Monitoring your contactless fitness signals in real time
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/60">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* User Status Welcome Badge */}
        {user && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 px-4.5 py-1.5 rounded-xl border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              {getGreeting()}, <span className="text-indigo-300 font-bold">{(user.name || 'User').split(' ')[0]}</span>!
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
