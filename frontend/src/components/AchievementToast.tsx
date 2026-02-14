import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import type { Achievement } from '../types/game';

export default function AchievementToast() {
  const achievements = useGameStore(s => s.achievements);
  const [showToast, setShowToast] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const unlockedAchievement = achievements.find(
      a => a.unlocked && a.unlockedDate && Date.now() - new Date(a.unlockedDate).getTime() < 5000 // Within last 5 seconds
    );

    if (unlockedAchievement && unlockedAchievement !== currentAchievement) {
      setCurrentAchievement(unlockedAchievement);
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievements, currentAchievement]);

  if (!showToast || !currentAchievement) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className="text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm border-2"
        style={{
          background: 'linear-gradient(135deg, var(--kemo-success), var(--kemo-success-dark))',
          borderColor: 'var(--kemo-success-light)',
          boxShadow:
            '0 20px 25px -5px rgba(34, 197, 94, 0.4), 0 10px 10px -5px rgba(34, 197, 94, 0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-lg">{currentAchievement.icon}</span>
          <div>
            <h4 className="font-bold text-lg">Achievement Unlocked!</h4>
            <p className="text-sm font-semibold">{currentAchievement.name}</p>
            <p className="text-xs opacity-90">{currentAchievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
