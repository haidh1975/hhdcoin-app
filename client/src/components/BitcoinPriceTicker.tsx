import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { TrendingUp, TrendingDown, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BitcoinPriceTickerProps {
  className?: string;
  compact?: boolean;
}

export function BitcoinPriceTicker({ className, compact = false }: BitcoinPriceTickerProps) {
  const { data, isConnected, isLoading } = useBitcoinPrice();

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-gray-500', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {!compact && <span>Đang tải giá...</span>}
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.change24h >= 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Trạng thái kết nối */}
      {isConnected ? (
        <Wifi className="h-3 w-3 text-green-500 shrink-0" />
      ) : (
        <WifiOff className="h-3 w-3 text-gray-400 shrink-0" />
      )}

      {/* Giá */}
      <span className="font-bold text-gray-900">
        ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>

      {/* % thay đổi 24h */}
      <span className={cn(
        'flex items-center gap-0.5 text-sm font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}>
        {isPositive
          ? <TrendingUp className="h-3.5 w-3.5" />
          : <TrendingDown className="h-3.5 w-3.5" />
        }
        {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
      </span>

      {!compact && (
        <span className="text-xs text-gray-400">24h</span>
      )}
    </div>
  );
}
