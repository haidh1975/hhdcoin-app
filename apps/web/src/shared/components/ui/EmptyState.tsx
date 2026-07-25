import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export interface EmptyStateProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Dòng chữ căn giữa cho vùng trống hoặc đang tải bên trong một Card
 * (ví dụ "Đang tải...", "Chưa có giao dịch nào.").
 */
export function EmptyState({ className, children }: EmptyStateProps) {
  return (
    <div className={cn('px-5 py-10 text-center text-sm text-dark-400', className)}>{children}</div>
  );
}
