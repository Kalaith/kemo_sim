import { useMemo, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { jobCategories } from '../utils/gameData';
import { KemonoAvatar } from '../components/KemonoAvatar';
import JobModal from '../components/JobModal';
import type { Kemonomimi } from '../types/game';

export default function TrainingPage() {
  const kemonomimi = useGameStore(s => s.kemonomimi);
  const trainingQueue = useGameStore(s => s.trainingQueue);
  const lastDayLogs = useGameStore(s => s.lastDayLogs);
  const startTraining = useGameStore(s => s.startTraining);

  const [selectedKemono, setSelectedKemono] = useState<Kemonomimi | null>(null);
  const [message, setMessage] = useState('');

  const availableKemonomimi = kemonomimi.filter(k => k.status === 'available');
  const trainedKemonomimiCount = useMemo(
    () => new Set(kemonomimi.flatMap(k => k.trainedJobs)).size,
    [kemonomimi]
  );

  const getKemonomimiName = (kemonomimiId: number) =>
    kemonomimi.find(item => item.id === kemonomimiId)?.name ?? `ID ${kemonomimiId}`;

  const handleStartTraining = (kemono: Kemonomimi, jobName: string) => {
    const result = startTraining(kemono.id, jobName);
    setMessage(result.message ?? (result.success ? 'Training started.' : 'Could not start training.'));
    if (result.success) {
      setSelectedKemono(null);
    }
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">
        Training Center
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-surface rounded-xl shadow-md p-4 w-full md:w-2/3">
          <h3 className="font-semibold mb-2 text-primary">
            Available Kemonomimi ({availableKemonomimi.length})
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Total unique trained jobs unlocked: {trainedKemonomimiCount}
          </p>
          {message && (
            <div className="mb-3 text-sm rounded-lg bg-blue-50 border border-blue-200 px-4 py-2">
              {message}
            </div>
          )}
          {lastDayLogs.length > 0 && (
            <div className="text-xs rounded-lg bg-green-50 border border-green-200 px-4 py-2 mb-4">
              <h4 className="font-semibold text-green-800 mb-1">Today's Updates</h4>
              <ul className="list-disc pl-5 space-y-1">
                {lastDayLogs.map(log => (
                  <li key={log}>{log}</li>
                ))}
              </ul>
            </div>
          )}
          {availableKemonomimi.length === 0 ? (
            <div className="text-gray-400 col-span-full">
              No kemonomimi available for training.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableKemonomimi.map(k => (
                <button
                  key={k.id}
                  type="button"
                  className="bg-background rounded-lg shadow p-2 flex flex-col items-center cursor-pointer hover:ring-2 hover:ring-accent transition"
                  onClick={() => setSelectedKemono(k)}
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
                  <div className="text-xs text-gray-500 mt-1">
                    Trained jobs: {k.trainedJobs.length}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-surface rounded-xl shadow-md p-4 w-full md:w-1/3">
          <h3 className="font-semibold mb-2 text-primary">Training Progress</h3>
          {trainingQueue.length === 0 ? (
            <div className="text-gray-400">No kemonomimi currently training</div>
          ) : (
            <div className="space-y-2">
              {trainingQueue.map(item => (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary">{getKemonomimiName(item.kemonomimiId)}</span>
                    <span className="text-xs text-gray-500">({item.job.name})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-background rounded">
                      <div
                        className="h-2 bg-accent rounded"
                        style={{
                          width: `${Math.min(100, (item.progress / item.job.trainingTime) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.progress}/{item.job.trainingTime} days
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Requires: {item.job.requiredStats.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 text-xs text-gray-500">
            Jobs available: {jobCategories.length}
          </div>
        </div>
      </div>
      {selectedKemono && (
        <JobModal
          kemono={selectedKemono}
          onSelect={jobName => handleStartTraining(selectedKemono, jobName)}
          onClose={() => setSelectedKemono(null)}
        />
      )}
    </section>
  );
}
