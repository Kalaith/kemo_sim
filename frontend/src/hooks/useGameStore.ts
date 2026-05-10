import { create } from 'zustand';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { useWebHatcherySessionStore } from '../stores/webhatcherySessionStore';
import type {
  Achievement,
  ActionResult,
  BreedingQueueItem,
  DayAdvanceResult,
  GameSaveData,
  GameStats,
  JobCategory,
  Kemonomimi,
  KemonomimiType,
  MarketKemonomimi,
  Stat,
  TrainingQueueItem,
} from '../types/game';
import { ACHIEVEMENTS, calculateGameStats } from '../utils/achievements';
import { eyeColors, hairColors, jobCategories, kemonomimiTypes, personalityTraits } from '../utils/gameData';

type StoredRecord = Record<string, unknown>;

interface BreedingPreview {
  expectedStats: Record<Stat, number>;
  expectedTraits: string[];
  expectedType: string;
}

interface BackendGameState extends GameSaveData {
  game_slug?: string;
  game_name?: string;
  schema_version?: number;
  created_at?: string;
  lastAdvanceResult: DayAdvanceResult;
  breedingPreview: BreedingPreview | null;
}

interface GameState extends BackendGameState {
  loadError: string | null;
  setSelectedParent1: (id: number | null) => void;
  setSelectedParent2: (id: number | null) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  advanceDay: () => Promise<DayAdvanceResult>;
  startBreeding: (parent1Id: number, parent2Id: number) => Promise<ActionResult>;
  startTraining: (kemonoId: number, jobName: string) => Promise<ActionResult>;
  buyMarketKemonomimi: (marketId: number) => Promise<ActionResult>;
  sellKemonomimi: (kemonomimiId: number) => Promise<ActionResult>;
  initGameData: () => Promise<void>;
  resetGameData: () => Promise<void>;
  createBackup: () => Promise<ActionResult>;
  restoreBackup: () => Promise<ActionResult>;
  getGameStats: () => GameStats;
  checkAndUpdateAchievements: () => void;
  exportGameData: () => string;
  importGameData: (data: string) => Promise<ActionResult>;
}

const STATS: Stat[] = ['strength', 'agility', 'intelligence', 'charisma', 'endurance', 'loyalty'];
const STARTING_COINS = 1000;
const STARTING_DAY = 1;
const SAVE_VERSION = 1;

const emptyAdvanceResult = (): DayAdvanceResult => ({
  completedBreedings: 0,
  completedTrainings: 0,
  earnedCoins: 0,
  logs: [],
});

const defaultAchievements = (): Achievement[] => ACHIEVEMENTS.map(achievement => ({ ...achievement }));

const isRecord = (value: unknown): value is StoredRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const clampStat = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

const normalizeStats = (raw: unknown): Record<Stat, number> => {
  const source = isRecord(raw) ? raw : {};
  return STATS.reduce((acc, stat) => {
    acc[stat] = clampStat(toInt(source[stat], 40));
    return acc;
  }, {} as Record<Stat, number>);
};

const normalizeType = (raw: unknown): KemonomimiType => {
  if (!isRecord(raw)) {
    return kemonomimiTypes[0];
  }

  const typeName = typeof raw.name === 'string' ? raw.name : '';
  const knownType = kemonomimiTypes.find(type => type.name === typeName);
  if (knownType) {
    return knownType;
  }

  const traits = Array.isArray(raw.traits)
    ? raw.traits.filter((trait): trait is string => typeof trait === 'string')
    : [];
  const jobBonuses = isRecord(raw.jobBonuses)
    ? Object.fromEntries(
        Object.entries(raw.jobBonuses).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
      )
    : {};

  return {
    name: typeName || kemonomimiTypes[0].name,
    animal: typeof raw.animal === 'string' ? raw.animal : kemonomimiTypes[0].animal,
    traits,
    jobBonuses,
    baseStats: normalizeStats(raw.baseStats),
    emoji: typeof raw.emoji === 'string' ? raw.emoji : undefined,
  };
};

const idList = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => toInt(item, 0)).filter(id => id > 0);
};

