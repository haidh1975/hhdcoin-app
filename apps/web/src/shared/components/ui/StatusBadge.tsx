import { cn } from '@/shared/utils/cn';
import { BADGE_TONE_CLASSES, type BadgeTone } from '@/shared/components/ui/Badge';

/**
 * Bốn hình dạng badge trạng thái đang dùng trong ứng dụng. Mỗi biến thể khớp
 * chính xác class của trang tương ứng để không đổi giao diện.
 */
export type StatusBadgeVariant = 'compact' | 'chip' | 'tag' | 'tagStrong';

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  compact: 'text-xs px-1.5 py-0.5 rounded',
  chip: 'text-xs font-semibold px-2 py-0.5 rounded',
  tag: 'text-xs font-medium px-2 py-1 rounded',
  tagStrong: 'text-xs font-semibold px-2 py-1 rounded',
};

export interface StatusBadgeProps {
  label: string;
  /** Tông màu lấy từ bảng của Badge. */
  tone?: BadgeTone;
  /** Class màu thô — dùng khi màu nằm ngoài bảng tông (ví dụ tier staking). */
  colorClasses?: string;
  variant?: StatusBadgeVariant;
  className?: string;
}

export function StatusBadge({
  label,
  tone = 'neutral',
  colorClasses,
  variant = 'tag',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        VARIANT_CLASSES[variant],
        colorClasses ?? BADGE_TONE_CLASSES[tone].soft,
        className
      )}
    >
      {label}
    </span>
  );
}
