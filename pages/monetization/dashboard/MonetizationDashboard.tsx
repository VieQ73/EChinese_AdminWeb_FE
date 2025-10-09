import React, { useState, useEffect, useCallback } from 'react';
import { fetchMonetizationDashboardStats } from '../api';
import { DashboardStats } from './types';
import { formatCurrency } from '../utils';

import StatCard from './components/StatCard';
import RevenueChart from './components/RevenueChart';
import QuickSearch from './components/QuickSearch';
import PaymentDetailModal from '../payments/components/PaymentDetailModal';
import { Payment } from '../../../types';

import { CurrencyDollarIcon, UsersIcon, CheckCircleIcon } from '../../../constants';
import { RefreshCw } from 'lucide-react';

const MonetizationDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [searchResult, setSearchResult] = useState<Payment | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMonetizationDashboardStats();
            setStats(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Tổng quan Gói đăng ký & Thanh toán</h2>
                    {lastUpdated && !loading && (
                        <p className="text-sm text-gray-500">
                            Cập nhật lần cuối: {lastUpdated.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (GMT+7)
                        </p>
                    )}
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                    <p>{error}</p>
                    <button onClick={loadData} className="font-semibold underline mt-1">Thử lại</button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Doanh thu tháng này"
                    value={formatCurrency(stats?.revenueThisMonth ?? 0)}
                    icon={CurrencyDollarIcon}
                    loading={loading}
                    description={`Tổng năm: ${formatCurrency(stats?.revenueThisYear ?? 0)}`}
                />
                <StatCard
                    title="Giao dịch thành công"
                    value={(stats?.transactions.successful ?? 0).toLocaleString()}
                    icon={CheckCircleIcon}
                    loading={loading}
                    description={`Chờ: ${stats?.transactions.pending} / Lỗi: ${stats?.transactions.failed}`}
                />
                 <StatCard
                    title="Gói đang hoạt động"
                    value={(stats?.activeSubscriptions ?? 0).toLocaleString()}
                    icon={UsersIcon}
                    loading={loading}
                    description={`Chờ hoàn tiền: ${stats?.pendingRefunds ?? 0}`}
                />
            </div>
            
            {/* Chart and Quick Search */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RevenueChart chartData={stats?.chartData} loading={loading} />
                <QuickSearch onResult={setSearchResult} />
            </div>

            <PaymentDetailModal
                isOpen={!!searchResult}
                onClose={() => setSearchResult(null)}
                payment={searchResult}
            />
        </div>
    );
};

export default MonetizationDashboard;
