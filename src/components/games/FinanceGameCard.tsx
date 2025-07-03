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
      className={`bg-finance-card rounded-xl p-5 shadow-md cursor-pointer transition-transform hover:scale-[1.03] border border-finance-border flex flex-col gap-2 min-w-[220px] text-left focus:outline-none focus:ring-2 focus:ring-blue-400`}
      onClick={onClick}
      aria-label={`View details for ${title}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="w-8 h-8 flex items-center justify-center text-2xl" aria-hidden="true">{icon}</span>
        <span className="font-bold text-lg text-white flex-1">{title}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-finance-gray">High Score</span>
        <span className="text-xs text-finance-gray">Change</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl font-bold text-finance-gold">{highScore}</span>
        <span className={`font-semibold ${isUp ? 'text-finance-green' : 'text-finance-red'}`}>
          {change}
        </span>
      </div>
      <div className="w-full h-8" role="img" aria-label={`Sparkline chart for ${title} showing recent performance`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isUp ? '#00C176' : '#FF4B5C'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}
