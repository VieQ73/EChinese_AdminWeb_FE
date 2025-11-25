import { apiClient } from '../../../services/apiClient';
import { Notification } from '../../../types';
import { mockNotifications } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// NOTIFICATIONS API
// =============================

type NotificationsEnvelope = { success: boolean; data: Notification[] };

export const fetchNotifications = (): Promise<NotificationsEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(mockNotifications);
                
                resolve({ success: true, data: mockNotifications });
            });
        });
    }

    // Real API
    return apiClient.get<NotificationsEnvelope>('/notifications');
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
            });
        });
    }

    // Real API
    return apiClient.post<CreateNotificationEnvelope>('/notifications', payload);
};

type BasicSuccessEnvelope = { success: boolean; data: { ids: string[] } };

export const publishNotifications = (ids: string[]): Promise<BasicSuccessEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            const idsToPublish = new Set(ids);
             mockNotifications.forEach(n => {
                if(idsToPublish.has(n.id)) {
                    n.is_push_sent = true;
                }
            });
            console.log("publishNotifications "+JSON.stringify(ids));
            resolve({ success: true, data: { ids } });
        });
    }

    // Real API
    return apiClient.post<BasicSuccessEnvelope>('/notifications/publish', { ids });
};

export const deleteNotifications = (ids: string[]): Promise<BasicSuccessEnvelope> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            const idsToDelete = new Set(ids);
            const newMock = mockNotifications.filter(n => !idsToDelete.has(n.id));
            mockNotifications.length = 0;
            mockNotifications.push(...newMock);
            console.log("deleteNotifications "+JSON.stringify(ids));
            resolve({ success: true, data: { ids } });
        });
    }

    // Real API
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
            });
        });
    }

    // Real API
    return apiClient.post<BasicSuccessEnvelope>('/notifications/mark-read', { ids, asRead });
};