const normalizeKemonomimi = (raw: unknown): Kemonomimi => {
  const source = isRecord(raw) ? raw : {};
  const type = normalizeType(source.type);
  const status = source.status === 'training' || source.status === 'breeding' ? source.status : 'available';
  const price = toInt(source.price, 0);

  return {
    id: Math.max(1, toInt(source.id, 1)),
    name: typeof source.name === 'string' && source.name !== '' ? source.name : 'Kemonomimi',
    type,
    stats: normalizeStats(source.stats),
    hairColor: typeof source.hairColor === 'string' ? source.hairColor : hairColors[0],
    eyeColor: typeof source.eyeColor === 'string' ? source.eyeColor : eyeColors[0],
    personality: typeof source.personality === 'string' ? source.personality : personalityTraits[0],
    age: Math.max(1, toInt(source.age, 18)),
    status,
    trainedJobs: Array.isArray(source.trainedJobs)
      ? source.trainedJobs.filter((job): job is string => typeof job === 'string')
      : [],
    parents: Array.isArray(source.parents) ? idList(source.parents) : null,
    children: idList(source.children),
    price: price > 0 ? price : undefined,
  };
};

const normalizeMarketKemonomimi = (raw: unknown): MarketKemonomimi => {
  const kemonomimi = normalizeKemonomimi(raw);
  const source = isRecord(raw) ? raw : {};
  const price = toInt(source.price, 0);
  return {
    ...kemonomimi,
    price: price > 0 ? price : Math.max(80, Math.round(Object.values(kemonomimi.stats).reduce((sum, value) => sum + value, 0) / 3)),
  };
};

const normalizeJob = (raw: unknown): JobCategory | null => {
  if (isRecord(raw) && typeof raw.name === 'string') {
    return jobCategories.find(job => job.name === raw.name) ?? null;
  }

  if (typeof raw === 'string') {
    return jobCategories.find(job => job.name === raw) ?? null;
  }

  return null;
};

const normalizeBreedingQueueItem = (raw: unknown): BreedingQueueItem | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const parent1Id = toInt(raw.parent1Id, 0);
  const parent2Id = toInt(raw.parent2Id, 0);
  if (parent1Id <= 0 || parent2Id <= 0) {
    return null;
  }

  return {
    id: Math.max(1, toInt(raw.id, 1)),
    parent1Id,
    parent2Id,
    progress: Math.max(0, toInt(raw.progress, 0)),
    expectedStats: isRecord(raw.expectedStats) ? normalizeStats(raw.expectedStats) : undefined,
    expectedTraits: Array.isArray(raw.expectedTraits)
      ? raw.expectedTraits.filter((trait): trait is string => typeof trait === 'string')
      : undefined,
    expectedType: typeof raw.expectedType === 'string' ? raw.expectedType : undefined,
  };
};

const normalizeTrainingQueueItem = (raw: unknown): TrainingQueueItem | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const kemonomimiId = toInt(raw.kemonomimiId, 0);
  const job = normalizeJob(raw.job);
  if (kemonomimiId <= 0 || !job) {
    return null;
  }

  return {
    id: Math.max(1, toInt(raw.id, 1)),
    kemonomimiId,
    job,
    progress: Math.max(0, toInt(raw.progress, 0)),
  };
};

const normalizeAchievements = (raw: unknown): Achievement[] => {
  if (!Array.isArray(raw)) {
    return defaultAchievements();
  }

  const savedById = new Map<string, StoredRecord>();
  raw.forEach(item => {
    if (isRecord(item) && typeof item.id === 'string') {
      savedById.set(item.id, item);
    }
  });

  return ACHIEVEMENTS.map(template => {
    const saved = savedById.get(template.id);
    return {
      ...template,
      unlocked: saved?.unlocked === true,
      unlockedDate: typeof saved?.unlockedDate === 'string' ? saved.unlockedDate : undefined,
    };
  });
};

const normalizeAdvanceResult = (raw: unknown): DayAdvanceResult => {
  if (!isRecord(raw)) {
    return emptyAdvanceResult();
  }

  return {
    completedBreedings: Math.max(0, toInt(raw.completedBreedings, 0)),
    completedTrainings: Math.max(0, toInt(raw.completedTrainings, 0)),
    earnedCoins: Math.max(0, toInt(raw.earnedCoins, 0)),
    logs: Array.isArray(raw.logs) ? raw.logs.filter((log): log is string => typeof log === 'string') : [],
  };
};

const normalizeBreedingPreview = (raw: unknown): BreedingPreview | null => {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    expectedStats: normalizeStats(raw.expectedStats),
    expectedTraits: Array.isArray(raw.expectedTraits)
      ? raw.expectedTraits.filter((trait): trait is string => typeof trait === 'string')
      : [],
    expectedType: typeof raw.expectedType === 'string' ? raw.expectedType : kemonomimiTypes[0].name,
  };
};

