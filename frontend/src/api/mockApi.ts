import type { Kemonomimi, JobCategory, MarketKemonomimi } from '../types/game';
import { kemonomimiTypes, jobCategories } from '../utils/gameData';

// Generate mock kemonomimi
export async function fetchKemonomimi(): Promise<Kemonomimi[]> {
  return [
    {
      id: 1,
      name: 'Akiyama',
      type: kemonomimiTypes[0],
      stats: {
        strength: 40,
        agility: 70,
        intelligence: 60,
        charisma: 55,
        endurance: 50,
        loyalty: 45,
      },
      hairColor: 'Black',
      eyeColor: 'Blue',
      personality: 'Playful',
      age: 19,
      status: 'available',
      trainedJobs: [],
      parents: null,
      children: [],
      price: 200,
    },
    {
      id: 2,
      name: 'Yukiko',
      type: kemonomimiTypes[1],
      stats: {
        strength: 65,
        agility: 60,
        intelligence: 55,
        charisma: 70,
        endurance: 70,
        loyalty: 85,
      },
      hairColor: 'Brown',
      eyeColor: 'Green',
      personality: 'Gentle',
      age: 21,
      status: 'available',
      trainedJobs: ['Physical Labor'],
      parents: null,
      children: [],
      price: 250,
    },
  ];
}

export async function fetchJobs(): Promise<JobCategory[]> {
  return jobCategories;
}

export async function fetchMarket(): Promise<MarketKemonomimi[]> {
  return [
    {
      id: 101,
      name: 'Miko',
      type: kemonomimiTypes[2],
      stats: {
        strength: 45,
        agility: 65,
        intelligence: 85,
        charisma: 60,
        endurance: 55,
        loyalty: 40,
      },
      hairColor: 'Red',
      eyeColor: 'Gold',
      personality: 'Mischievous',
      age: 18,
      status: 'available',
      trainedJobs: [],
      parents: null,
      children: [],
      price: 300,
    },
    {
      id: 102,
      name: 'Rei',
      type: kemonomimiTypes[3],
      stats: {
        strength: 35,
        agility: 80,
        intelligence: 65,
        charisma: 50,
        endurance: 60,
        loyalty: 60,
      },
      hairColor: 'Silver',
      eyeColor: 'Purple',
      personality: 'Calm',
      age: 20,
      status: 'available',
      trainedJobs: [],
      parents: null,
      children: [],
      price: 220,
    },
  ];
}
