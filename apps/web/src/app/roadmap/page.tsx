import { Map as MapIcon } from 'lucide-react';
import { ROADMAP } from '@/lib/hhd';

export default function RoadmapPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <MapIcon className="w-6 h-6 text-brand" /> Lộ trình phát triển
        </h1>
        <p className="text-dark-400 mt-1 text-sm">
          Hành trình HHD Coin 2026–2030: từ ra mắt mainnet đến mục tiêu Tier-1 và Vision 2030.
        </p>
      </div>

      <div className="space-y-8">
        {ROADMAP.map((group) => (
          <div key={group.year}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg font-bold text-brand">{group.year}</span>
              <div className="flex-1 h-px bg-dark-600" />
            </div>
            <div className="relative pl-6 space-y-5 border-l-2 border-dark-700">
              {group.items.map((item, i) => (
                <div key={i} className="relative">
                  {/* marker */}
                  <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand border-4 border-dark-900" />
                  <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <span className="text-xs font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded-lg">
                        {item.quarter}
                      </span>
                      <span className="text-xs text-dark-400">{item.targets}</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
