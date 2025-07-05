import React, { useEffect, useState } from 'react';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: '^GSPC', name: 'S&P 500' },
];

const API_KEY = 'YOUR_FINNHUB_API_KEY'; // Replace with your Finnhub API key

interface StockData {
  symbol: string;
  price: number;
  change: number;
  percent: number;
}

export default function TickerTape() {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          STOCKS.map(async (stock) => {
            // Finnhub: https://finnhub.io/docs/api/quote
            const url = `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('API error');
            const json = await res.json();
            return {
              symbol: stock.symbol,
              price: json.c,
              change: json.d,
              percent: json.dp,
            };
          })
        );
        setData(results);
      } catch (e) {
        setError('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap w-full bg-white border-b border-gray-200 py-2">
      <div className="flex animate-marquee gap-12">
        {loading && <span className="mx-4 text-gray-600">Loading stock prices...</span>}
        {error && <span className="mx-4 text-red-700">{error}</span>}
        {!loading && !error && data.map((item, idx) => (
          <span key={item.symbol} className={`mx-4 font-semibold ${item.percent >= 0 ? 'text-[#b01c2e]' : 'text-gray-700'}`}>
            {item.symbol}: <span className="font-bold">${item.price?.toFixed(2)}</span> <span className={item.percent >= 0 ? 'text-green-600' : 'text-red-600'}>({item.percent?.toFixed(2)}%)</span>
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
