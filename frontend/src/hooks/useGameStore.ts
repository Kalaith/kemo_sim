import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as mockApi from '../api/mockApi';
import type {
  Kemonomimi,
  KemonomimiType,
  BreedingQueueItem,
  TrainingQueueItem,
  MarketKemonomimi,
  Achievement,
  GameStats,
  ActionResult,
  DayAdvanceResult,
  Stat,
  GameSaveData,
  JobCategory,
} from '../types/game';
import { ACHIEVEMENTS, calculateGameStats, checkAchievements } from '../utils/achievements';
import { hairColors, eyeColors, kemonomimiTypes, jobCategories, personalityTraits } from '../utils/gameData';

type StoredValue = Record<string, unknown>;

interface GameState {
  coins: number;
  day: number;
  kemonomimi: Kemonomimi[];
  setKemonomimi: (kemono: Kemonomimi[]) => void;
  breedingQueue: BreedingQueueItem[];
  setBreedingQueue: (queue: BreedingQueueItem[]) => void;
  trainingQueue: TrainingQueueItem[];
  setTrainingQueue: (queue: TrainingQueueItem[]) => void;
  marketStock: MarketKemonomimi[];
  setMarketStock: (stock: MarketKemonomimi[]) => void;
  nextId: number;
  setNextId: (id: number) => void;
  selectedParent1: number | null;
  selectedParent2: number | null;
  setSelectedParent1: (id: number | null) => void;
  setSelectedParent2: (id: number | null) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  lastDayLogs: string[];
  loadError: string | null;
  // Achievements and statistics
  achievements: Achievement[];
  setAchievements: (achievements: Achievement[]) => void;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalBreedings: number;
  totalTrainings: number;
  lastBackup: string | null;
  // Methods
  addKemonomimi: (kemono: Kemonomimi) => void;
  setCoins: (coins: number) => void;
  addCoinsEarned: (amount: number) => void;
  addCoinsSpent: (amount: number) => void;
  incrementBreedings: () => void;
  incrementTrainings: () => void;
  advanceDay: () => DayAdvanceResult;
  startBreeding: (parent1Id: number, parent2Id: number) => ActionResult;
  startTraining: (kemonoId: number, jobName: string) => ActionResult;
  initGameData: () => Promise<void>;
  resetGameData: () => Promise<void>;
  createBackup: () => void;
  restoreBackup: () => ActionResult;
  getGameStats: () => GameStats;
  checkAndUpdateAchievements: () => void;
  exportGameData: () => string;
  importGameData: (data: string) => ActionResult;
}

const STATS: Stat[] = ['strength', 'agility', 'intelligence', 'charisma', 'endurance', 'loyalty'];
const STARTING_COINS = 1000;
const STARTING_DAY = 1;
const BREEDING_COST = 200;
const BREEDING_DURATION_DAYS = 3;
const SAVE_VERSION = 1;
const SAVE_KEY = 'kemonomimi-game';

const defaultAchievements = () => ACHIEVEMENTS.map(achievement => ({ ...achievement }));

const clampStat = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

const toInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const isRecord = (value: unknown): value is StoredValue => {
  return typeof value === 'object' && value !== null;
};

const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomPick = <T,>(values: T[]): T => values[Math.floor(Math.random() * values.length)];

const unique = (values: string[]): string[] => {
  return [...new Set(values)];
};

const normalizeKemonomimiType = (raw: unknown): KemonomimiType => {
  if (!isRecord(raw)) {
    return kemonomimiTypes[0];
  }

  const base = raw as StoredValue;
  const name = typeof base.name === 'string' ? base.name : kemonomimiTypes[0].name;
  const animal = typeof base.animal === 'string' ? base.animal : kemonomimiTypes[0].animal;
  const normalizedTraits = Array.isArray(base.traits)
    ? base.traits.filter((trait): trait is string => typeof trait === 'string')
    : [];
  const jobBonusesRaw = isRecord(base.jobBonuses) ? base.jobBonuses : {};
  const baseStats = normalizeStats(base.baseStats);
  const emoji = typeof base.emoji === 'string' ? base.emoji : undefined;

  return {
    name,
    animal,
    traits: normalizedTraits,
    jobBonuses: jobBonusesRaw as Record<string, number>,
    baseStats,
    emoji,
  };
};

