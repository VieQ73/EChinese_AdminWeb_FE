import { apiClient } from '../../../services/apiClient';
import { Notification } from '../../../types';
import { mockNotifications } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// NOTIFICATIONS API
// =============================

type NotificationsEnvelope = { 
    success: boolean; 
    data: Notification[]; 
    meta: { total: number; page: number; limit: number; totalPages: number } 
};

export const fetchNotifications = (): Promise<NotificationsEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Mock notifications:', mockNotifications);
                resolve({ 
                    success: true, 
                    data: mockNotifications,
                    meta: { total: mockNotifications.length, page: 1, limit: 999, totalPages: 1 }
                });
            }, 300);
        });
    }
    return apiClient.get<NotificationsEnvelope>('/notifications');
};

// Lấy danh sách thông báo đã nhận của admin
export const fetchReceivedNotifications = (params?: { 
    page?: number; 
    limit?: number; 
    read_status?: 'read' | 'unread';
    type?: string;
}): Promise<NotificationsEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 15 } = params || {};
                let received = mockNotifications.filter(n => n.from_system || n.audience === 'admin');
                
                // Lọc theo read_status nếu có
                if (params?.read_status === 'unread') {
                    received = received.filter(n => !n.read_at);
                } else if (params?.read_status === 'read') {
                    received = received.filter(n => n.read_at);
                }
                
                // Lọc theo type nếu có
                if (params?.type) {
                    received = received.filter(n => n.type === params.type);
                }
                
                const total = received.length;
                const totalPages = Math.ceil(total / limit);
                const paginatedData = received.slice((page - 1) * limit, page * limit);
                
                console.log('Mock received notifications:', paginatedData);
                resolve({ 
                    success: true, 
                    data: paginatedData,
                    meta: { total, page, limit, totalPages }
                });
            }, 300);
        });
    }
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.read_status) queryParams.append('read_status', params.read_status);
    if (params?.type) queryParams.append('type', params.type);
    return apiClient.get<NotificationsEnvelope>(`/admin/notifications/received?${queryParams.toString()}`);
};

// Lấy danh sách thông báo đã gửi của admin
export const fetchSentNotifications = (params?: { 
    page?: number; 
    limit?: number;
    status?: 'draft' | 'published';
    audience?: string;
    type?: string;
}): Promise<NotificationsEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 15 } = params || {};
                let sent = mockNotifications.filter(n => !n.from_system);
                
                // Lọc theo status nếu có
                if (params?.status === 'draft') {
                    sent = sent.filter(n => !n.is_push_sent);
                } else if (params?.status === 'published') {
                    sent = sent.filter(n => n.is_push_sent);
                }
                
                // Lọc theo audience nếu có
                if (params?.audience && params.audience !== 'all_audience') {
                    sent = sent.filter(n => n.audience === params.audience);
                }
                
                // Lọc theo type nếu có
                if (params?.type) {
                    sent = sent.filter(n => n.type === params.type);
                }
                
                const total = sent.length;
                const totalPages = Math.ceil(total / limit);
                const paginatedData = sent.slice((page - 1) * limit, page * limit);
                
                console.log('Mock sent notifications:', paginatedData);
                resolve({ 
                    success: true, 
                    data: paginatedData,
                    meta: { total, page, limit, totalPages }
                });
            }, 300);
        });
    }
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.audience) queryParams.append('audience', params.audience);
    if (params?.type) queryParams.append('type', params.type);
    return apiClient.get<NotificationsEnvelope>(`/admin/notifications/sent?${queryParams.toString()}`);
};

type CreateNotificationEnvelope = { success: boolean; data: Notification };

export const createNotification = (payload: Omit<Notification, 'id' | 'created_at'>): Promise<CreateNotificationEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newNotif: Notification = {
                    ...payload,
                    id: `notif_${Date.now()}`,
                    created_at: new Date().toISOString(),
                };
                mockNotifications.unshift(newNotif);
                console.log("createNotification "+JSON.stringify(newNotif));
                resolve({ success: true, data: newNotif });
            }, 300);
        });
    }
    console.log(payload);
    
    return apiClient.post<CreateNotificationEnvelope>('/notifications', payload);
};

type BasicSuccessEnvelope = { success: boolean; data: { ids: string[] } };

export const publishNotifications = (ids: string[]): Promise<BasicSuccessEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToPublish = new Set(ids);
                 mockNotifications.forEach(n => {
                    if(idsToPublish.has(n.id)) {
                        n.is_push_sent = true;
                    }
                });
                console.log("publishNotifications "+JSON.stringify(ids));
                resolve({ success: true, data: { ids } });
            }, 400);
        });
    }
    return apiClient.post<BasicSuccessEnvelope>('/notifications/publish', { ids });
};

export const revokeNotifications = (ids: string[]): Promise<{ success: boolean; message?: string; data?: { revokedCount: number } }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToRevoke = new Set(ids);
                let revokedCount = 0;
                mockNotifications.forEach(n => {
                    if(idsToRevoke.has(n.id)) {
                        n.is_push_sent = false;
                        revokedCount++;
                    }
                });
                console.log("revokeNotifications "+JSON.stringify(ids));
                resolve({ success: true, message: `Đã thu hồi ${revokedCount} thông báo`, data: { revokedCount } });
            }, 400);
        });
    }
    return apiClient.post<{ success: boolean; message?: string; data?: { revokedCount: number } }>('/notifications/revoke', { ids });
};

export const deleteNotifications = (ids: string[]): Promise<BasicSuccessEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToDelete = new Set(ids);
                const newMock = mockNotifications.filter(n => !idsToDelete.has(n.id));
                mockNotifications.length = 0;
                mockNotifications.push(...newMock);
                console.log("deleteNotifications "+JSON.stringify(ids));
                resolve({ success: true, data: { ids } });
            }, 400);
        });
    }
    return apiClient.post<BasicSuccessEnvelope>('/notifications/delete', { ids });
};

export const markNotificationsAsRead = (ids: string[], asRead: boolean): Promise<BasicSuccessEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToMark = new Set(ids);
                mockNotifications.forEach(n => {
                    if(idsToMark.has(n.id)) {
                        n.read_at = asRead ? new Date().toISOString() : null;
                    }
                });
                console.log("markNotificationsAsRead "+JSON.stringify({ ids, asRead }));
                resolve({ success: true, data: { ids } });
            }, 100);
        });
    }
    return apiClient.post<BasicSuccessEnvelope>('/notifications/mark-read', { ids, asRead });
};
