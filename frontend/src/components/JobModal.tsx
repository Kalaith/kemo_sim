import { jobCategories } from "../utils/gameData";
import { useGameStore } from "../hooks/useGameStore";
import type { Kemonomimi } from "../types/game";

interface JobModalProps {
  kemono: Kemonomimi;
  onSelect: (jobName: string) => void;
  onClose: () => void;
}

export default function JobModal({ kemono, onSelect, onClose }: JobModalProps) {
  console.log("Kemonomimi:", kemono); // Use the `kemono` parameter to resolve the error

  const coins = useGameStore((s) => s.coins);
  const availableJobs = jobCategories.filter(
    (job) => coins >= job.trainingCost,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="modal-content bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <div className="modal-header flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Select Training Job</h3>
          <button
            onClick={onClose}
            className="btn btn--outline btn--sm text-xl"
          >
            ×
          </button>
        </div>
        <div className="modal-body space-y-3">
          {availableJobs.length === 0 ? (
            <div className="text-gray-400">
              Not enough coins for any training!
            </div>
          ) : (
            <div className="job-selection-grid grid gap-3">
              {availableJobs.map((job) => (
                <div
                  key={job.name}
                  className="job-option card cursor-pointer p-3 border rounded hover:bg-blue-50"
                  onClick={() => onSelect(job.name)}
                >
                  <h5 className="font-semibold">{job.name}</h5>
                  <p className="text-xs text-gray-500">{job.description}</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="job-cost">
                      Cost: {job.trainingCost} coins
                    </div>
                    <div className="job-duration">
                      Duration: {job.trainingTime} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
