import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  valueColor?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  valueColor = 'text-white',
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : null;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-dark-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-dark-700">
          <Icon className="w-4 h-4 text-brand" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositive
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(2)}%
          </div>
        )}
      </div>
      <p className="text-xs text-dark-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      {changeLabel && (
        <p className="text-xs text-dark-500 mt-1">{changeLabel}</p>
      )}
    </div>
  );
}
