import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";
import type { Block } from "./types";
import { familyBlocks } from "./mock";

interface UIState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "flowledger-ui" },
  ),
);

interface BuilderState {
  name: string;
  description: string;
  blocks: Block[];
  setName: (n: string) => void;
  setDescription: (d: string) => void;
  addBlock: (b: Block) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, dir: -1 | 1) => void;
  updateBlock: (id: string, patch: Partial<Block>) => void;
  loadTemplate: (blocks: Block[], name?: string) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  name: "Family Agreement",
  description: "Auto-split monthly salary to parents, education, and savings.",
  blocks: familyBlocks,
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  addBlock: (block) => set({ blocks: [...get().blocks, block] }),
  removeBlock: (id) => set({ blocks: get().blocks.filter((b) => b.id !== id) }),
  moveBlock: (id, dir) => {
    const bs = [...get().blocks];
    const idx = bs.findIndex((b) => b.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= bs.length) return;
    [bs[idx], bs[to]] = [bs[to], bs[idx]];
    set({ blocks: bs });
  },
  updateBlock: (id, patch) =>
    set({ blocks: get().blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }),
  loadTemplate: (blocks, name) => set({ blocks, ...(name ? { name } : {}) }),
  reset: () => set({ name: "New Agreement", description: "", blocks: [] }),
}));

export function useApplyTheme() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}