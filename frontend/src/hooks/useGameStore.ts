import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as mockApi from "../api/mockApi";
import type {
  Kemonomimi,
  BreedingQueueItem,
  TrainingQueueItem,
  MarketKemonomimi,
  Achievement,
  GameStats,
} from "../types/game";
import {
  ACHIEVEMENTS,
  checkAchievements,
  calculateGameStats,
} from "../utils/achievements";

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
  // Achievements and Statistics
  achievements: Achievement[];
  setAchievements: (achievements: Achievement[]) => void;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalBreedings: number;
  totalTrainings: number;
  // Methods
  addKemonomimi: (kemono: Kemonomimi) => void;
  setCoins: (coins: number) => void;
  addCoinsEarned: (amount: number) => void;
  addCoinsSpent: (amount: number) => void;
  incrementBreedings: () => void;
  incrementTrainings: () => void;
  advanceDay: () => void;
  initGameData: () => Promise<void>;
  getGameStats: () => GameStats;
  checkAndUpdateAchievements: () => void;
  exportGameData: () => string;
  importGameData: (data: string) => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 1000,
      day: 1,
      kemonomimi: [] as Kemonomimi[],
      setKemonomimi: (kemono) => set(() => ({ kemonomimi: kemono })),
      breedingQueue: [] as BreedingQueueItem[],
      setBreedingQueue: (queue) => set(() => ({ breedingQueue: queue })),
      trainingQueue: [] as TrainingQueueItem[],
      setTrainingQueue: (queue) => set(() => ({ trainingQueue: queue })),
      marketStock: [] as MarketKemonomimi[],
      setMarketStock: (stock) => set(() => ({ marketStock: stock })),
      nextId: 1,
      setNextId: (id) => set(() => ({ nextId: id })),
      selectedParent1: null,
      selectedParent2: null,
      setSelectedParent1: (id) => set(() => ({ selectedParent1: id })),
      setSelectedParent2: (id) => set(() => ({ selectedParent2: id })),
      // Achievements and Statistics
      achievements: [...ACHIEVEMENTS],
      setAchievements: (achievements) => set(() => ({ achievements })),
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      totalBreedings: 0,
      totalTrainings: 0,
      // Methods
      addKemonomimi: (kemono) => {
        set((state) => ({ kemonomimi: [...state.kemonomimi, kemono] }));
        get().checkAndUpdateAchievements();
      },
      setCoins: (coins) => set(() => ({ coins })),
      addCoinsEarned: (amount) => {
        set((state) => ({
          totalCoinsEarned: state.totalCoinsEarned + amount,
          coins: state.coins + amount,
        }));
        get().checkAndUpdateAchievements();
      },
      addCoinsSpent: (amount) => {
        set((state) => ({
          totalCoinsSpent: state.totalCoinsSpent + amount,
          coins: state.coins - amount,
        }));
      },
      incrementBreedings: () => {
        set((state) => ({ totalBreedings: state.totalBreedings + 1 }));
        get().checkAndUpdateAchievements();
      },
      incrementTrainings: () => {
        set((state) => ({ totalTrainings: state.totalTrainings + 1 }));
        get().checkAndUpdateAchievements();
      },
      advanceDay: () => {
        set((state) => ({ day: state.day + 1 }));
        get().checkAndUpdateAchievements();
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
      checkAndUpdateAchievements: () => {
        const state = get();
        const stats = state.getGameStats();
        const updatedAchievements = checkAchievements(
          state.achievements,
          stats,
        );
        if (updatedAchievements !== state.achievements) {
          set({ achievements: updatedAchievements });
        }
      },
      exportGameData: () => {
        const state = get();
        const exportData = {
          coins: state.coins,
          day: state.day,
          kemonomimi: state.kemonomimi,
          achievements: state.achievements,
          totalCoinsEarned: state.totalCoinsEarned,
          totalCoinsSpent: state.totalCoinsSpent,
          totalBreedings: state.totalBreedings,
          totalTrainings: state.totalTrainings,
          nextId: state.nextId,
          exportDate: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },
      importGameData: (data: string) => {
        try {
          const importData = JSON.parse(data);
          set({
            coins: importData.coins || 1000,
            day: importData.day || 1,
            kemonomimi: importData.kemonomimi || [],
            achievements: importData.achievements || [...ACHIEVEMENTS],
            totalCoinsEarned: importData.totalCoinsEarned || 0,
            totalCoinsSpent: importData.totalCoinsSpent || 0,
            totalBreedings: importData.totalBreedings || 0,
            totalTrainings: importData.totalTrainings || 0,
            nextId: importData.nextId || 1,
          });
          return true;
        } catch {
          return false;
        }
      },
      initGameData: async () => {
        if (get().kemonomimi.length === 0) {
          const kemono = await mockApi.fetchKemonomimi();
          set({ kemonomimi: kemono });
        }
        if (get().marketStock.length === 0) {
          const market = await mockApi.fetchMarket();
          set({ marketStock: market });
        }
        get().checkAndUpdateAchievements();
      },
    }),
    {
      name: "kemonomimi-game", // storage key
      partialize: (state) => ({
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
      }),
    },
  ),
);
