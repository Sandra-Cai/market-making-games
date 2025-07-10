import React from 'react';

const Leaderboard: React.FC = () => {
  // Placeholder leaderboard data
  const leaders = [
    { name: 'Player1', score: 980 },
    { name: 'Player2', score: 870 },
    { name: 'Player3', score: 820 },
  ];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <ol className="list-decimal pl-5">
        {leaders.map((leader, i) => (
          <li key={i} className="mb-2 flex justify-between">
            <span>{leader.name}</span>
            <span className="font-semibold">{leader.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard; 