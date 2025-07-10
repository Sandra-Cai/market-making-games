import React from 'react';

const history = [
  { game: 'Market Making', score: 980, date: '2024-06-01' },
  { game: 'Mental Math', score: 870, date: '2024-05-30' },
  { game: 'Probability', score: 820, date: '2024-05-28' },
];

const GameHistory: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm mx-auto">
    <h2 className="text-xl font-bold mb-4">Game History</h2>
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left">Game</th>
          <th className="text-left">Score</th>
          <th className="text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        {history.map((h, i) => (
          <tr key={i}>
            <td>{h.game}</td>
            <td>{h.score}</td>
            <td>{h.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default GameHistory; 