// src/state/useStore.ts
import { create, type StoreApi, type UseBoundStore } from "zustand";

/** Telas da aplicação (inclui "qr") */
export type Screen = "wheel" | "result" | "qr";

/** Categorias de fatia (casando com seus literais atuais) */
export type SliceKind =
  | "TRILHA"
  | "TRILHAS"
  | "ACAO_ROXA"
  | "AÇÃO_ROXA"
  | "ACAO_ROSA"
  | "AÇÃO_ROSA"
  | "BEU"
  | "DESAFIO"
  | "QUIZ";

export interface Slice {
  id: number;
  label: string;
  kind: SliceKind;
}

export interface StoreState {
  screen: Screen;
  slices: Slice[];
  winnerIndex: number | null;
  currentRotation: number;
  isSpinning: boolean;

  setScreen: (s: Screen) => void;
  setRotation: (deg: number) => void;
  setWinner: (idx: number | null) => void;

  spinTo: (index?: number | null) => void;
  spinToById: (id: number) => void;

  reset: () => void;
}

/** Duração da animação (ms) */
export const SPIN_MS = 4500;

/** Slices — ORDEM = posição na arte (sentido horário) */
const SLICES: Slice[] = [
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
];

/** Calcula a rotação alvo para centralizar a fatia no topo (ponteiro fixo no topo) */
function computeTargetRotation(
  fromDeg: number,
  index: number,
  total: number
): number {
  const fullTurns = 6;
  const step = 360 / total;
  const sliceStart = index * step;
  const sliceCenter = sliceStart + step / 2;

  const mod = (x: number) => ((x % 360) + 360) % 360;
  const deltaToTop = (360 - mod(fromDeg + sliceCenter)) % 360;

  return fromDeg + fullTurns * 360 + deltaToTop;
}

export const useStore: UseBoundStore<StoreApi<StoreState>> = create<StoreState>(
  (set, get) => ({
    screen: "wheel",
    slices: SLICES,
    winnerIndex: null,
    currentRotation: 0,
    isSpinning: false,

    setScreen: (s) => set({ screen: s }),
    setRotation: (deg) => set({ currentRotation: deg }),
    setWinner: (idx) => set({ winnerIndex: idx }),

    spinTo: (index?: number | null) => {
      const { isSpinning, slices, currentRotation } = get();
      if (isSpinning || slices.length === 0) return;

      const total = slices.length;
      const targetIndex =
        index == null
          ? Math.floor(Math.random() * total)
          : Math.max(0, Math.min(total - 1, index));

      const targetDeg = computeTargetRotation(
        currentRotation,
        targetIndex,
        total
      );

      set({
        isSpinning: true,
        winnerIndex: targetIndex,
        currentRotation: targetDeg,
      });

      window.setTimeout(() => {
        // se quiser ir direto pro QR após girar, troque para "qr"
        set({ isSpinning: false, screen: "result" });
      }, SPIN_MS);
    },

    spinToById: (id: number) => {
      const { slices } = get();
      const idx = slices.findIndex((s) => s.id === id);
      if (idx >= 0) get().spinTo(idx);
    },

    reset: () =>
      set({
        screen: "wheel",
        winnerIndex: null,
        currentRotation: 0,
        isSpinning: false,
      }),
  })
);
