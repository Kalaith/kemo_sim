import { useGameStore } from '../hooks/useGameStore';
import type { Kemonomimi } from '../types/game';

const breedingCost = 200;

export default function BreedingPage() {
  const kemonomimi = useGameStore((s) => s.kemonomimi);
  const coins = useGameStore((s) => s.coins);
  const setCoins = useGameStore((s) => s.setCoins);
  const selectedParent1 = useGameStore((s) => s.selectedParent1);
  const selectedParent2 = useGameStore((s) => s.selectedParent2);
  const setSelectedParent1 = useGameStore((s) => s.setSelectedParent1);
  const setSelectedParent2 = useGameStore((s) => s.setSelectedParent2);
  const breedingQueue = useGameStore((s) => s.breedingQueue);
  const setBreedingQueue = useGameStore((s) => s.setBreedingQueue);
  const addKemonomimi = useGameStore((s) => s.addKemonomimi);
  const nextId = useGameStore((s) => s.nextId);
  const setNextId = useGameStore((s) => s.setNextId);

  // Selectable kemonomimi (available only)
  const availableKemonomimi = kemonomimi.filter((k) => k.status === 'available');

  // Get parent objects
  const parent1 = kemonomimi.find((k) => k.id === selectedParent1) || null;
  const parent2 = kemonomimi.find((k) => k.id === selectedParent2) || null;

  // Handler for selecting a parent
  const handleSelectParent = (kemono: Kemonomimi) => {
    if (!parent1) {
      setSelectedParent1(kemono.id);
    } else if (!parent2 && kemono.id !== parent1.id) {
      setSelectedParent2(kemono.id);
    } else {
      setSelectedParent1(kemono.id);
      setSelectedParent2(null);
    }
  };

  // Handler for starting breeding
  const handleStartBreeding = () => {
    if (!parent1 || !parent2 || coins < breedingCost) return;
    setCoins(coins - breedingCost);
    // Add to breeding queue (simulate progress)
    const newProject = {
      id: Date.now(),
      parent1,
      parent2,
      progress: 0,
    };
    setBreedingQueue([...breedingQueue, newProject]);
    setSelectedParent1(null);
    setSelectedParent2(null);
  };

  // Handler for advancing breeding progress (simulate day advance)
  const handleAdvanceBreeding = () => {
    const updatedQueue = breedingQueue.map((item) => ({ ...item, progress: item.progress + 1 }));
    // If progress >= 3, breeding is done (simulate 3 days)
    const finished = updatedQueue.filter((item) => item.progress >= 3);
    const ongoing = updatedQueue.filter((item) => item.progress < 3);
    // For finished, create new kemonomimi (simple random logic)
    finished.forEach((item) => {
      const child: Kemonomimi = {
        ...item.parent1,
        id: nextId + 1,
        name: 'Newborn',
        stats: { ...item.parent1.stats },
        status: 'available',
        parents: [item.parent1.id, item.parent2.id],
        children: [],
        trainedJobs: [],
      };
      addKemonomimi(child);
      setNextId(nextId + 1);
    });
    setBreedingQueue(ongoing);
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">Breeding Center</h2>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="bg-surface rounded-xl p-4 w-full md:w-1/3 border border-primary/20">
            <h3 className="font-semibold mb-2 text-primary">Parent 1</h3>
            <div className="h-20 flex items-center justify-center text-gray-400">
              {parent1 ? (
                <span className="font-semibold text-primary">{parent1.name}</span>
              ) : (
                'Select a kemonomimi'
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              className="btn btn--primary bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!parent1 || !parent2 || coins < breedingCost}
              onClick={handleStartBreeding}
            >
              Start Breeding
            </button>
            <p className="text-xs text-gray-500">Cost: {breedingCost} coins</p>
          </div>
          <div className="bg-surface rounded-xl p-4 w-full md:w-1/3 border border-primary/20">
            <h3 className="font-semibold mb-2 text-primary">Parent 2</h3>
            <div className="h-20 flex items-center justify-center text-gray-400">
              {parent2 ? (
                <span className="font-semibold text-primary">{parent2.name}</span>
              ) : (
                'Select a kemonomimi'
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableKemonomimi.map((k) => (
            <div
              key={k.id}
              className="bg-background rounded-lg shadow p-2 flex flex-col items-center cursor-pointer hover:ring-2 hover:ring-accent transition"
              onClick={() => handleSelectParent(k)}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl text-primary">{k.type.emoji}</span>
                <span className="font-semibold text-primary">{k.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{k.type.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface rounded-xl p-4 shadow border border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">Breeding Queue</h3>
          {breedingQueue.length === 0 ? (
            <div className="text-gray-400">No active breeding projects</div>
          ) : (
            <div className="space-y-2">
              {breedingQueue.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <span className="text-primary">{item.parent1.name} × {item.parent2.name}</span>
                  <div className="flex-1 h-2 bg-background rounded">
                    <div
                      className="h-2 bg-accent rounded"
                      style={{ width: `${Math.min(100, (item.progress / 3) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{item.progress}/3 days</span>
                </div>
              ))}
              <button
                className="mt-2 btn btn--secondary bg-secondary text-white px-3 py-1 rounded"
                onClick={handleAdvanceBreeding}
              >
                Advance Day (Simulate)
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}