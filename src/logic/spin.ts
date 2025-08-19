// 12 fatias => 30° por fatia
export const SECTOR_DEG = 360 / 12;

// Calibração: ângulo do centro da fatia 0 em relação ao ponteiro (topo).
// Se seu JPG tiver o centro da fatia 0 exatamente no topo, use 0.
// Se a fronteira estiver no topo, use 15. Ajustaremos depois com teste visual.
export const START_CENTER_DEG = 0;

/** Ângulo CENTRAL (em graus) da fatia index (0..11), clockwise. */
export function centerDegOf(index: number) {
  return (START_CENTER_DEG + index * SECTOR_DEG) % 360;
}

/**
 * Calcula o target de rotação da imagem da roleta para alinhar a fatia "winner"
 * no ponteiro fixo no topo (0°). Retorna {target, duration}.
 * current é a rotação atual (deg). turns = voltas inteiras para estética.
 */
// logic/spin.ts
export function computeTargetRotation(
  currentRotation: number,
  winnerIndex: number,
  turns: number
) {
  const SLICE_COUNT = 12;
  const SLICE_ANGLE = 360 / SLICE_COUNT; // 30°
  const center = winnerIndex * SLICE_ANGLE + SLICE_ANGLE / 2;
  const base = turns * 360 + (360 - center); // centraliza a fatia no ponteiro
  const current = ((currentRotation % 360) + 360) % 360;
  const diff = base - current;
  const target = currentRotation + diff;

  const duration = 4.8; // s — ajuste fino de suavidade
  return { target, duration };
}
