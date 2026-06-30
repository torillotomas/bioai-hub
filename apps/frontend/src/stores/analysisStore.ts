import { create } from "zustand";
import type { AnalysisResponse } from "../types/analysis";

interface AnalysisStore {
  history: AnalysisResponse[];
  isLoading: boolean;
  setHistory: (items: AnalysisResponse[]) => void;
  addToHistory: (item: AnalysisResponse) => void;
  setLoading: (loading: boolean) => void;
}

export const useAnalysisStore = create<AnalysisStore>()((set) => ({
  history: [],
  isLoading: false,
  setHistory: (items) => set({ history: items }),
  addToHistory: (item) =>
    set((state) => ({
      history: [item, ...state.history].slice(0, 20),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
