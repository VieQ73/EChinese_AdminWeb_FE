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

export const fetchEnrichedUserSubscriptions = (params: FetchEnrichedUserSubscriptionsParams): Promise<PaginatedResponse<EnrichedUserSubscription>> => {
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
    // Kết nối API thật
    const queryParams = new URLSearchParams(params as any).toString();
    return apiClient.get(`/monetization/user-subscriptions?${queryParams}`);
};

export type UpdateUserSubscriptionDetailsPayload = 
    | { action: 'change_expiry'; new_expiry_date: string }
    | { action: 'toggle_renew'; auto_renew: boolean }
    | { action: 'cancel_now' }
    | { action: 'change_plan'; new_subscription_id: string; change_type: 'immediate' | 'end_of_term' };

export const updateUserSubscriptionDetails = (userSubId: string, payload: UpdateUserSubscriptionDetailsPayload): Promise<any> => {
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
    // Kết nối API thật
    return apiClient.put(`/monetization/user-subscriptions/${userSubId}`, payload);
};


export const fetchUserSubscriptionHistory = (userId: string): Promise<UserSubscriptionHistoryItem[]> => {
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
    // Kết nối API thật
    return apiClient.get(`/monetization/user-subscriptions/history/${userId}`);
};