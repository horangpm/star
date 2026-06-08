import { create } from 'zustand';

export interface SajuInput {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  calendarType: 'solar' | 'lunar';
  birthHour: string | null;
  gender: 'female' | 'male' | null;
}

interface SajuStore {
  input: SajuInput;
  setInput: (input: Partial<SajuInput>) => void;
}

export const useSajuStore = create<SajuStore>((set) => ({
  input: {
    birthYear: null,
    birthMonth: null,
    birthDay: null,
    calendarType: 'solar',
    birthHour: null,
    gender: null,
  },
  setInput: (newInput) => set((state) => ({ input: { ...state.input, ...newInput } })),
}));
