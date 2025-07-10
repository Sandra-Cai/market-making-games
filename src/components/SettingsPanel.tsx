import React, { useState, useEffect } from 'react';

const SettingsPanel: React.FC = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [sound, setSound] = useState(() => localStorage.getItem('sound') !== 'false');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('difficulty') || 'normal');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sound', sound ? 'true' : 'false');
  }, [sound]);

  useEffect(() => {
    localStorage.setItem('difficulty', difficulty);
  }, [difficulty]);

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