import React from 'react';

interface GaugeDialProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  size?: number;
  zones?: Array<{ from: number; to: number; color: string }>;
  color?: string;
  decimals?: number;
  sublabel?: string;
  labelPosition?: 'top' | 'bottom';
}

export const GaugeDial: React.FC<GaugeDialProps> = ({
  value,
  min,
  max,
  label,
  unit,
  size = 200,
  zones,
  color = '#06b6d4', // cyan-500
  decimals = 0,
  sublabel,
  labelPosition = 'top'
}) => {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  // Gauge sweeps 240 degrees (from 150 deg to 390 deg)
  const startAngle = 150;
  const totalAngle = 240;
  const currentAngle = startAngle + percentage * totalAngle;

  // Proportional stroke and scaling for mobile compact gauges
  const strokeWidth = Math.max(6, Math.round(size * 0.075));
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  // Helper to convert polar to cartesian coordinates
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, end);
    const endPoint = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return ['M', startPoint.x, startPoint.y, 'A', r, r, 0, largeArcFlag, 0, endPoint.x, endPoint.y].join(' ');
  };

  const backgroundArc = describeArc(center, center, radius, startAngle, startAngle + totalAngle);
  const valueArc = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));

  // Determine color based on zones or default
  let activeColor = color;
  if (zones) {
    for (const zone of zones) {
      if (clampedValue >= zone.from && clampedValue <= zone.to) {
        activeColor = zone.color;
        break;
      }
    }
  }

  // Clean value sizing for mobile
  const valFontSize = size < 130 ? 'text-xl' : size < 160 ? 'text-2xl' : size < 190 ? 'text-3xl' : 'text-4xl';

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      {/* Label positioned clearly on TOP to prevent ANY overlap with gauge arcs */}
      {labelPosition === 'top' && (
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-center truncate max-w-full">
          {label}
        </span>
      )}

      {/* SVG Container with full dimensions so graphics never spill over labels */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block overflow-visible">
          <defs>
            <linearGradient id={`grad-${label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor={activeColor} />
            </linearGradient>
            <filter id={`glow-${label.replace(/\s+/g, '-')}`} x1="-20%" y1="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track background */}
          <path
            d={backgroundArc}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Zones if specified */}
          {zones?.map((zone, idx) => {
            const zFromPct = (zone.from - min) / (max - min);
            const zToPct = (zone.to - min) / (max - min);
            const zStart = startAngle + zFromPct * totalAngle;
            const zEnd = startAngle + zToPct * totalAngle;
            return (
              <path
                key={idx}
                d={describeArc(center, center, radius, zStart, zEnd)}
                fill="none"
                stroke={zone.color}
                strokeWidth={strokeWidth}
                strokeOpacity={0.3}
                strokeLinecap="butt"
              />
            );
          })}

          {/* Active value track */}
          <path
            d={valueArc}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#glow-${label.replace(/\s+/g, '-')})`}
            className="transition-all duration-300 ease-out"
          />

          {/* Needle indicator tick */}
          {(() => {
            const needlePoint = polarToCartesian(center, center, radius - strokeWidth / 2 - 1, currentAngle);
            const needleBase = polarToCartesian(center, center, radius + strokeWidth / 2 + 1, currentAngle);
            return (
              <line
                x1={needleBase.x}
                y1={needleBase.y}
                x2={needlePoint.x}
                y2={needlePoint.y}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })()}
        </svg>

        {/* Center Readout completely centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`${valFontSize} font-black tracking-tight text-white font-mono tabular-nums leading-none`}>
            {value.toFixed(decimals)}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 mt-1">
            {unit}
          </span>
          {sublabel && (
            <span className="text-[9px] text-slate-500 font-mono mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* Optional bottom label with ample margin so it never overlaps */}
      {labelPosition === 'bottom' && (
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 mt-2 text-center truncate max-w-full">
          {label}
        </span>
      )}
    </div>
  );
};
