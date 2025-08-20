// src/logic/spin.ts
// Regras geométricas e cálculo da rotação alvo

export const SECTOR_DEG = 360 / 12;

// >>> Offset padrão de fábrica (ajuste para o valor que você definiu!)
const START_CENTER_DEFAULT = 345; // <- se o seu valor for outro, altere aqui

const POINTER_OFFSET_DEFAULT = 0; // ponteiro no topo (12h)

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

/** Ângulo CENTRAL (em graus) da fatia index (0..11), considerando o offset calibrado. */
export function centerDegOf(index: number) {
  const start = getStartCenterDeg();
  return (start + index * SECTOR_DEG) % 360;
}

/**
 * Calcula a rotação-alvo para alinhar o centro do "winnerIndex" ao ponteiro.
 * O alvo FINAL é exato (sem overshoot).
 */
export function computeTargetRotation(
  current: number,
  winnerIndex: number,
  turns = 6
) {
  const currentMod = ((current % 360) + 360) % 360;
  const winnerCenter = centerDegOf(winnerIndex);
  const pointerOffset = getPointerOffsetDeg(); // 0° = ponteiro no topo
  // levar winnerCenter -> (0° + pointerOffset)
  const deltaToAlign =
    (((-winnerCenter + pointerOffset - currentMod) % 360) + 360) % 360;
  const target = current + turns * 360 + deltaToAlign;
  const duration = 3.4 + Math.random() * 0.6;
  return { target, duration };
}

/**
 * A partir de uma rotação final (em graus), retorna o índice da fatia sob o ponteiro.
 * Usa arredondamento para o CENTRO mais próximo (robusto a micro difs).
 */
export function winnerIndexFromRotation(rotationDeg: number): number {
  const start = getStartCenterDeg();
  const pointer = getPointerOffsetDeg();
  // ângulo da imagem que está no ponteiro neste instante
  const effective = (((-rotationDeg + pointer) % 360) + 360) % 360;
  let idx = Math.round((effective - start) / SECTOR_DEG);
  idx = ((idx % 12) + 12) % 12;
  return idx;
}