const computeNextId = (kemonomimi: Kemonomimi[], marketStock: MarketKemonomimi[]): number => {
  const ids = [...kemonomimi, ...marketStock].map(item => item.id);
  return Math.max(1, ...ids) + 1;
};

const defaultState = (): BackendGameState => ({
  saveVersion: SAVE_VERSION,
  saveDate: new Date().toISOString(),
  coins: STARTING_COINS,
  day: STARTING_DAY,
  kemonomimi: [],
  breedingQueue: [],
  trainingQueue: [],
  marketStock: [],
  achievements: defaultAchievements(),
  totalCoinsEarned: 0,
  totalCoinsSpent: 0,
  totalBreedings: 0,
  totalTrainings: 0,
  nextId: 1,
  selectedParent1: null,
  selectedParent2: null,
  hasSeenOnboarding: false,
  lastBackup: null,
  lastDayLogs: [],
  lastAdvanceResult: emptyAdvanceResult(),
  breedingPreview: null,
});

const normalizeBackendState = (raw: unknown): BackendGameState => {
  if (!isRecord(raw)) {
    return defaultState();
  }

  const kemonomimi = Array.isArray(raw.kemonomimi) ? raw.kemonomimi.map(normalizeKemonomimi) : [];
  const marketStock = Array.isArray(raw.marketStock) ? raw.marketStock.map(normalizeMarketKemonomimi) : [];
  const validIds = new Set(kemonomimi.map(item => item.id));
  const selectedParent1 = toInt(raw.selectedParent1, 0);
  const selectedParent2 = toInt(raw.selectedParent2, 0);

  return {
    game_slug: typeof raw.game_slug === 'string' ? raw.game_slug : undefined,
    game_name: typeof raw.game_name === 'string' ? raw.game_name : undefined,
    schema_version: toInt(raw.schema_version, 0),
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    saveVersion: Math.max(1, toInt(raw.saveVersion, SAVE_VERSION)),
    saveDate: typeof raw.saveDate === 'string' ? raw.saveDate : new Date().toISOString(),
    coins: Math.max(0, toInt(raw.coins, STARTING_COINS)),
    day: Math.max(1, toInt(raw.day, STARTING_DAY)),
    kemonomimi,
    breedingQueue: Array.isArray(raw.breedingQueue)
      ? raw.breedingQueue.map(normalizeBreedingQueueItem).filter((item): item is BreedingQueueItem => item !== null)
      : [],
    trainingQueue: Array.isArray(raw.trainingQueue)
      ? raw.trainingQueue.map(normalizeTrainingQueueItem).filter((item): item is TrainingQueueItem => item !== null)
      : [],
    marketStock,
    achievements: normalizeAchievements(raw.achievements),
    totalCoinsEarned: Math.max(0, toInt(raw.totalCoinsEarned, 0)),
    totalCoinsSpent: Math.max(0, toInt(raw.totalCoinsSpent, 0)),
    totalBreedings: Math.max(0, toInt(raw.totalBreedings, 0)),
    totalTrainings: Math.max(0, toInt(raw.totalTrainings, 0)),
    nextId: Math.max(1, toInt(raw.nextId, 1), computeNextId(kemonomimi, marketStock)),
    selectedParent1: validIds.has(selectedParent1) ? selectedParent1 : null,
    selectedParent2: validIds.has(selectedParent2) ? selectedParent2 : null,
    hasSeenOnboarding: raw.hasSeenOnboarding === true,
    lastBackup: typeof raw.lastBackup === 'string' ? raw.lastBackup : null,
    lastDayLogs: Array.isArray(raw.lastDayLogs)
      ? raw.lastDayLogs.filter((log): log is string => typeof log === 'string')
      : [],
    lastAdvanceResult: normalizeAdvanceResult(raw.lastAdvanceResult),
    breedingPreview: normalizeBreedingPreview(raw.breedingPreview),
  };
};

const gameStateToStoreState = (gameState: WebHatcheryGameState): BackendGameState =>
  normalizeBackendState(gameState.save.state);

const syncSessionState = (gameState: WebHatcheryGameState): void => {
  useWebHatcherySessionStore.setState({
    gameState,
    user: gameState.user,
    isLoading: false,
    error: null,
  });
};

const loadOrCreateBackendGame = async (): Promise<WebHatcheryGameState> => {
  const sessionStore = useWebHatcherySessionStore.getState();
  try {
    return await sessionStore.loadGame();
  } catch {
    return sessionStore.continueAsGuest();
  }
};

