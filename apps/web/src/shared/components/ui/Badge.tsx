import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'brand';

/** `soft` = nền 10%, `medium` = nền 20% (đậm hơn một bậc). */
export type BadgeIntensity = 'soft' | 'medium';

export const BADGE_TONE_CLASSES: Record<BadgeTone, Record<BadgeIntensity, string>> = {
  success: { soft: 'bg-green-500/10 text-green-400', medium: 'bg-green-500/20 text-green-400' },
  warning: { soft: 'bg-yellow-500/10 text-yellow-400', medium: 'bg-yellow-500/20 text-yellow-400' },
  danger: { soft: 'bg-red-500/10 text-red-400', medium: 'bg-red-500/20 text-red-400' },
  neutral: { soft: 'bg-dark-700 text-dark-400', medium: 'bg-dark-600 text-dark-400' },
  info: { soft: 'bg-blue-500/10 text-blue-400', medium: 'bg-blue-500/20 text-blue-400' },
  brand: { soft: 'bg-brand/10 text-brand', medium: 'bg-brand/20 text-brand' },
};

export interface BadgeProps {
  tone?: BadgeTone;
  intensity?: BadgeIntensity;
  className?: string;
  children?: ReactNode;
}

/** Pill nhỏ bo tròn hoàn toàn. */
export function Badge({ tone = 'neutral', intensity = 'soft', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        BADGE_TONE_CLASSES[tone][intensity],
        className
      )}
    >
      {children}
    </span>
  );
}
