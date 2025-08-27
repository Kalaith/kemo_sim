import { useGameStore } from '../hooks/useGameStore';

export default function Header() {
  const coins = useGameStore((s) => s.coins);
  const day = useGameStore((s) => s.day);
  const collectionCount = useGameStore((s) => s.kemonomimi.length);

  return (
    <header className="game-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <h1 className="text-3xl font-bold">Kemonomimi Breeding Simulator</h1>
      <div className="flex gap-6">
        <div className="stat-item flex flex-col items-center">
          <span className="stat-label text-xs text-gray-500">Coins</span>
          <span className="font-semibold text-lg" data-testid="coins-display">{coins}</span>
        </div>
        <div className="stat-item flex flex-col items-center">
          <span className="stat-label text-xs text-gray-500">Day</span>
          <span className="font-semibold text-lg" data-testid="day-display">{day}</span>
        </div>
        <div className="stat-item flex flex-col items-center">
          <span className="stat-label text-xs text-gray-500">Collection</span>
          <span className="font-semibold text-lg" data-testid="collection-count">{collectionCount}</span>
        </div>
      </div>
    </header>
  );
}