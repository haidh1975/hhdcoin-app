/**
 * Bảng màu theo điểm số.
 *
 * LƯU Ý: Rủi ro (risk) và Fear & Greed là HAI miền khác nhau — ngưỡng và số
 * bậc khác nhau, và thang đo ngược chiều nhau (risk cao = xấu, greed cao = tốt).
 * Vì vậy KHÔNG gộp hai hàm này làm một.
 */

/** Màu dùng cho điểm rủi ro (0–100, càng cao càng xấu). */
export const RISK_COLORS = {
  green: '#0ECB81',
  yellow: '#F0B90B',
  red: '#F6465D',
  darkRed: '#8B0000',
} as const;

/** Màu dùng cho chỉ số Fear & Greed (0–100, càng cao càng tham lam). */
export const FEAR_GREED_COLORS = {
  extremeFear: '#8B0000',
  fear: '#F6465D',
  neutral: '#F0B90B',
  greed: '#10B981',
  extremeGreed: '#0ECB81',
} as const;

/** Class Tailwind tương ứng với từng bậc điểm rủi ro. */
export const RISK_COLOR_CLASSES = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
  darkRed: 'text-red-600',
} as const;

/** Màu hex cho điểm rủi ro — ngưỡng 30 / 60 / 80. */
export function getRiskColor(score: number): string {
  if (score < 30) return RISK_COLORS.green;
  if (score < 60) return RISK_COLORS.yellow;
  if (score < 80) return RISK_COLORS.red;
  return RISK_COLORS.darkRed;
}

/** Class Tailwind cho điểm rủi ro — cùng ngưỡng 30 / 60 / 80 với {@link getRiskColor}. */
export function getRiskColorClasses(score: number): string {
  if (score < 30) return RISK_COLOR_CLASSES.green;
  if (score < 60) return RISK_COLOR_CLASSES.yellow;
  if (score < 80) return RISK_COLOR_CLASSES.red;
  return RISK_COLOR_CLASSES.darkRed;
}

/** Màu hex cho chỉ số Fear & Greed — 5 bậc, ngưỡng 20 / 40 / 60 / 80. */
export function getFearGreedColor(index: number): string {
  if (index <= 20) return FEAR_GREED_COLORS.extremeFear;
  if (index <= 40) return FEAR_GREED_COLORS.fear;
  if (index <= 60) return FEAR_GREED_COLORS.neutral;
  if (index <= 80) return FEAR_GREED_COLORS.greed;
  return FEAR_GREED_COLORS.extremeGreed;
}

/** Nền Tailwind cho chỉ số Fear & Greed — cùng 5 bậc với {@link getFearGreedColor}. */
export function getFearGreedBgClass(index: number): string {
  if (index <= 20) return 'bg-red-900/20';
  if (index <= 40) return 'bg-red-500/10';
  if (index <= 60) return 'bg-yellow-500/10';
  if (index <= 80) return 'bg-green-500/10';
  return 'bg-emerald-500/10';
}
