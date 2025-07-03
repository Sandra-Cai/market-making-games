import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Games', to: '/games' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'Settings', to: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Navigation Bar */}
      <header className="w-full flex items-center justify-between px-12 py-6 border-b border-gray-200 bg-white">
        <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-black hover:text-red-700 transition-colors" style={{ fontFamily: 'Merriweather, serif' }}>
          Jane Street
        </Link>
        <nav className="flex gap-10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`text-lg font-medium transition-colors ${location.pathname === item.to ? 'text-red-700 font-bold' : 'text-gray-700 hover:text-red-700'}`}
              aria-current={location.pathname === item.to ? 'page' : undefined}
              style={{ fontFamily: 'Inter, IBM Plex Sans, sans-serif' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center w-full min-h-[80vh] px-4 py-12">
        {children}
      </main>
    </div>
  );
}
