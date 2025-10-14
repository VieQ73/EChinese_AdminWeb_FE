import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, DollarSign, AlertTriangle, ShieldAlert, UserPlus } from 'lucide-react';

const BarChart = React.lazy(() => import('../charts/BarChart'));
const LineChartComponent = React.lazy(() => import('../charts/LineChart'));

interface ChartDataPoint {
    date: string;
    value: number;
}

interface AnalyticsCardProps {
    dailyRevenue: ChartDataPoint[];
    dailyReports: ChartDataPoint[];
    dailyViolations: ChartDataPoint[];
    dailyNewUsers: ChartDataPoint[];
}

type TabId = 'revenue' | 'reports' | 'violations' | 'newUsers';
type ChartType = 'bar' | 'line';

const TABS = [
    { id: 'revenue' as TabId, label: 'Doanh thu', icon: DollarSign },
    { id: 'reports' as TabId, label: 'Báo cáo', icon: AlertTriangle },
    { id: 'violations' as TabId, label: 'Vi phạm', icon: ShieldAlert },
    { id: 'newUsers' as TabId, label: 'Người dùng mới', icon: UserPlus },
];

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ dailyRevenue, dailyReports, dailyViolations, dailyNewUsers }) => {
    const [activeTab, setActiveTab] = useState<TabId>('revenue');
    const [chartType, setChartType] = useState<ChartType>('bar');

    const dataMap = useMemo(() => ({
        revenue: dailyRevenue,
        reports: dailyReports,
        violations: dailyViolations,
        newUsers: dailyNewUsers,
    }), [dailyRevenue, dailyReports, dailyViolations, dailyNewUsers]);

    const activeData = dataMap[activeTab];

    const renderChart = () => {
        switch (chartType) {
            case 'line':
                return <LineChartComponent data={activeData} />;
            case 'bar':
            default:
                return <BarChart data={activeData} />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Phân tích & Thống kê</h2>
                <div className="flex items-center gap-2 border border-gray-200 p-1 rounded-lg">
                    <ChartTypeButton current={chartType} type="bar" setType={setChartType} icon={BarChart3} />
                    <ChartTypeButton current={chartType} type="line" setType={setChartType} icon={LineChart} />
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {TABS.map(tab => (
                        <TabButton 
                            key={tab.id}
                            label={tab.label}
                            icon={tab.icon}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-gray-500">Đang tải biểu đồ...</div>}>
                    {renderChart()}
                </React.Suspense>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center whitespace-nowrap py-3 px-2 border-b-2 font-semibold text-sm transition-colors ${
            isActive
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <Icon className="w-4 h-4 mr-2" />
        {label}
    </button>
);

const ChartTypeButton: React.FC<{ current: ChartType, type: ChartType, setType: (t: ChartType) => void, icon: React.FC<any> }> = ({ current, type, setType, icon: Icon }) => (
    <button
        onClick={() => setType(type)}
        className={`p-1.5 rounded-md transition-colors ${
            current === type ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
        }`}
    >
        <Icon className="w-5 h-5" />
    </button>
);

export default AnalyticsCard;