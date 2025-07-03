import React from 'react';

const TICKER_ITEMS = [
  { label: 'MMG Index', value: '+2.3%', color: 'text-finance-green' },
  { label: 'Market Volatility', value: '1.2%', color: 'text-finance-purple' },
  { label: 'Top Score', value: '1200', color: 'text-finance-gold' },
  { label: 'Streak', value: '3', color: 'text-finance-green' },
  { label: 'Level', value: '5', color: 'text-finance-blue' },
  { label: 'Active Users', value: '42', color: 'text-finance-gold' },
];

export default function TickerTape() {
  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div className="flex animate-marquee gap-12">
        {TICKER_ITEMS.map((item, idx) => (
          <span key={idx} className={`mx-4 font-semibold ${item.color}`}>
            {item.label}: <span className="font-bold">{item.value}</span>
          </span>
        ))}
        {/* Repeat for seamless loop */}
        {TICKER_ITEMS.map((item, idx) => (
          <span key={idx + TICKER_ITEMS.length} className={`mx-4 font-semibold ${item.color}`}>
            {item.label}: <span className="font-bold">{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Add this to your global CSS if not present:
// .animate-marquee {
//   animation: marquee 18s linear infinite;
// }
// @keyframes marquee {
//   0% { transform: translateX(0); }
//   100% { transform: translateX(-50%); }
// }
