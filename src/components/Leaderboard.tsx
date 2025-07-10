import React, { useEffect, useState } from 'react';

interface Leader {
  name: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>(() => {
    const stored = localStorage.getItem('leaderboard');
    return stored ? JSON.parse(stored) : [
      { name: 'Player1', score: 980 },
      { name: 'Player2', score: 870 },
      { name: 'Player3', score: 820 },
    ];
  });

  // Example: Call this function when a new high score is achieved
  const addScore = (name: string, score: number) => {
    const updated = [...leaders, { name, score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaders(updated);
    localStorage.setItem('leaderboard', JSON.stringify(updated));
  };

  useEffect(() => {
    localStorage.setItem('leaderboard', JSON.stringify(leaders));
  }, [leaders]);

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