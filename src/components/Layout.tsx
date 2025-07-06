import React from 'react';
import { Link } from 'react-router-dom';

const NAV_RED = '#b01c2e';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white text-black font-sans">
    {/* Top Navigation Bar */}
    <nav className="sticky top-0 z-30 w-full bg-white/90 border-b border-gray-200 backdrop-blur flex items-center justify-between px-8 py-4 overflow-x-auto">
      <Link to="/" className="flex items-center gap-2 group pl-2 md:pl-4">
        {/* Optionally, add a concentric circle SVG here for demo purposes */}
        <span className="text-2xl md:text-3xl font-extrabold font-serif tracking-tight" style={{ color: NAV_RED, fontFamily: 'Merriweather, serif', whiteSpace: 'nowrap' }}>
          Market Making Games
        </span>
      </Link>
      <div className="flex gap-8 items-center text-base font-sans">
        <Link to="/" className="hover:underline hover:text-red-700 transition-colors">Home</Link>
        <a href="#games-section" className="hover:underline hover:text-red-700 transition-colors">Games</a>
        <a href="https://www.janestreet.com/puzzles/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-red-700 transition-colors">Puzzles</a>
      </div>
    </nav>
    <main className="w-full mx-auto max-w-6xl px-4 md:px-8 py-8">
      {children}
    </main>
  </div>
);

export default Layout;
