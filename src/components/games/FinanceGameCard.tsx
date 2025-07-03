import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface FinanceGameCardProps {
  icon: React.ReactNode;
  title: string;
  highScore: number;
  change: string;
  sparkData: { value: number }[];
  onClick?: () => void;
}

export default function FinanceGameCard({
  icon,
  title,
  highScore,
  change,
  sparkData,
  onClick,
}: FinanceGameCardProps) {
  const isUp = change.startsWith('+');
  return (
    <button
      type="button"
      className={`bg-jsslate rounded-lg border border-jsborder cursor-pointer transition-all hover:border-jsaccent flex flex-col gap-3 min-w-[240px] text-left focus:outline-none focus:ring-2 focus:ring-jsaccent p-7 font-sans group`}
      onClick={onClick}
      aria-label={`View details for ${title}`}
    >
      <div className="flex items-center gap-4 mb-3">
        <span className="w-8 h-8 flex items-center justify-center text-2xl" aria-hidden="true">{icon}</span>
        <span className="font-extrabold text-xl text-jswhite flex-1 group-hover:text-jsaccent transition-colors">{title}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-jsgray font-light">High Score</span>
        <span className="text-sm text-jsgray font-light">Change</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-jsaccent">{highScore}</span>
        <span className={`font-semibold ${isUp ? 'text-jsgreen' : 'text-jsred'}`}>{change}</span>
      </div>
      <div className="w-full h-8" role="img" aria-label={`Sparkline chart for ${title} showing recent performance`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isUp ? '#61afef' : '#e06c75'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}
