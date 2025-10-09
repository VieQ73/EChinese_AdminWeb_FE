import React, { useMemo } from 'react';
import { ChartDataPoint } from '../../types';
import { formatCurrency } from '../../../utils';

interface LineChartProps {
    data: ChartDataPoint[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const width = 500;
    const height = 256;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };

    const { points, path, yAxisLabels } = useMemo(() => {
        const maxValue = Math.max(...data.map(d => d.value), 1);
        const yMax = maxValue * 1.1; // Add 10% padding at top

        const getX = (index: number) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
        const getY = (value: number) => height - padding.bottom - (value / yMax) * (height - padding.top - padding.bottom);

        const points = data.map((point, i) => ({
            x: getX(i),
            y: getY(point.value),
            value: point.value,
            label: point.label,
        }));

        const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
        
        const yAxisLabelCount = 4;
        const yAxisLabels = Array.from({ length: yAxisLabelCount + 1 }).map((_, i) => {
            const value = (yMax / yAxisLabelCount) * i;
            return {
                y: getY(value),
                label: i === 0 ? '0' : `${(value / 1000).toFixed(0)}k`,
            };
        });

        return { points, path, yAxisLabels };
    }, [data, width, height, padding]);

    return (
        <div className="h-64 w-full" aria-label="Biểu đồ đường doanh thu">
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img">
                <title>Biểu đồ đường doanh thu</title>
                {/* Y-axis grid lines and labels */}
                {yAxisLabels.map((labelInfo, i) => (
                    <g key={i} className="text-gray-300">
                        <line
                            x1={padding.left}
                            y1={labelInfo.y}
                            x2={width - padding.right}
                            y2={labelInfo.y}
                            stroke="currentColor"
                            strokeWidth="0.5"
                        />
                        <text x={padding.left - 8} y={labelInfo.y + 3} textAnchor="end" fontSize="10" fill="#6b7280">
                            {labelInfo.label}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {points.map((point, i) => (
                    <text key={i} x={point.x} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#6b7280">
                        {point.label}
                    </text>
                ))}

                {/* Line path */}
                <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" />
                
                {/* Area under the line */}
                <path d={`${path} V ${height - padding.bottom} H ${padding.left} Z`} fill="url(#gradient)" />
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Data points and tooltips */}
                {points.map((point, i) => (
                    <g key={i} className="group">
                        <circle cx={point.x} cy={point.y} r="8" fill="transparent" />
                        <circle cx={point.x} cy={point.y} r="3" fill="white" stroke="#2563eb" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        <foreignObject x={point.x - 50} y={point.y - 45} width="100" height="30" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 text-center shadow-lg">
                                {formatCurrency(point.value)}
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default LineChart;
