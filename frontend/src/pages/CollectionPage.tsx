import { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import KemonoModal from '../components/KemonoModal';
import { getKemonoImage } from '../utils/imageMap';
import type { Kemonomimi } from '../types/game';

export default function CollectionPage() {
  const kemonomimi = useGameStore((s) => s.kemonomimi);
  const setSelectedParent1 = useGameStore((s) => s.setSelectedParent1);
  const setSelectedParent2 = useGameStore((s) => s.setSelectedParent2);
  const selectedParent1 = useGameStore((s) => s.selectedParent1);
  const selectedParent2 = useGameStore((s) => s.selectedParent2);
  const [selected, setSelected] = useState<number | null>(null);

  // Handler for selecting for breeding
  const handleBreed = (kemono: Kemonomimi) => {
    if (!selectedParent1) {
      setSelectedParent1(kemono.id);
    } else if (!selectedParent2 && kemono.id !== selectedParent1) {
      setSelectedParent2(kemono.id);
    } else {
      setSelectedParent1(kemono.id);
      setSelectedParent2(null);
    }
    setSelected(null);
  };

  // Handler for selecting for training
  const handleTrain = (kemono: Kemonomimi) => {
    setSelected(kemono.id);
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">Your Kemonomimi Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {kemonomimi.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No kemonomimi in your collection.</div>
        ) : (
          kemonomimi.map((k) => (
            <div
              key={k.id}
              className="bg-surface rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer border border-primary/20 hover:border-primary"
              onClick={() => setSelected(k.id)}
            >
              <img
                src={getKemonoImage(k.type.name, k.id)}
                alt={k.type.name}
                className="w-20 h-20 object-cover rounded-full border-2 border-primary/30 mb-3 shadow-sm"
                loading="lazy"
              />
              <div className="flex flex-col items-center w-full">
                <span className="font-bold text-lg md:text-xl text-primary mb-1">{k.name}</span>
                <span className="text-xs text-gray-500 mb-2">{k.type.name}</span>
                <div className="grid grid-cols-3 gap-1 text-xs w-full mb-2">
                  {Object.entries(k.stats).map(([stat, value]) => (
                    <div key={stat} className="flex flex-col items-center">
                      <span className="text-gray-400">{stat}</span>
                      <span className="font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-xs text-accent font-medium">{k.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {selected !== null && (
        <KemonoModal
          kemonoId={selected}
          onClose={() => setSelected(null)}
          onBreed={handleBreed}
          onTrain={handleTrain}
        />
      )}
      {/* JobModal will be integrated in TrainingPage for job selection */}
    </section>
  );
}