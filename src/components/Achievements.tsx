import React from 'react';

const allAchievements = [
  'First Win',
  'Streak',
  'High Roller',
  'Math Whiz',
  'Market Master',
];

const earned = ['First Win', 'Streak'];

const Achievements: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm mx-auto">
    <h2 className="text-xl font-bold mb-4">Achievements</h2>
    <ul className="flex flex-wrap gap-2">
      {allAchievements.map((ach, i) => (
        <li
          key={i}
          className={`px-2 py-1 rounded text-xs ${earned.includes(ach) ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
        >
          {ach}
        </li>
      ))}
    </ul>
  </div>
);

export default Achievements; 