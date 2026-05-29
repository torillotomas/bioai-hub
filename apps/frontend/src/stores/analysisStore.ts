import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResponse } from "../types/analysis";

interface AnalysisStore {
  history: AnalysisResponse[];
  addToHistory: (item: AnalysisResponse) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 20), // máximo 20 entradas
        })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "bioai-history" } // clave en localStorage
  )
);