const normalizeStats = (raw: unknown): Record<Stat, number> => {
  const source = isRecord(raw) ? (raw as StoredValue) : {};
  return STATS.reduce((acc, stat) => {
    acc[stat] = clampStat(toInt(source[stat], 40));
    return acc;
  }, {} as Record<Stat, number>);
};

const normalizeKemonomimi = (raw: unknown): Kemonomimi => {
  const source = isRecord(raw) ? (raw as StoredValue) : {};
  const type = normalizeKemonomimiType(source.type);
  const status = source.status === 'training' || source.status === 'breeding' ? source.status : 'available';
  const parents = Array.isArray(source.parents)
    ? source.parents
        .map(parent => toInt(parent, 0))
        .filter(parentId => parentId > 0)
    : null;
  const children = Array.isArray(source.children)
    ? source.children
        .map(child => toInt(child, 0))
        .filter(childId => childId > 0)
    : [];
  const normalizedPrice = toInt(source.price, -1);

  return {
    id: Math.max(1, toInt(source.id, 1)),
    name: typeof source.name === 'string' ? source.name : 'Kemonomimi',
    type,
    stats: normalizeStats(source.stats),
    hairColor: typeof source.hairColor === 'string' ? source.hairColor : randomPick(hairColors),
    eyeColor: typeof source.eyeColor === 'string' ? source.eyeColor : randomPick(eyeColors),
    personality: typeof source.personality === 'string' ? source.personality : randomPick(personalityTraits),
    age: Math.max(1, toInt(source.age, 18)),
    status,
    trainedJobs: Array.isArray(source.trainedJobs)
      ? source.trainedJobs.filter((job): job is string => typeof job === 'string')
      : [],
    parents: parents && parents.length > 0 ? parents : null,
    children,
    price: normalizedPrice > 0 ? normalizedPrice : undefined,
  };
};

const normalizeBreedingQueueItem = (raw: unknown): BreedingQueueItem | null => {
  if (!isRecord(raw)) {
    return null;
  }
  const source = raw as StoredValue;
  const parent1Explicit = toInt(source.parent1Id, 0);
  const parent2Explicit = toInt(source.parent2Id, 0);
  const legacyParents = Array.isArray(source.parents)
    ? source.parents
        .map(parent => toInt(parent, 0))
        .filter(parentId => parentId > 0)
    : [];
  const parent1Id = parent1Explicit > 0 ? parent1Explicit : legacyParents[0] ?? 0;
  const parent2Id = parent2Explicit > 0 ? parent2Explicit : legacyParents[1] ?? 0;

  if (parent1Id <= 0 || parent2Id <= 0) {
    return null;
  }

  const expectedStats = isRecord(source.expectedStats)
    ? normalizeStats(source.expectedStats)
    : undefined;
  const expectedTraits = Array.isArray(source.expectedTraits)
    ? source.expectedTraits.filter((trait): trait is string => typeof trait === 'string')
    : undefined;
  const expectedType =
    typeof source.expectedType === 'string' ? source.expectedType : undefined;

  return {
    id: Math.max(1, toInt(source.id, Date.now())),
    parent1Id,
    parent2Id,
    progress: Math.max(0, toInt(source.progress, 0)),
    expectedStats,
    expectedTraits,
    expectedType,
  };
};

const normalizeJob = (raw: unknown): JobCategory | null => {
  if (!isRecord(raw) || typeof raw.name !== 'string') {
    return null;
  }
  const name = raw.name as string;
  return jobCategories.find(job => job.name === name) ?? null;
};

const normalizeTrainingQueueItem = (raw: unknown): TrainingQueueItem | null => {
  if (!isRecord(raw)) {
    return null;
  }
  const source = raw as StoredValue;
  const kemonomimiId = toInt(source.kemonomimiId, 0);
  if (kemonomimiId <= 0) {
    return null;
  }
  const savedJob = normalizeJob(source.job);
  const legacyJobName = typeof source.job === 'string' ? source.job : null;
  const resolvedJob = savedJob ?? (legacyJobName ? jobCategories.find(job => job.name === legacyJobName) : null);

  if (!resolvedJob) {
    return null;
  }

  return {
    id: Math.max(1, toInt(source.id, Date.now())),
    kemonomimiId,
    job: resolvedJob,
    progress: Math.max(0, toInt(source.progress, 0)),
  };
};

