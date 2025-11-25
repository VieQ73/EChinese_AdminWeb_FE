import { EnrichedUserSubscription, UserSubscriptionHistoryItem, PaginatedResponse, Subscription } from "../../../types";
import { mockUsers, mockSubscriptions, mockUserSubscriptions, mockUserUsage } from "../../../mock";
import { apiClient } from '../../../services/apiClient';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// ==========================================
// API CHO QUẢN LÝ GÓI CỦA NGƯỜI DÙNG
// ==========================================

interface FetchEnrichedUserSubscriptionsParams {
    page?: number;
    limit?: number;
    search?: string; // by user name, email, id
}

export const fetchEnrichedUserSubscriptions = async (params: FetchEnrichedUserSubscriptionsParams): Promise<PaginatedResponse<EnrichedUserSubscription>> => {
        // Kết nối API thật
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any>(`/monetization/user-subscriptions?${queryParams}`);

    // API trả về { success, data: PaginatedResponse<EnrichedUserSubscription> }
    return (response as any).data as PaginatedResponse<EnrichedUserSubscription>;

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 12, search } = params;
                const freeSub = mockSubscriptions.find(s => s.id === 'sub_free')!;

                let enrichedData: EnrichedUserSubscription[] = mockUsers
                    .filter(u => u.role === 'user') // Chỉ lấy user thường
                    .map(user => {
                        const activeSub = mockUserSubscriptions.find(us => us.user_id === user.id && us.is_active);
                        const subscription = activeSub ? mockSubscriptions.find(s => s.id === activeSub.subscription_id) : freeSub;

                        return {
                            user: { id: user.id, name: user.name, email: user.email!, avatar_url: user.avatar_url! },
                            userSubscription: activeSub,
                            subscription: subscription || freeSub,
                            quotas: {
                                ai_lesson: mockUserUsage.find(u => u.user_id === user.id && u.feature === 'ai_lesson')!,
                                ai_translate: mockUserUsage.find(u => u.user_id === user.id && u.feature === 'ai_translate')!,
                            }
                        };
                    });

                if (search) {
                    const lowerSearch = search.toLowerCase();
                    enrichedData = enrichedData.filter(item =>
                        item.user.name.toLowerCase().includes(lowerSearch) ||
                        item.user.email?.toLowerCase().includes(lowerSearch) ||
                        item.user.id.toLowerCase().includes(lowerSearch)
                    );
                }
                
                enrichedData.sort((a,b) => (b.userSubscription?.created_at || '0').localeCompare(a.userSubscription?.created_at || '0'));

                const total = enrichedData.length;
                const totalPages = Math.ceil(total / limit);
                const data = enrichedData.slice((page - 1) * limit, page * limit);

                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 500);
        });
    }

};

export type UpdateUserSubscriptionDetailsPayload = 
    | { action: 'change_expiry'; new_expiry_date: string }
    | { action: 'toggle_renew'; auto_renew: boolean }
    | { action: 'cancel_now' }
    | { action: 'change_plan'; new_subscription_id: string; change_type: 'immediate' | 'end_of_term' };

export const updateUserSubscriptionDetails = async (userSubId: string, payload: UpdateUserSubscriptionDetailsPayload): Promise<any> => {
    
    // Kết nối API thật
    const response = await apiClient.put<any>(`/monetization/user-subscriptions/${userSubId}`, payload);
    // API trả về { success, message, data: result }
    console.log(payload);
    
    return (response as any).data;

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const subIndex = mockUserSubscriptions.findIndex(s => s.id === userSubId);
                if(subIndex === -1) return reject(new Error("Không tìm thấy gói của người dùng."));

                const sub = mockUserSubscriptions[subIndex];
                switch(payload.action) {
                    case 'change_expiry':
                        sub.expiry_date = payload.new_expiry_date;
                        break;
                    case 'toggle_renew':
                        sub.auto_renew = payload.auto_renew;
                        break;
                    case 'cancel_now':
                        sub.is_active = false;
                        sub.auto_renew = false;
                        sub.expiry_date = new Date().toISOString();
                        break;
                    case 'change_plan':
                        if (payload.change_type === 'immediate') {
                            sub.subscription_id = payload.new_subscription_id;
                            // Logic tính lại ngày hết hạn hoặc prorate có thể được thêm ở đây
                        }
                        // Logic cho 'end_of_term' sẽ phức tạp hơn, cần hệ thống cron job
                        break;
                }
                sub.updated_at = new Date().toISOString();
                mockUserSubscriptions[subIndex] = sub;
                resolve({ success: true });
            }, 500);
        });
    }
    
};


export const fetchUserSubscriptionHistory = async (userId: string): Promise<UserSubscriptionHistoryItem[]> => {
    // Kết nối API thật
    const response = await apiClient.get<any>(`/monetization/user-subscriptions/history/${userId}`);
    // API trả về { success: true, data: history }
    return (response as any).data as UserSubscriptionHistoryItem[];

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const history = mockUserSubscriptions
                    .filter(us => us.user_id === userId)
                    .map(us => ({
                        ...us,
                        subscriptionName: mockSubscriptions.find(s => s.id === us.subscription_id)?.name || 'Không rõ'
                    }))
                    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
                resolve(history);
            }, 300);
        });
    }
    
};

/**
 * Reset usage cho người dùng theo các tính năng chỉ định.
 * Gọi API thật: POST /admin/usage/reset với body { userId, features }
 * Trả về đối tượng { success, message } theo chuẩn backend.
 */
export const resetUserUsage = async (
    userId: string,
    features: Array<'ai_lesson' | 'ai_translate'>
): Promise<{ success: boolean; message?: string }> => {

        // Kết nối API thật
    const response = await apiClient.post<any>('/admin/usage/reset', { userId, features });
    // Backend trả về ít nhất { success, ... }
    return response as { success: boolean; message?: string };
    
    if (USE_MOCK_API) {
        // Mô phỏng reset: đưa daily_count về 0 và cập nhật last_reset
        const now = new Date().toISOString();
        features.forEach((feature) => {
            const usage = mockUserUsage.find(u => u.user_id === userId && u.feature === feature);
            if (usage) {
                usage.daily_count = 0;
                usage.last_reset = now as any;
            }
        });
        return Promise.resolve({ success: true, message: 'Đã reset usage (mock).' });
    }


};
