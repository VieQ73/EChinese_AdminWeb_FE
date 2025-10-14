import { Payment, PaginatedResponse } from "../../../types";
import { mockUsers, mockSubscriptions, mockPayments } from "../../../mock";
import { apiClient } from '../../../services/apiClient';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// ===================================
// API CHO QUẢN LÝ THANH TOÁN
// ===================================

interface FetchPaymentsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    channel?: string;
    startDate?: string | null;
    endDate?: string | null;
}

/**
 * Làm giàu dữ liệu thanh toán với thông tin người dùng và gói.
 */
export const enrichPayment = (payment: Payment): Payment => {
    const user = mockUsers.find(u => u.id === payment.user_id);
    const subscription = mockSubscriptions.find(s => s.id === payment.subscription_id);
    const admin = mockUsers.find(u => u.id === payment.processed_by_admin);

    return {
        ...payment,
        userName: user?.name,
        userEmail: user?.email,
        subscriptionName: subscription?.name,
        processedByAdminName: admin?.name,
    };
};

export const fetchPayments = (params: FetchPaymentsParams = {}): Promise<PaginatedResponse<Payment>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 12, search, status, method, channel, startDate, endDate } = params;
                
                let filtered = mockPayments.map(enrichPayment);

                if (search) {
                    const lowerSearch = search.toLowerCase();
                    filtered = filtered.filter(p => 
                        p.id.toLowerCase().includes(lowerSearch) || 
                        p.userEmail?.toLowerCase().includes(lowerSearch)
                    );
                }
                if (status && status !== 'all') {
                    filtered = filtered.filter(p => p.status === status);
                }
                if (method && method !== 'all') {
                    filtered = filtered.filter(p => p.payment_method === method);
                }
                if (channel && channel !== 'all') {
                    filtered = filtered.filter(p => p.payment_channel === channel);
                }
                if (startDate || endDate) {
                    filtered = filtered.filter(p => {
                        const transactionDate = new Date(p.transaction_date);
                        if (startDate) {
                            const start = new Date(startDate);
                            start.setHours(0, 0, 0, 0);
                            if (transactionDate < start) return false;
                        }
                        if (endDate) {
                            const end = new Date(endDate);
                            end.setHours(23, 59, 59, 999);
                            if (transactionDate > end) return false;
                        }
                        return true;
                    });
                }

                filtered.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                
                resolve({
                    data,
                    meta: { total, page, limit, totalPages }
                });
            }, 500);
        });
    }
    // Kết nối API thật
    const queryParams = new URLSearchParams(params as any).toString();
    return apiClient.get(`/monetization/payments?${queryParams}`);
};

export const updatePaymentStatus = (paymentId: string, status: 'manual_confirmed' | 'failed', adminId: string): Promise<Payment> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
                if (paymentIndex === -1) {
                    return reject(new Error('Không tìm thấy giao dịch.'));
                }
                const payment = mockPayments[paymentIndex];
                if (payment.status !== 'pending') {
                    return reject(new Error('Chỉ có thể xử lý giao dịch đang chờ.'));
                }
                payment.status = status;
                payment.processed_by_admin = adminId;
                resolve(enrichPayment(payment));
            }, 300);
        });
    }
    // Kết nối API thật
    return apiClient.put(`/monetization/payments/${paymentId}/status`, { status, adminId });
};

export const bulkUpdatePaymentStatus = (paymentIds: string[], status: 'manual_confirmed', adminId: string): Promise<{ successCount: number }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let successCount = 0;
                paymentIds.forEach(id => {
                    const payment = mockPayments.find(p => p.id === id && p.status === 'pending');
                    if (payment) {
                        payment.status = status;
                        payment.processed_by_admin = adminId;
                        successCount++;
                    }
                });
                resolve({ successCount });
            }, 800);
        });
    }
    // Kết nối API thật
    return apiClient.put(`/monetization/payments/bulk-status`, { paymentIds, status, adminId });
};