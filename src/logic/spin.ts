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
export function computeTargetRotation(
  current: number,
  winnerIndex: number,
  turns = 6
) {
  const currentMod = ((current % 360) + 360) % 360;
  const winnerCenter = centerDegOf(winnerIndex);
  // Queremos que o centro do vencedor vá para 0° (ponteiro topo),
  // então precisamos rotacionar a roda de modo que -winnerCenter (mod 360) alinhe no topo.
  const deltaToAlign = (((-winnerCenter - currentMod) % 360) + 360) % 360;
  const overshoot = Math.random() * 20 - 10; // -10° a +10° para naturalidade
  const target = current + turns * 360 + deltaToAlign + overshoot;
  const duration = 3.4 + Math.random() * 0.7; // 3.4s ~ 4.1s
  return { target, duration };
}
