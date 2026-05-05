// Kemonomimi core stats
export type Stat = 'strength' | 'agility' | 'intelligence' | 'charisma' | 'endurance' | 'loyalty';

export type KemonomimiStatus = 'available' | 'training' | 'breeding';

export interface ActionResult {
  success: boolean;
  message?: string;
}

export interface DayAdvanceResult {
  completedBreedings: number;
  completedTrainings: number;
  earnedCoins: number;
  logs: string[];
}

export interface KemonomimiType {
  name: string;
  animal: string;
  traits: string[];
  jobBonuses: Record<string, number>;
  baseStats: Record<Stat, number>;
  emoji?: string;
}

export interface Kemonomimi {
  id: number;
  name: string;
  type: KemonomimiType;
  stats: Record<Stat, number>;
  hairColor: string;
  eyeColor: string;
  personality: string;
  age: number;
  status: KemonomimiStatus;
  trainedJobs: string[];
  parents: number[] | null;
  children: number[];
  price?: number;
}

export interface JobCategory {
  name: string;
  description: string;
  requiredStats: Stat[];
  trainingCost: number;
  trainingTime: number;
  salaryMultiplier: number;
}

export interface BreedingQueueItem {
  id: number;
  parent1Id: number;
  parent2Id: number;
  progress: number;
  expectedStats?: Record<Stat, number>;
  expectedTraits?: string[];
  expectedType?: string;
}

export interface TrainingQueueItem {
  id: number;
  kemonomimiId: number;
  job: JobCategory;
  progress: number;
}

export interface MarketKemonomimi extends Kemonomimi {
  price: number;
}

export interface FamilyTreeNode {
  kemonomimi: Kemonomimi;
  children: FamilyTreeNode[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
}

export interface GameStats {
  totalKemonomimi: number;
  totalBreedings: number;
  totalTrainings: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  daysSurvived: number;
  highestStatKemonomimi: Kemonomimi | null;
  mostTrainedKemonomimi: Kemonomimi | null;
  oldestKemonomimi: Kemonomimi | null;
}

export interface GameSaveData {
  saveVersion: number;
  saveDate: string;
  coins: number;
  day: number;
  kemonomimi: Kemonomimi[];
  breedingQueue: BreedingQueueItem[];
  trainingQueue: TrainingQueueItem[];
  marketStock: MarketKemonomimi[];
  achievements: Achievement[];
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalBreedings: number;
  totalTrainings: number;
  nextId: number;
  selectedParent1: number | null;
  selectedParent2: number | null;
  hasSeenOnboarding: boolean;
  lastBackup: string | null;
  lastDayLogs: string[];
}
