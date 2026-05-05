import { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function StatisticsPage() {
  const { day, coins, getGameStats, achievements, exportGameData, importGameData, createBackup, restoreBackup, resetGameData } =
    useGameStore();
  const stats = getGameStats();
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;
  const [importMessage, setImportMessage] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const [fileVersion, setFileVersion] = useState(0);

  const handleExport = () => {
    const data = exportGameData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kemo-sim-save-day-${day}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const result = importGameData(content);
      setImportMessage(result.message ?? 'Import failed.');
      setFileVersion(v => v + 1);
    };
    reader.readAsText(file);
  };

  const handleBackup = () => {
    createBackup();
    setBackupMessage('Backup saved in current session store.');
  };

  const handleRestoreBackup = () => {
    const result = restoreBackup();
    setBackupMessage(result.message ?? (result.success ? 'Restored backup.' : 'Restore failed.'));
  };

  const handleReset = () => {
    if (window.confirm('Reset to default data? This clears queues and resets your progress.')) {
      resetGameData();
      setBackupMessage('Game reset to defaults.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="kemo-card p-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kemo-text-primary)' }}>
          Save Management
        </h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={handleExport} className="btn-success">
            Export Save Data
          </button>
          <button onClick={handleBackup} className="btn-secondary">
            Create Quick Backup
          </button>
          <button onClick={handleRestoreBackup} className="btn-accent">
            Restore Quick Backup
          </button>
          <button onClick={handleReset} className="btn-primary">
            Reset to Default
          </button>
          <label className="btn-primary cursor-pointer">
            Import Save Data
            <input
              key={fileVersion}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
        {importMessage && <div className="mt-3 text-sm text-blue-700">{importMessage}</div>}
        {backupMessage && <div className="mt-1 text-sm text-green-700">{backupMessage}</div>}
      </div>

      <div className="kemo-card p-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kemo-text-primary)' }}>
          Achievement Progress
        </h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {unlockedAchievements.length}/{totalAchievements}
            </span>
          </div>
          <div
            className="w-full rounded-full h-3 overflow-hidden"
            style={{ backgroundColor: 'var(--kemo-gray-200)' }}
          >
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(unlockedAchievements.length / totalAchievements) * 100}%`,
                background: 'linear-gradient(135deg, var(--kemo-primary), var(--kemo-secondary))',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.unlocked ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${achievement.unlocked ? 'text-green-800' : 'text-gray-600'}`}
                  >
                    {achievement.name}
                  </h3>
                  <p className={`text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  {achievement.unlockedDate && (
                    <p className="text-xs text-green-500 mt-1">
                      Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kemo-card p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--kemo-text-primary)' }}>
          Game Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold pb-2 border-b" style={{ color: 'var(--kemo-text-secondary)' }}>
              General
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Day:</span>
                <span className="font-medium">{stats.daysSurvived}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Coins:</span>
                <span className="font-medium">{coins.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold pb-2 border-b" style={{ color: 'var(--kemo-text-secondary)' }}>
              Collection
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Kemonomimi:</span>
                <span className="font-medium">{stats.totalKemonomimi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Breedings:</span>
                <span className="font-medium">{stats.totalBreedings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trainings:</span>
                <span className="font-medium">{stats.totalTrainings}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold pb-2 border-b" style={{ color: 'var(--kemo-text-secondary)' }}>
              Financial
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earned:</span>
                <span className="font-medium text-green-600">{stats.totalCoinsEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent:</span>
                <span className="font-medium text-red-600">{stats.totalCoinsSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Profit:</span>
                <span className={`font-medium ${stats.totalCoinsEarned - stats.totalCoinsSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats.totalCoinsEarned - stats.totalCoinsSpent).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold pb-2 border-b" style={{ color: 'var(--kemo-text-secondary)' }}>
            Notable Kemonomimi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.highestStatKemonomimi && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">🏆 Strongest</h4>
                <p className="text-sm text-yellow-700">{stats.highestStatKemonomimi.name}</p>
              </div>
            )}
            {stats.mostTrainedKemonomimi && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">📚 Most Trained</h4>
                <p className="text-sm text-blue-700">{stats.mostTrainedKemonomimi.name}</p>
              </div>
            )}
            {stats.oldestKemonomimi && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">⏰ Oldest</h4>
                <p className="text-sm text-purple-700">{stats.oldestKemonomimi.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
