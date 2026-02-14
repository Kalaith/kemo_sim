import { useGameStore } from '../hooks/useGameStore';
import type { Kemonomimi } from '../types/game';

interface KemonoModalProps {
  kemonoId: number;
  onClose: () => void;
  onBreed?: (kemono: Kemonomimi) => void;
  onTrain?: (kemono: Kemonomimi) => void;
}

export default function KemonoModal({ kemonoId, onClose, onBreed, onTrain }: KemonoModalProps) {
  const kemono = useGameStore(s => s.kemonomimi.find(k => k.id === kemonoId));
  if (!kemono) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="modal-content bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <div className="modal-header flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {kemono.name} - {kemono.type.name}
          </h3>
          <button onClick={onClose} className="btn btn--outline btn--sm text-xl">
            ×
          </button>
        </div>
        <div className="modal-body space-y-3">
          <div className="kemono-info">
            <div className="info-section mb-2">
              <h4 className="font-semibold">Physical Traits</h4>
              <p>
                <strong>Type:</strong> {kemono.type.name} ({kemono.type.animal})
              </p>
              <p>
                <strong>Age:</strong> {kemono.age} years
              </p>
              <p>
                <strong>Hair Color:</strong> {kemono.hairColor}
              </p>
              <p>
                <strong>Eye Color:</strong> {kemono.eyeColor}
              </p>
              <p>
                <strong>Personality:</strong> {kemono.personality}
              </p>
            </div>
            <div className="info-section mb-2">
              <h4 className="font-semibold">Natural Traits</h4>
              <div className="trait-list flex flex-wrap gap-2">
                {kemono.type.traits.map((trait: string) => (
                  <span
                    key={trait}
                    className="trait-tag bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <div className="info-section mb-2">
              <h4 className="font-semibold">Stats</h4>
              <div className="detailed-stats grid grid-cols-2 gap-2">
                {Object.entries(kemono.stats).map(([stat, value]) => (
                  <div key={stat} className="detailed-stat flex justify-between">
                    <div className="detailed-stat-name text-gray-500">{stat}</div>
                    <div className="detailed-stat-value font-semibold">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
            {kemono.trainedJobs.length > 0 && (
              <div className="info-section mb-2">
                <h4 className="font-semibold">Trained Jobs</h4>
                <div className="trait-list flex flex-wrap gap-2">
                  {kemono.trainedJobs.map((job: string) => (
                    <span
                      key={job}
                      className="trait-tag bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                    >
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer flex gap-2 mt-4">
          <button onClick={onClose} className="btn btn--secondary px-4 py-2 rounded bg-gray-200">
            Close
          </button>
          {kemono.status === 'available' && onBreed && (
            <button
              onClick={() => onBreed(kemono)}
              className="btn btn--primary px-4 py-2 rounded bg-blue-600 text-white"
            >
              Select for Breeding
            </button>
          )}
          {kemono.status === 'available' && onTrain && (
            <button
              onClick={() => onTrain(kemono)}
              className="btn btn--primary px-4 py-2 rounded bg-green-600 text-white"
            >
              Start Training
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
