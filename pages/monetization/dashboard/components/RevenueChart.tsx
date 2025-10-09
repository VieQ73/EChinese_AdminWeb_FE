import React, { useState } from 'react';
import { ChartDataPoint } from '../types';
import { PieChart as PieChartIcon, LineChart, BarChart3 } from 'lucide-react';

// Lazy load chart components for better performance
const BarChartComponent = React.lazy(() => import('./charts/BarChart'));
const LineChartComponent = React.lazy(() => import('./charts/LineChart'));
const PieChartComponent = React.lazy(() => import('./charts/PieChart'));

type Timeframe = 'day' | 'week' | 'month';
type ChartType = 'bar' | 'line' | 'pie';

interface RevenueChartProps {
    chartData?: {
        day: ChartDataPoint[];
        week: ChartDataPoint[];
        month: ChartDataPoint[];
    };
    loading: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ chartData, loading }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('week');
    const [chartType, setChartType] = useState<ChartType>('bar');

    const data = chartData ? chartData[timeframe] : [];

    const TimeframeButton: React.FC<{ tf: Timeframe, label: string }> = ({ tf, label }) => (
        <button
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
                timeframe === tf ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

    const ChartTypeButton: React.FC<{ ct: ChartType, icon: React.FC<any>, title: string }> = ({ ct, icon: Icon, title }) => (
        <button
            onClick={() => setChartType(ct)}
            className={`p-1.5 rounded-md ${
                chartType === ct ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={title}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
    
    const renderChart = () => {
        if (loading) {
             return (
                <div className="h-64 flex items-end space-x-2 pt-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex-1 h-full bg-gray-200 rounded-t-md animate-pulse" style={{ height: `${Math.random() * 80 + 10}%` }} />
                    ))}
                </div>
            );
        }
        if (!data || data.length === 0) {
            return <div className="h-64 flex items-center justify-center text-gray-500">Không có dữ liệu để hiển thị.</div>;
        }
        
        switch(chartType) {
            case 'line':
                return <LineChartComponent data={data} />;
            case 'pie':
                return <PieChartComponent data={data} />;
            case 'bar':
            default:
                return <BarChartComponent data={data} />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold">Biểu đồ doanh thu</h3>
                <div className="flex items-center gap-4">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <TimeframeButton tf="day" label="Ngày" />
                        <TimeframeButton tf="week" label="Tuần" />
                        <TimeframeButton tf="month" label="Tháng" />
                    </div>
                    <div className="flex space-x-1 border p-1 rounded-lg">
                        <ChartTypeButton ct="bar" icon={BarChart3} title="Biểu đồ cột" />
                        <ChartTypeButton ct="line" icon={LineChart} title="Biểu đồ đường" />
                        <ChartTypeButton ct="pie" icon={PieChartIcon} title="Biểu đồ tròn" />
                    </div>
                </div>
            </div>
            
            <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-gray-500">Đang tải biểu đồ...</div>}>
                {renderChart()}
            </React.Suspense>
        </div>
    );
};

export default RevenueChart;
