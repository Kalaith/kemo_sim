import { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import KemonoModal from '../components/KemonoModal';
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
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6" style={{color: 'var(--kemo-primary)'}}>Your Kemonomimi Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {kemonomimi.length === 0 ? (
          <div className="col-span-full text-center" style={{color: 'var(--kemo-text-muted)'}}>No kemonomimi in your collection.</div>
        ) : (
          kemonomimi.map((k) => (
            <div
              key={k.id}
              className="kemo-card p-4 flex flex-col items-center cursor-pointer border-2 transition-all duration-300"
              style={{
                borderColor: selectedParent1 === k.id || selectedParent2 === k.id ? 'var(--kemo-primary)' : 'transparent'
              }}
              onClick={() => setSelected(k.id)}
            >
              <div 
                className="w-20 h-20 rounded-full border-3 mb-3 shadow-lg flex items-center justify-center text-4xl"
                style={{
                  borderColor: 'var(--kemo-primary-light)',
                  backgroundColor: 'var(--kemo-primary-bg)'
                }}
              >
                {k.type.emoji || '🐾'}
              </div>
              <div className="flex flex-col items-center w-full">
                <span className="font-bold text-lg md:text-xl mb-1" style={{color: 'var(--kemo-primary)'}}>{k.name}</span>
                <span className="text-xs mb-2" style={{color: 'var(--kemo-text-secondary)'}}>{k.type.name}</span>
                <div className="grid grid-cols-3 gap-1 text-xs w-full mb-2">
                  {Object.entries(k.stats).map(([stat, value]) => (
                    <div key={stat} className="flex flex-col items-center">
                      <span style={{color: 'var(--kemo-text-muted)', fontSize: '10px'}}>{stat}</span>
                      <span className="font-semibold" style={{color: 'var(--kemo-text-primary)'}}>{String(value)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-xs font-medium px-2 py-1 rounded-full" style={{color: 'var(--kemo-accent)', backgroundColor: 'var(--kemo-accent-bg)'}}>{k.status}</div>
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