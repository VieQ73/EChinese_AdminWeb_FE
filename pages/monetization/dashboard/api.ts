import { DashboardStats, ChartDataPoint, QuickSearchResult } from './types';
import { mockPayments, mockUserSubscriptions, mockRefunds } from '../../../mock';
import { enrichPayment } from '../payments/api';
import { Payment, Refund } from '../../../types';
import { apiClient } from '../../../services/apiClient';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';


/**
 * Tính toán doanh thu ròng từ danh sách các giao dịch thanh toán và hoàn tiền.
 * @param payments - Mảng các giao dịch thanh toán.
 * @param refunds - Mảng các giao dịch hoàn tiền.
 * @returns Doanh thu ròng.
 */
const getNetRevenue = (payments: Payment[], refunds: Refund[]): number => {
    const totalPayments = payments
        .filter(p => p.status === 'successful' || p.status === 'manual_confirmed')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const totalRefunds = refunds
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.refund_amount, 0);
        
    return totalPayments - totalRefunds;
};

/**
 * API mock để lấy dữ liệu tổng quan, tính toán từ mock data thực tế.
 */
export const fetchMonetizationDashboardStats = (): Promise<DashboardStats> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                
                // --- Tính toán Doanh thu ---
                const paymentsThisMonth = mockPayments.filter(p => {
                    const date = new Date(p.transaction_date);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                });
                const refundsThisMonth = mockRefunds.filter(r => {
                    const date = r.processed_at ? new Date(r.processed_at) : null;
                    return r.status === 'completed' && date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                });
                const revenueThisMonth = getNetRevenue(paymentsThisMonth, refundsThisMonth);

                const paymentsThisYear = mockPayments.filter(p => new Date(p.transaction_date).getFullYear() === currentYear);
                const refundsThisYear = mockRefunds.filter(r => r.status === 'completed' && r.processed_at && new Date(r.processed_at).getFullYear() === currentYear);
                const revenueThisYear = getNetRevenue(paymentsThisYear, refundsThisYear);

                // --- Tính toán Dữ liệu Biểu đồ ---
                const chartData: DashboardStats['chartData'] = { day: [], week: [], month: [] };
                
                const timeframes = {
                    day: { points: 24 }, // last 24 hours
                    week: { points: 7 },  // last 7 days
                    month: { points: 30 }, // last 30 days
                };

                for (const [key, config] of Object.entries(timeframes)) {
                    const dataPoints: ChartDataPoint[] = [];
                    for (let i = config.points - 1; i >= 0; i--) {
                        const pointStartDate = new Date();
                        const pointEndDate = new Date();
                        let label = '';

                        if (key === 'day') {
                            pointStartDate.setHours(now.getHours() - i, 0, 0, 0);
                            pointEndDate.setHours(now.getHours() - i, 59, 59, 999);
                            label = `${pointStartDate.getHours()}h`;
                        } else { // week or month
                            pointStartDate.setDate(now.getDate() - i);
                            pointStartDate.setHours(0, 0, 0, 0);
                            pointEndDate.setDate(now.getDate() - i);
                            pointEndDate.setHours(23, 59, 59, 999);
                            label = `${pointStartDate.getDate()}/${pointStartDate.getMonth() + 1}`;
                        }
                        
                        const pointPayments = mockPayments.filter(p => {
                            const pDate = new Date(p.transaction_date);
                            return pDate >= pointStartDate && pDate <= pointEndDate;
                        });
                        
                        const pointRefunds = mockRefunds.filter(r => {
                            if (r.status !== 'completed' || !r.processed_at) return false;
                            const rDate = new Date(r.processed_at);
                            return rDate >= pointStartDate && rDate <= pointEndDate;
                        });

                        dataPoints.push({ label, value: getNetRevenue(pointPayments, pointRefunds) });
                    }
                    chartData[key as 'day' | 'week' | 'month'] = dataPoints;
                }


                const stats: DashboardStats = {
                    revenueThisMonth,
                    revenueThisYear,
                    transactions: {
                        successful: mockPayments.filter(p => ['successful', 'manual_confirmed', 'partially-refunded'].includes(p.status)).length,
                        pending: mockPayments.filter(p => p.status === 'pending').length,
                        failed: mockPayments.filter(p => p.status === 'failed').length,
                    },
                    activeSubscriptions: mockUserSubscriptions.filter(s => s.is_active).length,
                    pendingRefunds: mockRefunds.filter(r => r.status === 'pending').length,
                    chartData,
                };
                resolve(stats);
            }, 800); // Mô phỏng độ trễ mạng
        });
    }
    // Kết nối API thật
    return apiClient.get('/monetization/dashboard/stats');
};

/**
 * API để tìm kiếm nhanh giao dịch.
 */
export const quickSearchTransaction = (query: string): Promise<QuickSearchResult> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const lowerQuery = query.toLowerCase().trim();
                if (!lowerQuery) {
                    return resolve(null);
                }
                
                const enrichedPayments = mockPayments.map(enrichPayment);
                
                const found = enrichedPayments.find(p => 
                    p.id.toLowerCase().includes(lowerQuery) ||
                    p.user_id.toLowerCase().includes(lowerQuery) ||
                    p.userEmail?.toLowerCase().includes(lowerQuery)
                );

                resolve(found || 'not_found');
            }, 500);
        });
    }

    // Kết nối API thật
    const endpoint = `/monetization/payments/search?query=${encodeURIComponent(query)}`;
    return apiClient.get<Payment>(endpoint)
        .then(result => result)
        .catch(error => {
            if (error instanceof Error && error.message.toLowerCase().includes('not found')) {
                return 'not_found';
            }
            throw error;
        });
};