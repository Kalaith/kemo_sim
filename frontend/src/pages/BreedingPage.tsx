import { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { KemonoAvatar } from '../components/KemonoAvatar';
import type { Kemonomimi } from '../types/game';

const BREEDING_COST = 200;
const BREEDING_DURATION_DAYS = 3;

export default function BreedingPage() {
  const kemonomimi = useGameStore(s => s.kemonomimi);
  const coins = useGameStore(s => s.coins);
  const selectedParent1 = useGameStore(s => s.selectedParent1);
  const selectedParent2 = useGameStore(s => s.selectedParent2);
  const setSelectedParent1 = useGameStore(s => s.setSelectedParent1);
  const setSelectedParent2 = useGameStore(s => s.setSelectedParent2);
  const breedingQueue = useGameStore(s => s.breedingQueue);
  const startBreeding = useGameStore(s => s.startBreeding);
  const lastDayLogs = useGameStore(s => s.lastDayLogs);
  const preview = useGameStore(s => s.breedingPreview);

  const [message, setMessage] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const availableKemonomimi = kemonomimi.filter(k => k.status === 'available');
  const parent1 = kemonomimi.find(k => k.id === selectedParent1) || null;
  const parent2 = kemonomimi.find(k => k.id === selectedParent2) || null;

  const getKemonomimiName = (id: number) => {
    return kemonomimi.find(item => item.id === id)?.name ?? `ID ${id}`;
  };

  const handleSelectParent = (kemono: Kemonomimi) => {
    if (!parent1) {
      setSelectedParent1(kemono.id);
      return;
    }

    if (!parent2 && kemono.id !== parent1.id) {
      setSelectedParent2(kemono.id);
      return;
    }

    setSelectedParent1(kemono.id);
    setSelectedParent2(null);
  };

  const handleStartBreeding = async () => {
    if (!parent1 || !parent2) {
      setMessage('Select two available kemonomimi to start breeding.');
      return;
    }

    if (coins < BREEDING_COST) {
      setMessage(`Need at least ${BREEDING_COST} coins.`);
      return;
    }

    setIsStarting(true);
    try {
      const result = await startBreeding(parent1.id, parent2.id);
      setMessage(result.message ?? (result.success ? 'Breeding started.' : 'Could not start breeding.'));
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">
        Breeding Center
      </h2>
      <div className="space-y-6">
        {message && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
            {message}
          </div>
        )}

        {lastDayLogs.length > 0 && (
          <div className="rounded-lg bg-surface border border-green-200 px-4 py-2 text-sm text-green-700">
            <h4 className="font-semibold text-green-800">Today's Updates</h4>
            <ul className="mt-1 list-disc pl-5 space-y-1 text-xs">
              {lastDayLogs.map(log => (
                <li key={log}>{log}</li>
              ))}
            </ul>
          </div>
        )}

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
              disabled={!parent1 || !parent2 || coins < BREEDING_COST || isStarting}
              onClick={handleStartBreeding}
            >
              {isStarting ? 'Starting...' : 'Start Breeding'}
            </button>
            <p className="text-xs text-gray-500">Cost: {BREEDING_COST} coins</p>
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

        {preview && (
          <div className="bg-surface rounded-xl p-4 border border-primary/20">
            <h3 className="font-semibold mb-2 text-primary">Breeding Preview</h3>
            <p className="text-sm text-gray-500">
              Type: {preview.expectedType} | Expected traits: {preview.expectedTraits.join(', ')}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              {Object.entries(preview.expectedStats).map(([stat, value]) => (
                <div key={stat} className="font-semibold text-gray-700">
                  {stat}: {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {availableKemonomimi.length === 0 ? (
          <div className="text-gray-500">
            No available kemonomimi for breeding. Train and wait for completion to free them up.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableKemonomimi.map(k => (
              <button
                key={k.id}
                type="button"
                className="bg-background rounded-lg shadow p-2 flex flex-col items-center cursor-pointer hover:ring-2 hover:ring-accent transition"
                onClick={() => handleSelectParent(k)}
              >
                <div className="flex items-center gap-2">
                  <KemonoAvatar
                    typeName={k.type.name}
                    index={k.id}
                    emoji={k.type.emoji}
                    alt={`${k.name} portrait`}
                    className="w-8 h-8 rounded-full border border-[var(--kemo-primary-light)] bg-[var(--kemo-primary-bg)] flex-shrink-0"
                    imageClassName="object-cover"
                  />
                  <span className="font-semibold text-primary">{k.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{k.type.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="bg-surface rounded-xl p-4 shadow border border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">Breeding Queue</h3>
          {breedingQueue.length === 0 ? (
            <div className="text-gray-400">No active breeding projects</div>
          ) : (
            <div className="space-y-4">
              {breedingQueue.map(item => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-4">
                    <span className="text-primary">
                      {getKemonomimiName(item.parent1Id)} × {getKemonomimiName(item.parent2Id)}
                    </span>
                    <div className="flex-1 h-2 bg-background rounded">
                    <div
                        className="h-2 bg-accent rounded"
                        style={{
                          width: `${Math.min(100, (item.progress / BREEDING_DURATION_DAYS) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.progress}/{BREEDING_DURATION_DAYS} days
                    </span>
                  </div>
                  {(item.expectedStats || item.expectedTraits) && (
                    <div className="text-xs text-gray-500">
                      Expected: {item.expectedStats?.strength ?? 0}/{item.expectedStats?.agility ?? 0}/
                      {item.expectedStats?.intelligence ?? 0}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
