import React, { useId, useState } from 'react';

export type SparklineColor = 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'purple' | 'slate';

export interface SparklineChartProps {
  data: number[];
  color?: SparklineColor;
  height?: number;
  width?: number | string;
  showArea?: boolean;
  showEndDot?: boolean;
  showTrendLabel?: boolean;
  trendLabel?: string;
  className?: string;
  formatTooltip?: (val: number) => string;
}

const colorStyles: Record<
  SparklineColor,
  {
    stroke: string;
    fillStart: string;
    fillEnd: string;
    dotFill: string;
    dotPing: string;
    textBadge: string;
  }
> = {
  emerald: {
    stroke: '#10b981',
    fillStart: 'rgba(16, 185, 129, 0.35)',
    fillEnd: 'rgba(16, 185, 129, 0.0)',
    dotFill: '#059669',
    dotPing: 'rgba(16, 185, 129, 0.5)',
    textBadge: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  blue: {
    stroke: '#3b82f6',
    fillStart: 'rgba(59, 130, 246, 0.35)',
    fillEnd: 'rgba(59, 130, 246, 0.0)',
    dotFill: '#2563eb',
    dotPing: 'rgba(59, 130, 246, 0.5)',
    textBadge: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  indigo: {
    stroke: '#6366f1',
    fillStart: 'rgba(99, 102, 241, 0.35)',
    fillEnd: 'rgba(99, 102, 241, 0.0)',
    dotFill: '#4f46e5',
    dotPing: 'rgba(99, 102, 241, 0.5)',
    textBadge: 'text-indigo-700 bg-indigo-50 border-indigo-200'
  },
  amber: {
    stroke: '#f59e0b',
    fillStart: 'rgba(245, 158, 11, 0.35)',
    fillEnd: 'rgba(245, 158, 11, 0.0)',
    dotFill: '#d97706',
    dotPing: 'rgba(245, 158, 11, 0.5)',
    textBadge: 'text-amber-700 bg-amber-50 border-amber-200'
  },
  rose: {
    stroke: '#f43f5e',
    fillStart: 'rgba(244, 63, 94, 0.35)',
    fillEnd: 'rgba(244, 63, 94, 0.0)',
    dotFill: '#e11d48',
    dotPing: 'rgba(244, 63, 94, 0.5)',
    textBadge: 'text-rose-700 bg-rose-50 border-rose-200'
  },
  purple: {
    stroke: '#a855f7',
    fillStart: 'rgba(168, 85, 247, 0.35)',
    fillEnd: 'rgba(168, 85, 247, 0.0)',
    dotFill: '#9333ea',
    dotPing: 'rgba(168, 85, 247, 0.5)',
    textBadge: 'text-purple-700 bg-purple-50 border-purple-200'
  },
  slate: {
    stroke: '#64748b',
    fillStart: 'rgba(100, 116, 139, 0.35)',
    fillEnd: 'rgba(100, 116, 139, 0.0)',
    dotFill: '#475569',
    dotPing: 'rgba(100, 116, 139, 0.5)',
    textBadge: 'text-slate-700 bg-slate-50 border-slate-200'
  }
};

/**
 * Creates smooth cubic bezier curve SVG path from coordinates
 */
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const tension = 0.2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = 'blue',
  height = 36,
  width = '100%',
  showArea = true,
  showEndDot = true,
  showTrendLabel = true,
  trendLabel = '30-Day Trend',
  className = '',
  formatTooltip
}) => {
  const gradientId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; day: number } | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  // Target coordinate system
  const svgWidth = 140;
  const svgHeight = 40;
  const paddingY = 6;
  const paddingX = 4;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (svgWidth - paddingX * 2);
    // Invert Y so higher values are higher up
    const normalizedY = (val - minVal) / range;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);
    return { x, y, val, day: 30 - data.length + idx + 1 };
  });

  const linePath = createSmoothPath(points);

  const firstPt = points[0];
  const lastPt = points[points.length - 1];

  // Area path closes at bottom of svg
  const areaPath = `${linePath} L ${lastPt.x} ${svgHeight} L ${firstPt.x} ${svgHeight} Z`;

  const theme = colorStyles[color] || colorStyles.blue;

  // Calculate percentage change over the 30-day window
  const startVal = data[0];
  const endVal = data[data.length - 1];
  const diff = endVal - startVal;
  const percentChange = startVal !== 0 ? ((diff / Math.abs(startVal)) * 100).toFixed(1) : diff > 0 ? '+100' : '0.0';
  const isPositive = diff >= 0;

  return (
    <div className={`relative flex flex-col justify-end group/sparkline ${className}`}>
      {/* Top Header / Micro Metadata */}
      {showTrendLabel && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 select-none">
          <span className="font-medium tracking-tight opacity-75">{trendLabel}</span>
          <span className="font-mono font-bold text-[9px] text-slate-500">
            {isPositive ? `+${percentChange}%` : `${percentChange}%`}
          </span>
        </div>
      )}

      {/* Inline SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-lg">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full overflow-visible transition-transform duration-200 group-hover/sparkline:scale-[1.02]"
          style={{ height: `${height}px` }}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.fillStart} />
              <stop offset="100%" stopColor={theme.fillEnd} />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          {showArea && (
            <path
              d={areaPath}
              fill={`url(#${gradientId})`}
              className="transition-opacity duration-300"
            />
          )}

          {/* Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Interaction Areas */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={5}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
            />
          ))}

          {/* Endpoint Pulse Dot (Current day / 30th day) */}
          {showEndDot && (
            <g transform={`translate(${lastPt.x}, ${lastPt.y})`}>
              <circle
                r="4.5"
                fill={theme.stroke}
                className="animate-ping opacity-60"
              />
              <circle
                r="3"
                fill="#ffffff"
                stroke={theme.stroke}
                strokeWidth="2"
              />
            </g>
          )}

          {/* Hover Indicator Dot */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="3.5"
              fill="#ffffff"
              stroke={theme.stroke}
              strokeWidth="2.5"
            />
          )}
        </svg>

        {/* Floating Tooltip on Hover */}
        {hoveredPoint && (
          <div
            className="absolute -top-7 z-20 transform -translate-x-1/2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-mono shadow-md backdrop-blur-xs whitespace-nowrap"
            style={{ left: `${(hoveredPoint.x / svgWidth) * 100}%` }}
          >
            Day {hoveredPoint.day}: {formatTooltip ? formatTooltip(hoveredPoint.val) : hoveredPoint.val.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SparklineChart;
