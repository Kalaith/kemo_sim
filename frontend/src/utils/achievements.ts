import type { Achievement, Kemonomimi, GameStats } from "../types/game";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_kemonomimi",
    name: "First Friend",
    description: "Own your first kemonomimi",
    condition: "totalKemonomimi >= 1",
    icon: "🐾",
    unlocked: false,
  },
  {
    id: "collector",
    name: "Collector",
    description: "Own 10 kemonomimi",
    condition: "totalKemonomimi >= 10",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "breeder",
    name: "Breeder",
    description: "Successfully breed your first kemonomimi",
    condition: "totalBreedings >= 1",
    icon: "💕",
    unlocked: false,
  },
  {
    id: "trainer",
    name: "Trainer",
    description: "Train your first kemonomimi in a job",
    condition: "totalTrainings >= 1",
    icon: "📚",
    unlocked: false,
  },
  {
    id: "wealthy",
    name: "Wealthy",
    description: "Accumulate 10,000 coins",
    condition: "totalCoinsEarned >= 10000",
    icon: "💰",
    unlocked: false,
  },
  {
    id: "survivor",
    name: "Survivor",
    description: "Survive for 30 days",
    condition: "daysSurvived >= 30",
    icon: "📅",
    unlocked: false,
  },
  {
    id: "master_trainer",
    name: "Master Trainer",
    description: "Train kemonomimi 50 times",
    condition: "totalTrainings >= 50",
    icon: "🎓",
    unlocked: false,
  },
  {
    id: "family_founder",
    name: "Family Founder",
    description: "Have 5 successful breedings",
    condition: "totalBreedings >= 5",
    icon: "👨‍👩‍👧‍👦",
    unlocked: false,
  },
];

export function checkAchievements(
  achievements: Achievement[],
  stats: GameStats,
): Achievement[] {
  return achievements.map((achievement) => {
    if (achievement.unlocked) return achievement;

    let shouldUnlock = false;

    switch (achievement.id) {
      case "first_kemonomimi":
        shouldUnlock = stats.totalKemonomimi >= 1;
        break;
      case "collector":
        shouldUnlock = stats.totalKemonomimi >= 10;
        break;
      case "breeder":
        shouldUnlock = stats.totalBreedings >= 1;
        break;
      case "trainer":
        shouldUnlock = stats.totalTrainings >= 1;
        break;
      case "wealthy":
        shouldUnlock = stats.totalCoinsEarned >= 10000;
        break;
      case "survivor":
        shouldUnlock = stats.daysSurvived >= 30;
        break;
      case "master_trainer":
        shouldUnlock = stats.totalTrainings >= 50;
        break;
      case "family_founder":
        shouldUnlock = stats.totalBreedings >= 5;
        break;
    }

    if (shouldUnlock) {
      return {
        ...achievement,
        unlocked: true,
        unlockedDate: new Date().toISOString(),
      };
    }

    return achievement;
  });
}

export function calculateGameStats(
  kemonomimi: Kemonomimi[],
  day: number,
  totalCoinsEarned: number,
  totalCoinsSpent: number,
  totalBreedings: number,
  totalTrainings: number,
): GameStats {
  const highestStatKemonomimi = kemonomimi.reduce(
    (highest, kemono) => {
      const currentTotal = Object.values(kemono.stats).reduce(
        (sum, stat) => sum + stat,
        0,
      );
      const highestTotal = highest
        ? Object.values(highest.stats).reduce((sum, stat) => sum + stat, 0)
        : 0;
      return currentTotal > highestTotal ? kemono : highest;
    },
    null as Kemonomimi | null,
  );

  const mostTrainedKemonomimi = kemonomimi.reduce(
    (mostTrained, kemono) => {
      const currentJobs = kemono.trainedJobs.length;
      const mostTrainedJobs = mostTrained ? mostTrained.trainedJobs.length : 0;
      return currentJobs > mostTrainedJobs ? kemono : mostTrained;
    },
    null as Kemonomimi | null,
  );

  const oldestKemonomimi = kemonomimi.reduce(
    (oldest, kemono) => {
      return !oldest || kemono.age > oldest.age ? kemono : oldest;
    },
    null as Kemonomimi | null,
  );

  return {
    totalKemonomimi: kemonomimi.length,
    totalBreedings,
    totalTrainings,
    totalCoinsEarned,
    totalCoinsSpent,
    daysSurvived: day,
    highestStatKemonomimi,
    mostTrainedKemonomimi,
    oldestKemonomimi,
  };
}
