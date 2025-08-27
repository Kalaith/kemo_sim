// Kemonomimi core stats
export type Stat = 'strength' | 'agility' | 'intelligence' | 'charisma' | 'endurance' | 'loyalty';

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
  status: 'available' | 'training' | 'breeding' | string;
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
  parent1: Kemonomimi;
  parent2: Kemonomimi;
  progress: number;
  result?: Kemonomimi;
}

export interface TrainingQueueItem {
  id: number;
  kemonomimi: Kemonomimi;
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