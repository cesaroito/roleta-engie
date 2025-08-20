import { create } from "zustand";

export type SliceKind =
  | "TRILHA"
  | "DESAFIO"
  | "ACAO_ROXA"
  | "QUIZ"
  | "ACAO_ROSA"
  | "BEU";

export interface Slice {
  id: number;
  label: string;
  kind: SliceKind;
}

type Screen = "wheel" | "result" | "qr";

interface AppState {
  // navegação
  screen: Screen;
  setScreen: (s: Screen) => void;

  // rotação atual (deg) — persistimos aqui para outras telas/usos
  currentRotation: number;
  setRotation: (deg: number) => void;

  // último vencedor (índice 0..11)
  winnerIndex: number | null;
  setWinner: (i: number | null) => void;

  // definição das 12 fatias (na ordem REAL da arte, sentido horário a partir do topo)
  slices: Slice[];
}

export const useStore = create<AppState>((set) => ({
  screen: "wheel",
  setScreen: (s) => set({ screen: s }),

  currentRotation: 0,
  setRotation: (deg) => set({ currentRotation: deg }),

  winnerIndex: null,
  setWinner: (i) => set({ winnerIndex: i }),

  // >>> ORDEM CALIBRADA (clockwise a partir do topo) — conforme você enviou <<<
  slices: [
    { id: 0, label: "Be.U@Engie", kind: "BEU" },
    { id: 1, label: "Trilha de Carreiras Femininas", kind: "TRILHAS" },
    { id: 2, label: "Desafio", kind: "DESAFIO" },
    { id: 3, label: "Ação (Roxa)", kind: "AÇÃO_ROXA" },
    { id: 4, label: "Quiz", kind: "QUIZ" },
    { id: 5, label: "Ação (Rosa)", kind: "AÇÃO_ROSA" },
    { id: 6, label: "Desafio", kind: "DESAFIO" },
    { id: 7, label: "Trilha de Carreiras Femininas", kind: "TRILHAS" },
    { id: 8, label: "Be.U@Engie", kind: "BEU" },
    { id: 9, label: "Ação (Roxa)", kind: "AÇÃO_ROXA" },
    { id: 10, label: "Desafio", kind: "DESAFIO" },
    { id: 11, label: "Ação (Rosa)", kind: "AÇÃO_ROSA" },
  ],
}));
