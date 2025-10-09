import React, { useMemo } from 'react';
import { ChartDataPoint } from '../../types';
import { formatCurrency } from '../../../utils';

interface PieChartProps {
    data: ChartDataPoint[];
}

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff", "#6b7280", "#9ca3af"];

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    const { slices, totalValue } = useMemo(() => {
        const positiveData = data.filter(d => d.value > 0);
        const total = positiveData.reduce((sum, d) => sum + d.value, 0);
        if (total === 0) return { slices: [], totalValue: 0 };

        let cumulativePercent = 0;
        const slices = positiveData.map((point, index) => {
            const percent = point.value / total;
            const slice = {
                percent,
                color: COLORS[index % COLORS.length],
                label: point.label,
                value: point.value,
                offset: (cumulativePercent * circumference),
                dashArray: `${percent * circumference} ${circumference}`
            };
            cumulativePercent += percent;
            return slice;
        });

        return { slices, totalValue: total };
    }, [data, circumference]);

    if (totalValue === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-500">Không có doanh thu dương để hiển thị.</div>;
    }

    return (
        <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-8" aria-label="Biểu đồ tròn doanh thu">
            <svg viewBox="-100 -100 200 200" width="180" height="180" role="img" className="transform -rotate-90 flex-shrink-0">
                <title>Biểu đồ tròn doanh thu</title>
                {slices.map((slice, index) => (
                    <circle
                        key={index}
                        r={radius}
                        cx="0"
                        cy="0"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="32"
                        strokeDasharray={slice.dashArray}
                        strokeDashoffset={-slice.offset}
                    />
                ))}
            </svg>
            <div className="text-sm max-h-48 overflow-y-auto pr-2 flex-1 min-w-0">
                <p className="font-semibold mb-2">Tổng: {formatCurrency(totalValue)}</p>
                <ul className="space-y-1">
                    {slices.map((slice, index) => (
                        <li key={index} className="flex items-center justify-between gap-2">
                            <div className="flex items-center truncate">
                                <span className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" style={{ backgroundColor: slice.color }} />
                                <span className="font-medium truncate">{slice.label}:</span>
                            </div>
                            <div className="flex items-baseline flex-shrink-0">
                                <span className="text-gray-700 font-semibold">{formatCurrency(slice.value)}</span>
                                <span className="text-gray-400 text-xs ml-2">({(slice.percent * 100).toFixed(1)}%)</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PieChart;
