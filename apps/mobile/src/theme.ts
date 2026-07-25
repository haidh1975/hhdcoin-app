/**
 * Mobile theme — a thin, RN-friendly view over the shared design tokens.
 *
 * All hex values come from `@hhd-i/ui-tokens` (which the web Tailwind config
 * reads too), so there is exactly one place where a color is defined.
 * The key names below intentionally match the local `COLORS` objects the
 * screens used before, so adopting this file is a drop-in swap.
 */
import { colors, withAlpha } from '@hhd-i/ui-tokens';

export const COLORS = {
  bg: colors.background,
  card: colors.surface,
  border: colors.border,
  brand: colors.brand,
  text: colors.text,
  muted: colors.textMuted,
  dark700: colors.elevated,
  dark500: colors.borderStrong,
  success: colors.success,
  danger: colors.danger,
  info: colors.info,
} as const;

/** Tab bar / header chrome (was the local `DARK` object in `(tabs)/_layout.tsx`). */
export const TAB_COLORS = {
  background: colors.surface,
  border: colors.border,
  inactive: colors.borderStrong,
  active: colors.brand,
  text: colors.text,
} as const;

/** Risk score & Fear-and-Greed gauge bands. */
export const SCORE_COLORS = colors.score;

export { colors, withAlpha };
