import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, BarChart3, Settings as SettingsIcon, Award } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <Brain className="w-5 h-5" /> },
  { to: '/achievements', label: 'Achievements', icon: <Award className="w-5 h-5" /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <BarChart3 className="w-5 h-5" /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-white/10 backdrop-blur-md border-r border-white/20 p-6">
        <div className="mb-10 flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">MM Games</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${location.pathname === item.to ? 'bg-primary-500/20 text-primary-400' : 'text-white hover:bg-white/10'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 min-h-screen p-0 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 