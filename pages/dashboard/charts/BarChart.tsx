import React from 'react';

interface ChartDataPoint {
    date: string;
    value: number;
}

interface BarChartProps {
    data: ChartDataPoint[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const formatValue = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toLocaleString('vi-VN');
    };

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="flex items-end justify-between h-64 space-x-2" role="figure" aria-label="Biểu đồ cột">
            {data.map(item => (
                <div key={item.date} className="flex-1 flex flex-col items-center group relative h-full">
                    {/* Tooltip */}
                    <div className="absolute -top-8 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {item.value.toLocaleString('vi-VN')}
                    </div>
                    
                    {/* Cột biểu đồ */}
                    <div
                        className="w-full rounded-t-md transition-all duration-300 transform group-hover:-translate-y-1"
                        style={{ 
                            height: `${(item.value / maxValue) * 100}%`,
                            background: item.value > 0 
                                ? 'linear-gradient(to top, #60a5fa, #2563eb)' 
                                : 'transparent'
                        }}
                    />
                    
                    {/* Đường kẻ cho giá trị 0 */}
                    {item.value === 0 && <div className="w-full h-1 bg-gray-200 rounded-full"></div>}

                    {/* Nhãn ngày */}
                    <span className="text-xs text-gray-500 mt-2">{item.date}</span>
                </div>
            ))}
        </div>
    );
};

export default BarChart;