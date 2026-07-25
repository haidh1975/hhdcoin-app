'use client';

import { getRiskColor } from '@/shared/utils/colors';

interface RiskGaugeProps {
  score: number; // 0-100
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getRiskColor(clampedScore);

  // SVG arc gauge (180-degree semicircle)
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const strokeWidth = 14;

  // The gauge arc goes from 180° (left) to 0° (right) — semicircle
  // Full arc length
  const circumference = Math.PI * radius; // half circle

  // The "filled" portion
  const filledLength = (clampedScore / 100) * circumference;
  const gapLength = circumference - filledLength;

  // For a left-to-right arc (bottom half), we use a path
  const startAngle = 180; // degrees
  const endAngle = 0;

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  const start = polarToCartesian(180); // (cx - radius, cy)
  const end = polarToCartesian(0);    // (cx + radius, cy)

  const trackPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;

  // Needle angle: maps 0→180° (left) to 100→0° (right)
  const needleAngle = 180 - (clampedScore / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = radius - 10;
  const needleTip = {
    x: cx + needleLength * Math.cos(needleRad),
    y: cy + needleLength * Math.sin(needleRad),
  };

  // Ticks
  const ticks = [0, 25, 50, 75, 100];
  const tickLabels = ['0', '25', '50', '75', '100'];

  return (
    <div className="flex items-center justify-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Background track */}
        <path
          d={trackPath}
          fill="none"
          stroke="#1E2329"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored progress arc */}
        <path
          d={trackPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${gapLength}`}
          style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.4s ease' }}
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => {
          const tickAngle = 180 - (tick / 100) * 180;
          const tickRad = (tickAngle * Math.PI) / 180;
          const inner = radius - strokeWidth / 2 - 4;
          const outer = radius + strokeWidth / 2 + 2;
          const tx1 = cx + inner * Math.cos(tickRad);
          const ty1 = cy + inner * Math.sin(tickRad);
          const tx2 = cx + outer * Math.cos(tickRad);
          const ty2 = cy + outer * Math.sin(tickRad);
          const labelR = radius + strokeWidth / 2 + 12;
          const lx = cx + labelR * Math.cos(tickRad);
          const ly = cy + labelR * Math.sin(tickRad);

          return (
            <g key={tick}>
              <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#474D57" strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={8}
                fill="#474D57"
              >
                {tickLabels[i]}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ transition: 'all 0.8s ease' }}
        />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        <circle cx={cx} cy={cy} r={2.5} fill="#0B0E11" />

        {/* Score text in center */}
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill={color}
          style={{ transition: 'fill 0.4s ease' }}
        >
          {clampedScore}
        </text>
      </svg>
    </div>
  );
}
