import { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { jobCategories } from '../utils/gameData';
import JobModal from '../components/JobModal';
import type { Kemonomimi } from '../types/game';

export default function TrainingPage() {
  const kemonomimi = useGameStore(s => s.kemonomimi);
  const coins = useGameStore(s => s.coins);
  const setCoins = useGameStore(s => s.setCoins);
  const trainingQueue = useGameStore(s => s.trainingQueue);
  const setTrainingQueue = useGameStore(s => s.setTrainingQueue);

  const [selectedKemono, setSelectedKemono] = useState<Kemonomimi | null>(null);

  // Available kemonomimi for training
  const availableKemonomimi = kemonomimi.filter(k => k.status === 'available');

  // Handler for starting training
  const handleStartTraining = (kemono: Kemonomimi, jobName: string) => {
    const job = jobCategories.find(j => j.name === jobName);
    if (!job || coins < job.trainingCost) return;
    setCoins(coins - job.trainingCost);
    // Mark kemonomimi as training
    kemono.status = 'training';
    const trainingProject = {
      id: Date.now(),
      kemonomimi: kemono,
      job,
      progress: 0,
    };
    setTrainingQueue([...trainingQueue, trainingProject]);
    setSelectedKemono(null);
  };

  // Handler for advancing training progress (simulate day advance)
  const handleAdvanceTraining = () => {
    const updatedQueue = trainingQueue.map(item => ({
      ...item,
      progress: item.progress + 1,
    }));
    // If progress >= job.trainingTime, training is done
    const finished = updatedQueue.filter(item => item.progress >= item.job.trainingTime);
    const ongoing = updatedQueue.filter(item => item.progress < item.job.trainingTime);
    // For finished, update kemonomimi status and add job to trainedJobs
    finished.forEach(item => {
      item.kemonomimi.status = 'available';
      if (!item.kemonomimi.trainedJobs.includes(item.job.name)) {
        item.kemonomimi.trainedJobs.push(item.job.name);
      }
    });
    setTrainingQueue(ongoing);
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">
        Training Center
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-surface rounded-xl shadow-md p-4 w-full md:w-2/3">
          <h3 className="font-semibold mb-2 text-primary">Available Kemonomimi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableKemonomimi.length === 0 ? (
              <div className="text-gray-400 col-span-full">
                No kemonomimi available for training.
              </div>
            ) : (
              availableKemonomimi.map(k => (
                <div
                  key={k.id}
                  className="bg-background rounded-lg shadow p-2 flex flex-col items-center cursor-pointer hover:ring-2 hover:ring-accent transition"
                  onClick={() => setSelectedKemono(k)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-primary">{k.type.emoji}</span>
                    <span className="font-semibold text-primary">{k.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{k.type.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Click to train</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-surface rounded-xl shadow-md p-4 w-full md:w-1/3">
          <h3 className="font-semibold mb-2 text-primary">Training Progress</h3>
          {trainingQueue.length === 0 ? (
            <div className="text-gray-400">No kemonomimi currently training</div>
          ) : (
            <div className="space-y-2">
              {trainingQueue.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <span className="text-primary">
                    {item.kemonomimi.name} ({item.job.name})
                  </span>
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
              ))}
              <button
                className="mt-2 btn btn--secondary bg-secondary text-white px-3 py-1 rounded"
                onClick={handleAdvanceTraining}
              >
                Advance Day (Simulate)
              </button>
            </div>
          )}
        </div>
      </div>
      {selectedKemono && (
        <JobModal
          kemono={selectedKemono as Kemonomimi}
          onSelect={jobName => handleStartTraining(selectedKemono, jobName)}
          onClose={() => setSelectedKemono(null)}
        />
      )}
    </section>
  );
}
