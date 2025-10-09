import React from 'react';
import { ChartDataPoint } from '../../types';
import { formatCurrency } from '../../../utils';

interface BarChartProps {
    data: ChartDataPoint[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 1) : 1;

    // Tự động phát hiện khi nào cần cuộn ngang
    const isOverflowing = data.length > 15;

    return (
        <div 
            className={`h-64 w-full ${isOverflowing ? 'overflow-x-auto' : ''}`} 
            aria-label="Biểu đồ cột doanh thu"
        >
            <div 
                className={`h-full flex items-end gap-2 pr-4 ${isOverflowing ? 'justify-start' : 'justify-between'}`} 
                role="list"
                // Đặt chiều rộng tối thiểu để kích hoạt thanh cuộn khi cần
                style={isOverflowing ? { minWidth: `${data.length * 2.25}rem` } : {}}
            >
                {data.map((point, index) => (
                    <div 
                        key={index} 
                        // Đặt chiều rộng cố định cho mỗi cột khi cuộn, ngược lại co giãn
                        className={`flex flex-col items-center group relative h-full ${isOverflowing ? 'w-6' : 'flex-1'}`} 
                        role="listitem"
                    >
                        <div className="absolute -top-8 mb-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {formatCurrency(point.value)}
                        </div>
                        <div
                            className="w-full bg-blue-200 rounded-t-md hover:bg-primary-400 transition-colors duration-200"
                            style={{ height: `${Math.max((point.value / maxValue) * 100, 0.5)}%` }} // min-height of 0.5% for visibility
                            aria-label={`Doanh thu ${point.label}: ${formatCurrency(point.value)}`}
                        />
                        <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">{point.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;