import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as mockApi from '../api/mockApi';
import type { Kemonomimi, BreedingQueueItem, TrainingQueueItem, MarketKemonomimi } from '../types/game';

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
  // Methods
  addKemonomimi: (kemono: Kemonomimi) => void;
  setCoins: (coins: number) => void;
  advanceDay: () => void;
  initGameData: () => Promise<void>;
  // ...add more actions as needed
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
      addKemonomimi: (kemono) => set((state) => ({ kemonomimi: [...state.kemonomimi, kemono] })),
      setCoins: (coins) => set(() => ({ coins })),
      advanceDay: () => set((state) => ({ day: state.day + 1 })),
      initGameData: async () => {
        if (get().kemonomimi.length === 0) {
          const kemono = await mockApi.fetchKemonomimi();
          set({ kemonomimi: kemono });
        }
        if (get().marketStock.length === 0) {
          const market = await mockApi.fetchMarket();
          set({ marketStock: market });
        }
        // Jobs are static for now
      },
      // ...implement more actions as needed
    }),
    {
      name: 'kemonomimi-game', // storage key
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
      }),
    }
  )
);