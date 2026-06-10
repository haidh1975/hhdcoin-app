import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MarketRow {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume?: number;
}

interface MarketTableProps {
  coins: MarketRow[];
}

function formatMarketCap(value?: number): string {
  if (!value) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function formatVolume(value?: number): string {
  if (!value) return '—';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

const COIN_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  BNB: 'B',
  SOL: 'S',
  XRP: 'X',
};

export function MarketTable({ coins }: MarketTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-600">
            <th className="text-left text-xs text-dark-400 font-medium px-5 py-3">#</th>
            <th className="text-left text-xs text-dark-400 font-medium px-3 py-3">Coin</th>
            <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Giá</th>
            <th className="text-right text-xs text-dark-400 font-medium px-3 py-3">Thay đổi 24h</th>
            <th className="text-right text-xs text-dark-400 font-medium px-3 py-3 hidden md:table-cell">
              Vốn hóa
            </th>
            <th className="text-right text-xs text-dark-400 font-medium px-5 py-3 hidden lg:table-cell">
              Volume 24h
            </th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, index) => {
            const isPositive = coin.change24h >= 0;
            return (
              <tr
                key={coin.symbol}
                className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <span className="text-sm text-dark-500">{index + 1}</span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand">
                        {COIN_ICONS[coin.symbol] ?? coin.symbol[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{coin.name}</p>
                      <p className="text-xs text-dark-400">{coin.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <span className="text-sm font-semibold text-white">
                    {formatPrice(coin.price)}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {isPositive ? '+' : ''}
                    {coin.change24h.toFixed(2)}%
                  </div>
                </td>
                <td className="px-3 py-3.5 text-right hidden md:table-cell">
                  <span className="text-sm text-dark-400">{formatMarketCap(coin.marketCap)}</span>
                </td>
                <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                  <span className="text-sm text-dark-400">{formatVolume(coin.volume)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
