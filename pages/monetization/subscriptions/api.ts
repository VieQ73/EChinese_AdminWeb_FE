import { Subscription, PaginatedResponse } from "../../../types";
import { mockSubscriptions, mockUserSubscriptions } from "../../../mock";
import { apiClient } from '../../../services/apiClient';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// ===================================
// API CHO QUẢN LÝ GÓI ĐĂNG KÝ
// ===================================

export type SubscriptionPayload = Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;

interface FetchSubscriptionsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    sortBy?: 'price' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Lấy danh sách gói đăng ký với các tùy chọn lọc, sắp xếp, phân trang.
 */
export const fetchSubscriptions = (params: FetchSubscriptionsParams = {}): Promise<PaginatedResponse<Subscription>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 12, search, status, sortBy, sortOrder } = params;
                
                let filtered = [...mockSubscriptions];

                if (search) {
                    filtered = filtered.filter(sub => sub.name.toLowerCase().includes(search.toLowerCase()));
                }

                if (status && status !== 'all') {
                    filtered = filtered.filter(sub => sub.is_active === (status === 'active'));
                }

                if (sortBy) {
                    filtered.sort((a, b) => {
                        const aVal = a[sortBy];
                        const bVal = b[sortBy];
                        let comparison = 0;
                        if (aVal > bVal) comparison = 1;
                        else if (aVal < bVal) comparison = -1;
                        return sortOrder === 'desc' ? comparison * -1 : comparison;
                    });
                }

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
    return apiClient.get(`/monetization/subscriptions?${queryParams}`);
};

export const checkSubscriptionUsage = (subscriptionId: string): Promise<{ activeUsers: number }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const activeUsers = mockUserSubscriptions.filter(us => us.subscription_id === subscriptionId && us.is_active).length;
                resolve({ activeUsers });
            }, 300);
        });
    }
    // Kết nối API thật
    return apiClient.get(`/monetization/subscriptions/${subscriptionId}/usage`);
}

export const createSubscription = (payload: SubscriptionPayload): Promise<Subscription> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (mockSubscriptions.some(sub => sub.name.toLowerCase() === payload.name.toLowerCase())) {
                    reject(new Error('Tên gói đăng ký đã tồn tại.'));
                    return;
                }
                const newSubscription: Subscription = {
                    ...payload,
                    id: `sub_${Date.now()}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mockSubscriptions.unshift(newSubscription);
                resolve(newSubscription);
            }, 500);
        });
    }
    // Kết nối API thật
    return apiClient.post('/monetization/subscriptions', payload);
}

export const updateSubscription = (id: string, payload: Partial<SubscriptionPayload>): Promise<Subscription> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const subIndex = mockSubscriptions.findIndex(s => s.id === id);
                if (subIndex === -1) {
                    reject(new Error('Không tìm thấy gói đăng ký.'));
                    return;
                }
                if (payload.name && mockSubscriptions.some(sub => sub.id !== id && sub.name.toLowerCase() === payload.name!.toLowerCase())) {
                    reject(new Error('Tên gói đăng ký đã tồn tại.'));
                    return;
                }

                const updatedSub = { ...mockSubscriptions[subIndex], ...payload, updated_at: new Date().toISOString() };
                mockSubscriptions[subIndex] = updatedSub;
                resolve(updatedSub);
            }, 500);
        });
    }
    // Kết nối API thật
    return apiClient.put(`/monetization/subscriptions/${id}`, payload);
}

export const deleteSubscription = (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const usage = await checkSubscriptionUsage(id);
                if (usage.activeUsers > 0) {
                    reject(new Error('Không thể xóa gói đang có người dùng sử dụng.'));
                    return;
                }
                const subIndex = mockSubscriptions.findIndex(s => s.id === id);
                if (subIndex === -1) {
                    reject(new Error('Không tìm thấy gói đăng ký.'));
                    return;
                }
                mockSubscriptions.splice(subIndex, 1);
                resolve({ success: true });
            }, 500);
        });
    }
    // Kết nối API thật
    return apiClient.delete(`/monetization/subscriptions/${id}`);
};