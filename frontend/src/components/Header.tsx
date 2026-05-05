import { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function Header() {
  const coins = useGameStore(s => s.coins);
  const day = useGameStore(s => s.day);
  const collectionCount = useGameStore(s => s.kemonomimi.length);
  const advanceDay = useGameStore(s => s.advanceDay);
  const [daySummary, setDaySummary] = useState<string[]>([]);

  const handleAdvanceDay = () => {
    const result = advanceDay();
    setDaySummary(result.logs);
  };

  return (
    <header className="game-header flex flex-col gap-4 mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Kemonomimi Breeding Simulator</h1>
        <button className="btn btn--secondary bg-secondary text-white px-4 py-2 rounded" onClick={handleAdvanceDay}>
          Advance Day
        </button>
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="stat-item flex flex-col items-center">
          <span className="stat-label text-xs text-gray-500">Coins</span>
          <span className="font-semibold text-lg" data-testid="coins-display">
            {coins}
          </span>
        </div>
        <div className="stat-item flex flex-col items-center">
          <span className="stat-label text-xs text-gray-500">Day</span>
          <span className="font-semibold text-lg" data-testid="day-display">
            {day}
          </span>
        </div>
        <div className="stat-item flex flex-col items-center">
          <span className="stat-label text-xs text-gray-500">Collection</span>
          <span className="font-semibold text-lg" data-testid="collection-count">
            {collectionCount}
          </span>
        </div>
      </div>

      {daySummary.length > 0 && (
        <div className="rounded-lg bg-green-900/70 text-white px-4 py-3 text-sm">
          <p className="font-semibold mb-1">Day {day} Summary</p>
          <ul className="list-disc pl-5">
            {daySummary.map(log => (
              <li key={log}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
