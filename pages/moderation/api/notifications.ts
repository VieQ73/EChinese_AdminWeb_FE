import { apiClient } from '../../../services/apiClient';
import { Notification } from '../../../types';
import { mockNotifications } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// NOTIFICATIONS API
// =============================

export const fetchNotifications = (): Promise<Notification[]> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockNotifications);
            }, 300);
        });
    }
    return apiClient.get('/notifications');
};

export const createNotification = (payload: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newNotif: Notification = {
                    ...payload,
                    id: `notif_${Date.now()}`,
                    created_at: new Date().toISOString(),
                };
                mockNotifications.unshift(newNotif);
                resolve(newNotif);
            }, 300);
        });
    }
    return apiClient.post('/notifications', payload);
};

export const publishNotifications = (ids: string[]): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToPublish = new Set(ids);
                 mockNotifications.forEach(n => {
                    if(idsToPublish.has(n.id)) {
                        n.is_push_sent = true;
                    }
                });
                resolve({ success: true });
            }, 400);
        });
    }
    return apiClient.post('/notifications/publish', { ids });
};

export const deleteNotifications = (ids: string[]): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToDelete = new Set(ids);
                const newMock = mockNotifications.filter(n => !idsToDelete.has(n.id));
                mockNotifications.length = 0;
                mockNotifications.push(...newMock);
                resolve({ success: true });
            }, 400);
        });
    }
    return apiClient.post('/notifications/delete', { ids });
};

export const markNotificationsAsRead = (ids: string[], asRead: boolean): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const idsToMark = new Set(ids);
                mockNotifications.forEach(n => {
                    if(idsToMark.has(n.id)) {
                        n.read_at = asRead ? new Date().toISOString() : null;
                    }
                });
                resolve({ success: true });
            }, 100);
        });
    }
    return apiClient.post('/notifications/mark-read', { ids, asRead });
};
