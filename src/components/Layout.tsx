import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Brain,
  BarChart3,
  Settings as SettingsIcon,
  Award,
  Home,
  Bell,
  User,
  Search,
  DollarSign,
} from 'lucide-react';
import TickerTape from './TickerTape';

const navItems = [
  { label: 'Dashboard', icon: <Home />, to: '/' },
  { label: 'Games', icon: <Brain />, to: '/games' },
  { label: 'Leaderboard', icon: <BarChart3 />, to: '/leaderboard' },
  { label: 'Achievements', icon: <Award />, to: '/achievements' },
  { label: 'Settings', icon: <SettingsIcon />, to: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-finance-bg font-inter">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-finance-sidebar border-r border-finance-border flex flex-col items-center py-6">
        <div className="mb-8 flex flex-col items-center">
          <DollarSign className="w-10 h-10 text-finance-gold mb-2" />
          <span className="text-lg font-bold text-finance-gold tracking-wide hidden md:block">
            MMG
          </span>
        </div>
        <nav className="flex-1 w-full">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors mb-2 w-full hover:bg-finance-bg-light ${location.pathname === item.to ? 'bg-finance-bg-light text-finance-gold' : 'text-finance-gray'}`}
            >
              <span className="w-6 h-6">{item.icon}</span>
              <span className="hidden md:inline text-base font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* Quick stats (placeholder) */}
        <div className="mt-auto mb-4 w-full px-4 hidden md:block">
          <div className="bg-finance-card rounded-lg p-3 text-xs text-finance-gray">
            <div className="flex justify-between mb-1">
              <span>Level</span>
              <span className="text-finance-gold font-bold">5</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Streak</span>
              <span className="text-finance-green font-bold">3</span>
            </div>
            <div className="flex justify-between">
              <span>Score</span>
              <span className="text-finance-blue font-bold">1200</span>
            </div>
          </div>
        </div>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-finance-header border-b border-finance-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 w-1/2">
            <Search className="w-5 h-5 text-finance-gray" />
            <input
              type="text"
              placeholder="Search games, stats, or users..."
              className="bg-transparent outline-none text-white placeholder-finance-gray w-full font-inter"
            />
          </div>
          {/* Ticker tape */}
          <div className="hidden md:block w-1/3 mx-6">
            <TickerTape />
          </div>
          <div className="flex items-center gap-6">
            <Bell className="w-6 h-6 text-finance-gray hover:text-finance-gold cursor-pointer" />
            <User className="w-7 h-7 text-finance-gray hover:text-finance-gold cursor-pointer" />
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 bg-finance-bg-light p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
