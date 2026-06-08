import { create } from 'zustand';

export interface HealthCheck {
  fatigue: number;
  sleep: number;
  digestion: number;
  immunity: number;
  stamina: number;
}

interface HealthStore {
  scores: HealthCheck;
  setScore: (key: keyof HealthCheck, value: number) => void;
}

export const useHealthStore = create<HealthStore>((set) => ({
  scores: {
    fatigue: 0,
    sleep: 0,
    digestion: 0,
    immunity: 0,
    stamina: 0,
  },
  setScore: (key, value) => set((state) => ({ scores: { ...state.scores, [key]: value } })),
}));
