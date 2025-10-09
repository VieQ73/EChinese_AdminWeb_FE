import { Refund, PaginatedResponse, Payment } from "../../../types";
import { mockUsers, mockPayments, mockRefunds } from "../../../mock";
import { enrichPayment } from '../payments/api';
import { apiClient } from '../../../services/apiClient';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// ===================================
// API CHO QUẢN LÝ HOÀN TIỀN
// ===================================
interface FetchRefundsParams {
    page?: number;
    limit?: number;
    search?: string; // by user name/email
    status?: 'all' | 'pending' | 'completed' | 'rejected';
}

export interface ProcessRefundPayload {
    action: 'approve' | 'reject';
    adminId: string;
    notes: string;
    // For approval
    amount?: number;
    method?: 'gateway' | 'manual_transfer';
}

const enrichRefund = (refund: Refund): Refund => {
    const user = mockUsers.find(u => u.id === refund.user_id);
    const admin = mockUsers.find(u => u.id === refund.processed_by_admin);
    const payment = mockPayments.find(p => p.id === refund.payment_id);
    return {
        ...refund,
        userName: user?.name,
        processedByAdminName: admin?.name,
        payment: payment ? enrichPayment(payment) : undefined,
    };
};

export const fetchRefunds = (params: FetchRefundsParams = {}): Promise<PaginatedResponse<Refund>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 12, search, status } = params;
                let filtered = mockRefunds.map(enrichRefund);
                if (search) {
                    const lowerSearch = search.toLowerCase();
                    filtered = filtered.filter(r => r.userName?.toLowerCase().includes(lowerSearch));
                }
                if (status && status !== 'all') {
                    filtered = filtered.filter(r => r.status === status);
                }
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }
    // Kết nối API thật
    const queryParams = new URLSearchParams(params as any).toString();
    return apiClient.get(`/monetization/refunds?${queryParams}`);
};

export const processRefund = (refundId: string, payload: ProcessRefundPayload): Promise<Refund> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const refundIndex = mockRefunds.findIndex(r => r.id === refundId);
                if (refundIndex === -1) return reject(new Error('Không tìm thấy yêu cầu hoàn tiền.'));
                
                const refund = mockRefunds[refundIndex];
                if (refund.status !== 'pending') return reject(new Error('Yêu cầu đã được xử lý.'));

                refund.processed_by_admin = payload.adminId;
                refund.processed_at = new Date().toISOString();
                refund.notes = payload.notes;

                if (payload.action === 'approve') {
                    refund.status = 'completed';
                    refund.refund_amount = payload.amount!;
                    refund.refund_method = payload.method!;
                    if (payload.method === 'gateway') {
                        refund.gateway_response = { success: true, refund_id: `GW_REF_${Date.now()}` };
                    }
                    // Update payment status
                    const payment = mockPayments.find(p => p.id === refund.payment_id);
                    if (payment) {
                        if (payload.amount === payment.amount) {
                            payment.status = 'refunded';
                        } else {
                            payment.status = 'partially-refunded';
                        }
                    }
                } else { // 'reject'
                    refund.status = 'rejected';
                }
                
                mockRefunds[refundIndex] = refund;
                resolve(enrichRefund(refund));
            }, 800);
        });
    }
    // Kết nối API thật
    return apiClient.put(`/monetization/refunds/${refundId}/process`, payload);
};