/** Badge nhỏ hiển thị nguồn dữ liệu giá: thật (Live) hay demo (mock). */
export function SourceBadge({ source }: { source: 'live' | 'mock' }) {
  const isLive = source === 'live';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
        isLive
          ? 'text-green-400 border-green-500/30 bg-green-500/10'
          : 'text-dark-400 border-dark-600 bg-dark-700'
      }`}
      title={isLive ? 'Giá thật từ Binance' : 'Dữ liệu demo (không có kết nối tới sàn)'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-dark-400'}`} />
      {isLive ? 'Live' : 'Demo'}
    </span>
  );
}
