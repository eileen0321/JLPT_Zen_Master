import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  streak: number;
  lastStudyDate: string | null;
  updateStreak: () => void;
  handsFreeMode: boolean;
  toggleHandsFreeMode: () => void;
  currentLevel: string;
  setCurrentLevel: (level: string) => void;
  studyTime: number; // in seconds
  incrementStudyTime: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      streak: 0,
      lastStudyDate: null,
      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastStudyDate === today) return state; // Already studied today
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (state.lastStudyDate === yesterdayStr) {
            return { streak: state.streak + 1, lastStudyDate: today };
          } else {
            return { streak: 1, lastStudyDate: today };
          }
        }),
      handsFreeMode: false,
      toggleHandsFreeMode: () => set((state) => ({ handsFreeMode: !state.handsFreeMode })),
      currentLevel: 'N5',
      setCurrentLevel: (level) => set({ currentLevel: level }),
      studyTime: 0,
      incrementStudyTime: () => set((state) => ({ studyTime: state.studyTime + 1 })),
    }),
    {
      name: 'jlpt-app-storage',
    }
  )
);