const parseImportedState = (data: string): { state?: StoredRecord; error?: string } => {
  try {
    const parsed: unknown = JSON.parse(data);
    if (!isRecord(parsed)) {
      return { error: 'Save data format is invalid.' };
    }
    return { state: parsed };
  } catch {
    return { error: 'Save data is not valid JSON.' };
  }
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

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const useGameStore = create<GameState>()((set, get) => {
  const applyBackendState = (gameState: WebHatcheryGameState): BackendGameState => {
    syncSessionState(gameState);
    const backendState = gameStateToStoreState(gameState);
    set({ ...backendState, loadError: null });
    return backendState;
  };

  const runIntent = async (intent: string, payload: Record<string, unknown> = {}): Promise<BackendGameState> => {
    const gameState = await webhatcheryGameApi.applyIntent(intent, payload);
    return applyBackendState(gameState);
  };

  return {
    ...defaultState(),
    loadError: null,

    setSelectedParent1: (id) => {
      set({ selectedParent1: id });
      void runIntent('set_selected_parent1', { id }).catch(error => {
        set({ loadError: errorMessage(error, 'Unable to select parent.') });
      });
    },

    setSelectedParent2: (id) => {
      set({ selectedParent2: id });
      void runIntent('set_selected_parent2', { id }).catch(error => {
        set({ loadError: errorMessage(error, 'Unable to select parent.') });
      });
    },

    setHasSeenOnboarding: (value) => {
      set({ hasSeenOnboarding: value });
      void runIntent('set_has_seen_onboarding', { value }).catch(error => {
        set({ loadError: errorMessage(error, 'Unable to update onboarding state.') });
      });
    },

    advanceDay: async () => {
      try {
        const backendState = await runIntent('advance_day');
        return backendState.lastAdvanceResult;
      } catch (error) {
        return {
          ...emptyAdvanceResult(),
          logs: [errorMessage(error, 'Unable to advance day.')],
        };
      }
    },

    startBreeding: async (parent1Id, parent2Id) => {
      try {
        await runIntent('start_breeding', { parent1Id, parent2Id });
        return { success: true, message: 'Breeding started.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Could not start breeding.') };
      }
    },

    startTraining: async (kemonomimiId, jobName) => {
      try {
        await runIntent('start_training', { kemonomimiId, jobName });
        return { success: true, message: 'Training started.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Could not start training.') };
      }
    },

    buyMarketKemonomimi: async (marketId) => {
      try {
        await runIntent('buy_market', { marketId });
        return { success: true, message: 'Purchased successfully.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Purchase failed.') };
      }
    },

    sellKemonomimi: async (kemonomimiId) => {
      try {
        await runIntent('sell_kemonomimi', { kemonomimiId });
        return { success: true, message: 'Sold successfully.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Sale failed.') };
      }
    },

    initGameData: async () => {
      try {
        set({ loadError: null });
        const gameState = await loadOrCreateBackendGame();
        applyBackendState(gameState);
      } catch (error) {
        set({ loadError: errorMessage(error, 'Failed to load game data. Please retry.') });
      }
    },

    resetGameData: async () => {
      try {
        await runIntent('reset_game');
      } catch (error) {
        set({ loadError: errorMessage(error, 'Failed to reset game data. Please retry.') });
      }
    },

    createBackup: async () => {
      try {
        await runIntent('create_backup');
        return { success: true, message: 'Backup saved to the backend.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Backup failed.') };
      }
    },

    restoreBackup: async () => {
      try {
        await runIntent('restore_backup');
        return { success: true, message: 'Restored backup.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Restore failed.') };
      }
    },

    getGameStats: () => {
      const state = get();
      return calculateGameStats(
        state.kemonomimi,
        state.day,
        state.totalCoinsEarned,
        state.totalCoinsSpent,
        state.totalBreedings,
        state.totalTrainings,
      );
    },

    checkAndUpdateAchievements: () => undefined,

    exportGameData: () => JSON.stringify(deriveSaveData(get()), null, 2),

    importGameData: async (data) => {
      const parsed = parseImportedState(data);
      if (!parsed.state) {
        return { success: false, message: parsed.error ?? 'Import failed.' };
      }

      try {
        await runIntent('import_game', { state: parsed.state });
        return { success: true, message: 'Save imported.' };
      } catch (error) {
        return { success: false, message: errorMessage(error, 'Import failed.') };
      }
    },
  };
});
