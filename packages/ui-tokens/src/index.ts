/**
 * @hhd-i/ui-tokens — the single source of truth for HHD-I design tokens.
 *
 * Framework-agnostic and dependency-free: consumed by the Next.js web app
 * (via `apps/web/tailwind.config.js`) and by the Expo mobile app
 * (via `apps/mobile/src/theme.ts`).
 *
 * The raw hex values live in `./palette.json` — and ONLY there — so that a
 * CommonJS consumer (Tailwind's config is plain `.js` and cannot `require()`
 * TypeScript) reads the exact same bytes as the TypeScript consumers.
 */
import palette from './palette.json';

/** Semantic colors used by the risk / fear-greed gauges. */
export interface ScoreColors {
  /** score < 30 — "low" risk / extreme fear band */
  low: string;
  /** 30 <= score < 60 — "medium" */
  medium: string;
  /** 60 <= score < 80 — "high" */
  high: string;
  /** score >= 80 — "extreme" */
  extreme: string;
}

export interface Colors {
  /** Primary brand gold. */
  brand: string;
  brandDark: string;
  brandLight: string;

  /** App/page background (darkest). */
  background: string;
  /** Card / header surface. */
  surface: string;
  /** Raised surface inside a card (tracks, chips, avatars). */
  elevated: string;
  /** Hairline borders. */
  border: string;
  /** Stronger border / disabled-or-inactive foreground. */
  borderStrong: string;
  /** Secondary text. */
  textMuted: string;
  /** Primary text. */
  text: string;

  success: string;
  danger: string;
  info: string;

  score: ScoreColors;
}

export const colors: Colors = palette;

/**
 * Build an `rgba(...)` string from a hex color.
 *
 * Output is intentionally formatted without spaces — `rgba(240,185,11,0.1)` —
 * so it is byte-identical to the inline literals it replaces.
 *
 * Accepts `#RGB`, `#RRGGBB` (with or without the leading `#`).
 */
export function withAlpha(hex: string, alpha: number): string {
  const raw = hex.charAt(0) === '#' ? hex.slice(1) : hex;
  const full =
    raw.length === 3
      ? raw.charAt(0) + raw.charAt(0) + raw.charAt(1) + raw.charAt(1) + raw.charAt(2) + raw.charAt(2)
      : raw.slice(0, 6);

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}