const normalizeMarketKemonomimi = (raw: unknown): MarketKemonomimi => {
  const base = normalizeKemonomimi(raw);
  const normalizedPrice = toInt((isRecord(raw) ? (raw as StoredValue).price : undefined), 0);
  return {
    ...base,
    price: normalizedPrice > 0 ? normalizedPrice : Math.max(80, Math.round(Object.values(base.stats).reduce((sum, value) => sum + value, 0) / 3)),
  };
};

const normalizeAchievements = (raw: unknown): Achievement[] => {
  if (!Array.isArray(raw)) {
    return defaultAchievements();
  }

  return raw
    .map((item): Achievement | null => {
      if (!isRecord(item)) {
        return null;
      }

      const source = item as StoredValue;
      const id = typeof source.id === 'string' ? source.id : '';
      const template = ACHIEVEMENTS.find(base => base.id === id);

      if (!template) {
        return null;
      }

      return {
        ...template,
        unlocked: source.unlocked === true,
        unlockedDate: typeof source.unlockedDate === 'string' ? source.unlockedDate : template.unlockedDate,
      };
    })
    .filter((value): value is Achievement => value !== null);
};

const computeNextId = (kemonomimi: Kemonomimi[], marketStock: MarketKemonomimi[]): number => {
  const maxKemonoId = kemonomimi.reduce((max, item) => Math.max(max, item.id), 0);
  const maxMarketId = marketStock.reduce((max, item) => Math.max(max, item.id), 0);
  return Math.max(maxKemonoId, maxMarketId, 1) + 1;
};

const buildBreedingPreview = (
  parent1: Kemonomimi,
  parent2: Kemonomimi
): {
  expectedStats: Record<Stat, number>;
  expectedTraits: string[];
  expectedType: string;
} => {
  const expectedStats = STATS.reduce((acc, stat) => {
    const baseValue = (parent1.stats[stat] + parent2.stats[stat]) / 2;
    acc[stat] = clampStat(baseValue + randomInRange(-4, 4));
    return acc;
  }, {} as Record<Stat, number>);

  const baseTraits = unique([...parent1.type.traits, ...parent2.type.traits]).slice(0, 4);
  const jitterTraits = unique(baseTraits).filter(trait => Math.random() < 0.75);

  return {
    expectedStats,
    expectedTraits: jitterTraits.length > 0 ? jitterTraits : ['Bright', 'Curious'],
    expectedType: Math.random() < 0.5 ? parent1.type.name : parent2.type.name,
  };
};

const buildOffspring = (
  parent1: Kemonomimi,
  parent2: Kemonomimi,
  nextId: number,
  day: number,
  preview: {
    expectedStats: Record<Stat, number>;
    expectedTraits: string[];
    expectedType: string;
  }
): Kemonomimi => {
  const matchingType = kemonomimiTypes.find(type => type.name === preview.expectedType);
  const type = matchingType ?? (Math.random() < 0.5 ? parent1.type : parent2.type);
  const baseStats = {
    ...preview.expectedStats,
    ...STATS.reduce((acc, stat) => {
      acc[stat] = clampStat(preview.expectedStats[stat] + randomInRange(-2, 2));
      return acc;
    }, {} as Record<Stat, number>),
  };
  const traits = unique([...preview.expectedTraits, ...parent1.type.traits, ...parent2.type.traits]).slice(0, 4);
  const suffix = randomInRange(1, 99);

  return {
    id: nextId,
    name: `${parent1.name}-${parent2.name} ${suffix}`,
    type,
    stats: baseStats,
    hairColor: randomPick([parent1.hairColor, parent2.hairColor]),
    eyeColor: randomPick([parent1.eyeColor, parent2.eyeColor]),
    personality: randomPick([...parent1.personality.split(' '), ...parent2.personality.split(' ')]),
    age: 1,
    status: 'available',
    trainedJobs: [],
    parents: [parent1.id, parent2.id],
    children: [],
    price: Math.max(90, Math.round((Object.values(baseStats).reduce((sum, value) => sum + value, 0) * day) / 2)),
  };
};

