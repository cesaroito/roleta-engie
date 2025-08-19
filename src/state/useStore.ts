import { create } from "zustand";

export type Screen = "wheel" | "result" | "qr";

export interface Slice {
  id: number;
  label: string;
  kind: "ACAO_ROXA" | "ACAO_ROSA" | "BEU" | "TRILHA" | "DESAFIO" | "QUIZ";
}

interface AppState {
  screen: Screen;
  currentRotation: number; // graus absolutos aplicados à imagem
  winnerIndex: number | null;
  slices: Slice[];
  setScreen: (s: Screen) => void;
  setRotation: (deg: number) => void;
  setWinner: (i: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  screen: "wheel",
  currentRotation: 0,
  winnerIndex: null,
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
  setScreen: (s) => set({ screen: s }),
  setRotation: (deg) => set({ currentRotation: deg }),
  setWinner: (i) => set({ winnerIndex: i }),
}));
