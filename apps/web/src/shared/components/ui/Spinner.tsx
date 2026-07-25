import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface SpinnerProps {
  /** Class kích thước / màu. Mặc định `w-4 h-4`. */
  className?: string;
}

/** Icon quay tròn dùng trong nút bấm và vùng đang tải. */
export function Spinner({ className = 'w-4 h-4' }: SpinnerProps) {
  return <Loader2 className={cn(className, 'animate-spin')} />;
}
