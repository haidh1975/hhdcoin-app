import { useMarketData } from '@/hooks/useMarketData';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Bảng giá đa tài sản real-time — crypto, cổ phiếu, chỉ số */
export function MarketOverview({ className }: { className?: string }) {
  const { assets, isLoading, lastUpdated } = useMarketData();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Thị trường real-time</CardTitle>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Cập nhật {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Đang tải dữ liệu thị trường...
          </div>
        ) : (
          <div className="divide-y divide-border">
            {assets.map((asset) => {
              const isUp = asset.change24h >= 0;
              return (
                <div key={asset.symbol} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm w-12">{asset.symbol}</span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold tabular-nums">
                      ${asset.price.toLocaleString('en-US', {
                        minimumFractionDigits: asset.price < 10 ? 4 : 2,
                        maximumFractionDigits: asset.price < 10 ? 4 : 2,
                      })}
                    </span>
                    <span className={cn(
                      'flex items-center gap-0.5 text-sm font-medium w-20 justify-end tabular-nums',
                      isUp ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {isUp ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
