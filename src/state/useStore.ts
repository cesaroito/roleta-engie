import { create } from "zustand";

export type Screen = "wheel" | "result" | "qr";
export type Slice = { id: number; label: string; kind: string };

type AppState = {
  screen: Screen;
  currentRotation: number; // em graus
  isSpinning: boolean;
  winnerIndex: number | null;
  slices: Slice[];

  // ações usadas nas telas
  setRotation: (deg: number) => void;
  setScreen: (s: Screen) => void;
  setWinner: (i: number | null) => void;

  reset: () => void;
};

export const useStore = create<AppState>((set) => ({
  screen: "wheel",
  currentRotation: 0,
  isSpinning: false,
  winnerIndex: null,

  // >>> ORDEM CLOCKWISE a partir do topo (12h), batendo com sua imagem:
  slices: [
    { id: 0, label: "Trilha de carreiras femininas", kind: "TRILHA" },
    { id: 1, label: "Be.U@Engie", kind: "BEU" },
    { id: 2, label: "Ação (Roxa)", kind: "ACAO_ROXA" },
    { id: 3, label: "Quiz", kind: "QUIZ" },
    { id: 4, label: "Ação (Rosa)", kind: "ACAO_ROSA" },
    { id: 5, label: "Desafio", kind: "DESAFIO" },
    { id: 6, label: "Trilha de carreiras femininas", kind: "TRILHA" },
    { id: 7, label: "Be.U@Engie", kind: "BEU" },
    { id: 8, label: "Ação (Rosa)", kind: "ACAO_ROSA" },
    { id: 9, label: "Desafio", kind: "DESAFIO" },
    { id: 10, label: "Ação (Roxa)", kind: "ACAO_ROXA" },
    { id: 11, label: "Desafio", kind: "DESAFIO" },
  ],

  setRotation: (deg) => set({ currentRotation: deg }),
  setScreen: (s) => set({ screen: s }),
  setWinner: (i) => set({ winnerIndex: i }),

  reset: () =>
    set({
      screen: "wheel",
      currentRotation: 0,
      isSpinning: false,
      winnerIndex: null,
    }),
}));