const applyTrainingCompletion = (
  kemono: Kemonomimi,
  job: JobCategory
): { kemonomimi: Kemonomimi; earnedCoins: number } => {
  let earnedCoins = 0;
  const updatedStats = { ...kemono.stats };

  const bonusStats = job.requiredStats;
  bonusStats.forEach(stat => {
    const gain = randomInRange(2, 6);
    updatedStats[stat] = clampStat(updatedStats[stat] + gain);
    earnedCoins += gain;
  });

  const reward = Math.max(10, Math.round((kemono.age + earnedCoins * 2) * job.salaryMultiplier));
  const trainedJobs = kemono.trainedJobs.includes(job.name)
    ? kemono.trainedJobs
    : [...kemono.trainedJobs, job.name];

  return {
    kemonomimi: {
      ...kemono,
      status: 'available',
      trainedJobs,
      stats: updatedStats,
    },
    earnedCoins: reward,
  };
};

const deriveSaveData = (state: GameState): GameSaveData => ({
  saveVersion: SAVE_VERSION,
  saveDate: new Date().toISOString(),
  coins: state.coins,
  day: state.day,
  kemonomimi: state.kemonomimi,
  breedingQueue: state.breedingQueue,
  trainingQueue: state.trainingQueue,
  marketStock: state.marketStock,
  achievements: state.achievements,
  totalCoinsEarned: state.totalCoinsEarned,
  totalCoinsSpent: state.totalCoinsSpent,
  totalBreedings: state.totalBreedings,
  totalTrainings: state.totalTrainings,
  nextId: state.nextId,
  selectedParent1: state.selectedParent1,
  selectedParent2: state.selectedParent2,
  hasSeenOnboarding: state.hasSeenOnboarding,
  lastBackup: state.lastBackup,
  lastDayLogs: state.lastDayLogs,
});

