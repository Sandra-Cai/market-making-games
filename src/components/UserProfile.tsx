import React from 'react';

const UserProfile: React.FC = () => {
  // Placeholder user data
  const user = {
    name: 'Player1',
    avatar: '🧑',
    gamesPlayed: 12,
    highScore: 980,
    achievements: ['First Win', 'Streak'],
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center">
        <div className="text-6xl mb-2">{user.avatar}</div>
        <h2 className="text-xl font-bold mb-1">{user.name}</h2>
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