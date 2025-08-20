// src/logic/spin.ts
export const SECTOR_DEG = 360 / 12;

// >>> Use aqui o valor calibrado de fábrica (você informou 345):
const START_CENTER_DEFAULT = 345;

const POINTER_OFFSET_DEFAULT = 0; // ponteiro às 12h

export function getStartCenterDeg(): number {
  if (typeof window === "undefined") return START_CENTER_DEFAULT;
  const v = localStorage.getItem("wheel_offset_deg");
  const n = v != null ? Number(v) : NaN;
  return Number.isFinite(n) ? ((n % 360) + 360) % 360 : START_CENTER_DEFAULT;
}
export function setStartCenterDeg(deg: number) {
  try {
    localStorage.setItem("wheel_offset_deg", String(((deg % 360) + 360) % 360));
  } catch {}
}

export function getPointerOffsetDeg(): number {
  if (typeof window === "undefined") return POINTER_OFFSET_DEFAULT;
  const v = localStorage.getItem("pointer_offset_deg");
  const n = v != null ? Number(v) : NaN;
  return Number.isFinite(n) ? ((n % 360) + 360) % 360 : POINTER_OFFSET_DEFAULT;
}
export function setPointerOffsetDeg(deg: number) {
  try {
    localStorage.setItem(
      "pointer_offset_deg",
      String(((deg % 360) + 360) % 360)
    );
  } catch {}
}

/** Centro (graus) da fatia index considerando o offset calibrado. */
export function centerDegOf(index: number) {
  const start = getStartCenterDeg();
  return (start + index * SECTOR_DEG) % 360;
}

/**
 * Leva o CENTRO da fatia `winnerIndex` para o ponteiro (0° + pointer).
 * Alvo FINAL é exato.
 */
export function computeTargetRotation(
  current: number,
  winnerIndex: number,
  turns = 6
) {
  const currentMod = ((current % 360) + 360) % 360;
  const winnerCenter = centerDegOf(winnerIndex);
  const pointer = getPointerOffsetDeg(); // 0° = topo

  // alvo_mod = pointer - winnerCenter   (pois -target + pointer ≡ winnerCenter)
  const targetMod = (((pointer - winnerCenter) % 360) + 360) % 360;
  const delta = (((targetMod - currentMod) % 360) + 360) % 360;

  const target = current + turns * 360 + delta;
  const duration = 3.4 + Math.random() * 0.6;
  return { target, duration };
}

/**
 * Converte rotação final (deg) -> índice no ponteiro.
 * Usa mesma convenção de sinais da ida e "round para o centro".
 */
export function winnerIndexFromRotation(rotationDeg: number): number {
  const start = getStartCenterDeg();
  const pointer = getPointerOffsetDeg();

  // qual ângulo da imagem está no ponteiro?
  const effective = (((pointer - rotationDeg) % 360) + 360) % 360;

  let idx = Math.round((effective - start) / SECTOR_DEG);
  idx = ((idx % 12) + 12) % 12;
  return idx;
}