const parseSaveData = (data: string): { success: boolean; data?: GameSaveData; error?: string } => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return { success: false, error: 'Save data is not valid JSON.' };
  }

  if (!isRecord(parsed)) {
    return { success: false, error: 'Save data format is invalid.' };
  }

  const saveVersion =
    typeof parsed.saveVersion === 'number' && Number.isInteger(parsed.saveVersion)
      ? parsed.saveVersion
      : 0;
  if (saveVersion > SAVE_VERSION) {
    return { success: false, error: 'Save data version is unsupported.' };
  }

  const kemonomimi = Array.isArray(parsed.kemonomimi) ? parsed.kemonomimi.map(normalizeKemonomimi) : [];
  const marketStock = Array.isArray(parsed.marketStock)
    ? parsed.marketStock.map(normalizeMarketKemonomimi)
    : [];
  const breedingQueue = Array.isArray(parsed.breedingQueue)
    ? parsed.breedingQueue.map(normalizeBreedingQueueItem).filter((item): item is BreedingQueueItem => item !== null)
    : [];
  const trainingQueue = Array.isArray(parsed.trainingQueue)
    ? parsed.trainingQueue
        .map(normalizeTrainingQueueItem)
        .filter((item): item is TrainingQueueItem => item !== null)
    : [];
  const validKemonomimiIds = new Set(kemonomimi.map(item => item.id));
  const safeBreedingQueue = breedingQueue.filter(
    item => validKemonomimiIds.has(item.parent1Id) && validKemonomimiIds.has(item.parent2Id)
  );
  const safeTrainingQueue = trainingQueue.filter(item => validKemonomimiIds.has(item.kemonomimiId));

  const coins = Math.max(0, toInt(parsed.coins, STARTING_COINS));
  const day = Math.max(1, toInt(parsed.day, STARTING_DAY));
  const nextId = Math.max(1, toInt(parsed.nextId, 1));
  const achievements = normalizeAchievements(parsed.achievements);
  const totalCoinsEarned = Math.max(0, toInt(parsed.totalCoinsEarned, 0));
  const totalCoinsSpent = Math.max(0, toInt(parsed.totalCoinsSpent, 0));
  const totalBreedings = Math.max(0, toInt(parsed.totalBreedings, 0));
  const totalTrainings = Math.max(0, toInt(parsed.totalTrainings, 0));
  const selectedParent1Raw = toInt(parsed.selectedParent1, 0);
  const selectedParent2Raw = toInt(parsed.selectedParent2, 0);
  const selectedParent1 = validKemonomimiIds.has(selectedParent1Raw) ? selectedParent1Raw : null;
  const selectedParent2 = validKemonomimiIds.has(selectedParent2Raw) ? selectedParent2Raw : null;
  const hasSeenOnboarding = parsed.hasSeenOnboarding === true;
  const lastBackup = typeof parsed.lastBackup === 'string' ? parsed.lastBackup : null;
  const lastDayLogs = Array.isArray(parsed.lastDayLogs)
    ? parsed.lastDayLogs
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 20)
    : [];
  const queuedForBreeding = new Set(
    safeBreedingQueue.flatMap(item => [item.parent1Id, item.parent2Id])
  );
  const queuedForTraining = new Set(safeTrainingQueue.map(item => item.kemonomimiId));
  const normalizedKemonomimi = kemonomimi.map(kemono => {
    if (queuedForBreeding.has(kemono.id)) {
      return { ...kemono, status: 'breeding' };
    }
    if (queuedForTraining.has(kemono.id)) {
      return { ...kemono, status: 'training' };
    }
    return kemono;
  });

  const fallbackId = computeNextId(kemonomimi, marketStock);
  const safeNextId = Math.max(nextId, fallbackId);

  const safeState = {
    saveVersion: SAVE_VERSION,
    saveDate: new Date().toISOString(),
    coins,
    day,
    kemonomimi: normalizedKemonomimi,
    breedingQueue: safeBreedingQueue,
    trainingQueue: safeTrainingQueue,
    marketStock,
    achievements,
    totalCoinsEarned,
    totalCoinsSpent,
    totalBreedings,
    totalTrainings,
    nextId: safeNextId,
    selectedParent1: selectedParent1,
    selectedParent2: selectedParent2,
    hasSeenOnboarding,
    lastBackup,
    lastDayLogs,
  };

  return { success: true, data: safeState };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: STARTING_COINS,
      day: STARTING_DAY,
      kemonomimi: [] as Kemonomimi[],
      setKemonomimi: kemono => {
        set(state => ({
          kemonomimi: kemono,
          nextId: computeNextId(kemono, state.marketStock),
        }));
      },
      breedingQueue: [] as BreedingQueueItem[],
      setBreedingQueue: queue => {
        set(() => ({ breedingQueue: queue }));
      },
      trainingQueue: [] as TrainingQueueItem[],
      setTrainingQueue: queue => {
        set(() => ({ trainingQueue: queue }));
      },
      marketStock: [] as MarketKemonomimi[],
      setMarketStock: stock => {
        set(() => ({ marketStock: stock }));
      },
      nextId: 1,
      setNextId: id => {
        set(() => ({ nextId: id }));
      },
      selectedParent1: null,
      selectedParent2: null,
      setSelectedParent1: id => {
        set(() => ({ selectedParent1: id }));
      },
      setSelectedParent2: id => {
        set(() => ({ selectedParent2: id }));
      },
      hasSeenOnboarding: false,
      setHasSeenOnboarding: value => {
        set(() => ({ hasSeenOnboarding: value }));
      },
      lastDayLogs: [],
      loadError: null,
      achievements: defaultAchievements(),
      setAchievements: achievements => {
        set(() => ({ achievements }));
      },
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      totalBreedings: 0,
      totalTrainings: 0,
      lastBackup: null,
      addKemonomimi: kemono => {
        set(state => ({
          kemonomimi: [...state.kemonomimi, kemono],
          nextId: Math.max(state.nextId, kemono.id + 1),
        }));
        get().checkAndUpdateAchievements();
      },
      setCoins: coins => {
        set(() => ({ coins }));
      },
      addCoinsEarned: amount => {
        set(state => ({
          totalCoinsEarned: state.totalCoinsEarned + amount,
          coins: state.coins + amount,
        }));
        get().checkAndUpdateAchievements();
      },
      addCoinsSpent: amount => {
        set(state => ({
          totalCoinsSpent: state.totalCoinsSpent + amount,
          coins: state.coins - amount,
        }));
      },
      incrementBreedings: () => {
        set(state => ({ totalBreedings: state.totalBreedings + 1 }));
        get().checkAndUpdateAchievements();
      },
      incrementTrainings: () => {
        set(state => ({ totalTrainings: state.totalTrainings + 1 }));
        get().checkAndUpdateAchievements();
      },
      startBreeding: (parent1Id, parent2Id) => {
        const state = get();
        if (parent1Id === parent2Id) {
          return { success: false, message: 'You cannot breed the same kemonomimi with itself.' };
        }

        const parent1 = state.kemonomimi.find(kemono => kemono.id === parent1Id);
        const parent2 = state.kemonomimi.find(kemono => kemono.id === parent2Id);

        if (!parent1 || !parent2) {
          return { success: false, message: 'Both parents must be selected to start breeding.' };
        }

        if (state.coins < BREEDING_COST) {
          return { success: false, message: `Need at least ${BREEDING_COST} coins.` };
        }

        const parent1Busy =
          parent1.status !== 'available' ||
          state.breedingQueue.some(item => item.parent1Id === parent1Id || item.parent2Id === parent1Id);
        const parent2Busy =
          parent2.status !== 'available' ||
          state.breedingQueue.some(item => item.parent1Id === parent2Id || item.parent2Id === parent2Id);

        if (parent1Busy || parent2Busy) {
          return { success: false, message: 'One or both selected kemonomimi are currently busy.' };
        }

        const preview = buildBreedingPreview(parent1, parent2);
        const newProject: BreedingQueueItem = {
          id: Date.now(),
          parent1Id,
          parent2Id,
          progress: 0,
          expectedStats: preview.expectedStats,
          expectedTraits: preview.expectedTraits,
          expectedType: preview.expectedType,
        };

        const nextId = Math.max(state.nextId, parent1.id + 1, parent2.id + 1);

        set(() => ({
          kemonomimi: state.kemonomimi.map(kemono => {
            if (kemono.id === parent1.id || kemono.id === parent2.id) {
              return { ...kemono, status: 'breeding' };
            }
            return kemono;
          }),
          breedingQueue: [...state.breedingQueue, newProject],
          coins: state.coins - BREEDING_COST,
          totalCoinsSpent: state.totalCoinsSpent + BREEDING_COST,
          nextId,
          selectedParent1: null,
          selectedParent2: null,
          lastDayLogs: [`Started breeding ${parent1.name} and ${parent2.name}.`],
        }));
        get().checkAndUpdateAchievements();
        return { success: true, message: 'Breeding started.' };
      },
      startTraining: (kemonoId, jobName) => {
        const state = get();
        const kemono = state.kemonomimi.find(item => item.id === kemonoId);
        const job = jobCategories.find(candidate => candidate.name === jobName);

        if (!kemono) {
          return { success: false, message: 'Selected kemonomimi is missing.' };
        }

        if (!job) {
          return { success: false, message: 'Invalid training job.' };
        }

        if (state.coins < job.trainingCost) {
          return {
            success: false,
            message: `Need at least ${job.trainingCost} coins to start ${job.name}.`,
          };
        }

        if (
          kemono.status !== 'available' ||
          state.trainingQueue.some(item => item.kemonomimiId === kemonoId)
        ) {
          return { success: false, message: `${kemono.name} is not available to train right now.` };
        }

        const newProject: TrainingQueueItem = {
          id: Date.now(),
          kemonomimiId: kemonoId,
          job,
          progress: 0,
        };

        set(() => ({
          kemonomimi: state.kemonomimi.map(item =>
            item.id === kemono.id ? { ...item, status: 'training' } : item
          ),
          trainingQueue: [...state.trainingQueue, newProject],
          coins: state.coins - job.trainingCost,
          totalCoinsSpent: state.totalCoinsSpent + job.trainingCost,
          lastDayLogs: [`Started training ${kemono.name} in ${job.name}.`],
        }));
        get().checkAndUpdateAchievements();

        return { success: true, message: `${kemono.name} started training in ${job.name}.` };
      },
      advanceDay: () => {
        const state = get();
        const nextDay = state.day + 1;
        const logs: string[] = [];
        let nextId = state.nextId;
        let earnedFromTraining = 0;
        let completedBreedings = 0;
        let completedTrainings = 0;
        let nextKemonomimi = state.kemonomimi.map(item => ({ ...item, age: item.age + 1 }));
        let nextBreedingQueue: BreedingQueueItem[] = [];
        let nextTrainingQueue: TrainingQueueItem[] = [];

        const findKemonomimi = (id: number): Kemonomimi | undefined =>
          nextKemonomimi.find(item => item.id === id);

        const attachChildToParent = (parentId: number, childId: number) => {
          nextKemonomimi = nextKemonomimi.map(item => {
            if (item.id !== parentId) {
              return item;
            }
            return {
              ...item,
              children: unique([...item.children, childId]),
            };
          });
        };

        const updateKemonomimi = (id: number, updater: (item: Kemonomimi) => Kemonomimi) => {
          nextKemonomimi = nextKemonomimi.map(item => (item.id === id ? updater(item) : item));
        };

        const resolvedBreeding = state.breedingQueue.map(item => {
          const progressed = { ...item, progress: item.progress + 1 };
          return { ...progressed };
        });

        resolvedBreeding.forEach(item => {
          if (item.progress >= BREEDING_DURATION_DAYS) {
            const parent1 = findKemonomimi(item.parent1Id);
            const parent2 = findKemonomimi(item.parent2Id);

            if (!parent1 || !parent2) {
              logs.push('A breeding project ended but a parent was missing.');
              return;
            }

            const preview = item.expectedStats && item.expectedTraits && item.expectedType
              ? {
                  expectedStats: item.expectedStats,
                  expectedTraits: item.expectedTraits,
                  expectedType: item.expectedType,
                }
              : buildBreedingPreview(parent1, parent2);
            const child = buildOffspring(parent1, parent2, nextId, nextDay, preview);
            nextKemonomimi = [...nextKemonomimi, child];
            nextId += 1;
            attachChildToParent(parent1.id, child.id);
            attachChildToParent(parent2.id, child.id);
            updateKemonomimi(parent1.id, item => ({ ...item, status: 'available' }));
            updateKemonomimi(parent2.id, item => ({ ...item, status: 'available' }));

            completedBreedings += 1;
            logs.push(
              `Breeding complete: ${parent1.name} and ${parent2.name} produced ${child.name}.`
            );
          } else {
            nextBreedingQueue = [...nextBreedingQueue, item];
          }
        });

        state.trainingQueue.forEach(item => {
          const progressed = item.progress + 1;
          const kemonomimi = findKemonomimi(item.kemonomimiId);

          if (!kemonomimi) {
            return;
          }

          if (progressed >= item.job.trainingTime) {
            const result = applyTrainingCompletion(kemonomimi, item.job);
            updateKemonomimi(item.kemonomimiId, () => result.kemonomimi);
            completedTrainings += 1;
            earnedFromTraining += result.earnedCoins;
            logs.push(`${kemonomimi.name} completed ${item.job.name} and earned ${result.earnedCoins} coins.`);
          } else {
            nextTrainingQueue = [...nextTrainingQueue, { ...item, progress: progressed }];
          }
        });

        set(state => ({
          day: nextDay,
          kemonomimi: nextKemonomimi,
          breedingQueue: nextBreedingQueue,
          trainingQueue: nextTrainingQueue,
          nextId,
          lastDayLogs: logs,
          coins: state.coins + earnedFromTraining,
          totalCoinsEarned: state.totalCoinsEarned + earnedFromTraining,
          totalBreedings: state.totalBreedings + completedBreedings,
          totalTrainings: state.totalTrainings + completedTrainings,
        }));
        get().checkAndUpdateAchievements();

        return {
          completedBreedings,
          completedTrainings,
          earnedCoins: earnedFromTraining,
          logs,
        };
      },
      initGameData: async () => {
        try {
          set(() => ({ loadError: null }));
          const [initialKemono, market] = await Promise.all([
            stateHasData(get().kemonomimi) ? Promise.resolve(get().kemonomimi) : mockApi.fetchKemonomimi(),
            stateHasData(get().marketStock) ? Promise.resolve(get().marketStock) : mockApi.fetchMarket(),
          ]);

          set(state => ({
            kemonomimi: state.kemonomimi.length === 0 ? initialKemono : state.kemonomimi,
            marketStock: state.marketStock.length === 0 ? market : state.marketStock,
            nextId: computeNextId(
              state.kemonomimi.length === 0 ? initialKemono : state.kemonomimi,
              state.marketStock.length === 0 ? market : state.marketStock
            ),
            lastDayLogs: state.lastDayLogs.length === 0 ? ['Welcome to Kemo Sim!'] : state.lastDayLogs,
          }));
          get().checkAndUpdateAchievements();
        } catch {
          set(() => ({ loadError: 'Failed to load game data. Please retry.' }));
        }
      },
      resetGameData: async () => {
        try {
          const [initialKemono, market] = await Promise.all([
            mockApi.fetchKemonomimi(),
            mockApi.fetchMarket(),
          ]);
          set({
            coins: STARTING_COINS,
            day: STARTING_DAY,
            kemonomimi: initialKemono,
            breedingQueue: [],
            trainingQueue: [],
            marketStock: market,
            nextId: computeNextId(initialKemono, market),
            selectedParent1: null,
            selectedParent2: null,
            achievements: defaultAchievements(),
            totalCoinsEarned: 0,
            totalCoinsSpent: 0,
            totalBreedings: 0,
            totalTrainings: 0,
            lastDayLogs: ['Game reset to default settings.'],
            loadError: null,
          });
          get().checkAndUpdateAchievements();
        } catch {
          set(() => ({ loadError: 'Failed to reset game data. Please retry.' }));
        }
      },
      createBackup: () => {
        set(state => ({ lastBackup: JSON.stringify(deriveSaveData(state), null, 2) }));
      },
      restoreBackup: () => {
        const backup = get().lastBackup;
        if (!backup) {
          return { success: false, message: 'No backup exists.' };
        }
        return get().importGameData(backup);
      },
      getGameStats: () => {
        const state = get();
        return calculateGameStats(
          state.kemonomimi,
          state.day,
          state.totalCoinsEarned,
          state.totalCoinsSpent,
          state.totalBreedings,
          state.totalTrainings
        );
      },
      checkAndUpdateAchievements: () => {
        const state = get();
        const stats = state.getGameStats();
        const updatedAchievements = checkAchievements(state.achievements, stats);
        const hasChanges = updatedAchievements.some(
          (achievement, index) => achievement !== state.achievements[index]
        );

        if (hasChanges) {
          set(() => ({ achievements: updatedAchievements }));
        }
      },
      exportGameData: () => JSON.stringify(deriveSaveData(get()), null, 2),
      importGameData: data => {
        const parsed = parseSaveData(data);
        if (!parsed.success || !parsed.data) {
          return { success: false, message: parsed.error ?? 'Import failed.' };
        }

        set(() => ({
          coins: parsed.data.coins,
          day: parsed.data.day,
          kemonomimi: parsed.data.kemonomimi,
          breedingQueue: parsed.data.breedingQueue,
          trainingQueue: parsed.data.trainingQueue,
          marketStock: parsed.data.marketStock,
          nextId: parsed.data.nextId,
          selectedParent1: parsed.data.selectedParent1,
          selectedParent2: parsed.data.selectedParent2,
          achievements: parsed.data.achievements,
          totalCoinsEarned: parsed.data.totalCoinsEarned,
          totalCoinsSpent: parsed.data.totalCoinsSpent,
          totalBreedings: parsed.data.totalBreedings,
          totalTrainings: parsed.data.totalTrainings,
          hasSeenOnboarding: parsed.data.hasSeenOnboarding,
          lastBackup: parsed.data.lastBackup,
          lastDayLogs: parsed.data.lastDayLogs,
          loadError: null,
        }));
        get().checkAndUpdateAchievements();
        return { success: true, message: 'Save imported.' };
      },
    }),
    {
      name: SAVE_KEY,
      partialize: state => ({
        coins: state.coins,
        day: state.day,
        kemonomimi: state.kemonomimi,
        breedingQueue: state.breedingQueue,
        trainingQueue: state.trainingQueue,
        marketStock: state.marketStock,
        nextId: state.nextId,
        selectedParent1: state.selectedParent1,
        selectedParent2: state.selectedParent2,
        achievements: state.achievements,
        totalCoinsEarned: state.totalCoinsEarned,
        totalCoinsSpent: state.totalCoinsSpent,
        totalBreedings: state.totalBreedings,
        totalTrainings: state.totalTrainings,
        hasSeenOnboarding: state.hasSeenOnboarding,
        lastBackup: state.lastBackup,
      }),
    }
  )
);

const stateHasData = (array: unknown[]): boolean => {
  return Array.isArray(array) && array.length > 0;
};
