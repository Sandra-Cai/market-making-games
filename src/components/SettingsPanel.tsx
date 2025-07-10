import React, { useState } from 'react';

const SettingsPanel: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [sound, setSound] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className="mb-2">
        <label className="block mb-1 font-semibold">Theme</label>
        <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-1 rounded">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1 font-semibold">Sound</label>
        <input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Enable Sound
      </div>
      <div className="mb-2">
        <label className="block mb-1 font-semibold">Difficulty</label>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-1 rounded">
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel; 