import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

/** Chrome mặc định của thẻ (card) trong toàn bộ ứng dụng. */
export const CARD_CLASS = 'bg-dark-800 border border-dark-600 rounded-xl';

/**
 * Dùng cho các phần tử KHÔNG phải `<div>` (ví dụ `<Link>`, `<form>`) muốn có
 * chrome của Card.
 */
export function cardClass(...extra: (string | false | null | undefined)[]): string {
  return cn(CARD_CLASS, ...extra);
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Thêm padding tiêu chuẩn `p-5`. Bỏ qua nếu tự truyền padding qua className. */
  padded?: boolean;
  children?: ReactNode;
}

export function Card({ className, padded, children, ...rest }: CardProps) {
  return (
    <div className={cn(CARD_CLASS, padded && 'p-5', className)} {...rest}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Dải tiêu đề nằm trên cùng của Card, ngăn cách bằng viền dưới. */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div className={cn('px-5 py-4 border-b border-dark-600', className)} {...rest}>
      {children}
    </div>
  );
}
