import React, { useState, useEffect } from 'react';

const UserProfile: React.FC = () => {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [showModal, setShowModal] = useState(!username);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
      setShowModal(false);
    }
  }, [username]);

  const handleLogin = () => {
    if (input.trim()) {
      setUsername(input.trim());
      setInput('');
    }
  };

  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('username');
    setShowModal(true);
  };

  // Placeholder user data
  const user = {
    name: username || 'Player1',
    avatar: '🧑',
    gamesPlayed: 12,
    highScore: 980,
    achievements: ['First Win', 'Streak'],
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm mx-auto">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 rounded border mb-4"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded font-bold w-full"
            >
              Start Playing
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="text-6xl mb-2">{user.avatar}</div>
        <h2 className="text-xl font-bold mb-1">{user.name}</h2>
        <button onClick={handleLogout} className="text-xs text-blue-500 underline mb-2">Change Name</button>
        <div className="text-gray-500 mb-2">Games Played: {user.gamesPlayed}</div>
        <div className="text-gray-500 mb-2">High Score: {user.highScore}</div>
        <div className="mt-2">
          <h3 className="font-semibold mb-1">Achievements:</h3>
          <ul className="flex flex-wrap gap-2">
            {user.achievements.map((ach, i) => (
              <li key={i} className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-xs">{ach}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 