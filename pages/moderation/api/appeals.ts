import { apiClient } from '../../../services/apiClient';
import { Appeal, PaginatedResponse, User } from '../../../types';
import { mockAppeals, enrichAppeal, mockViolations, mockPosts, mockComments, mockUsers } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// APPEALS API
// =============================

interface FetchAppealsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'pending' | 'accepted' | 'rejected';
}

type AppealsEnvelope = { success: boolean; data: PaginatedResponse<Appeal> };

export const fetchAppeals = (params: FetchAppealsParams): Promise<AppealsEnvelope> => {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== 'all') as [string, string][]
    ).toString();
    const endpoint = query ? `/moderation/appeals?${query}` : '/moderation/appeals';
    return apiClient.get<AppealsEnvelope>(endpoint);

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, status } = params;
                let filtered = mockAppeals.map(a => enrichAppeal(a));

                if (search) { /* filtering placeholder */ }
                if (status && status !== 'all') { filtered = filtered.filter(a => a.status === status); }

                filtered.sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                const payload: PaginatedResponse<Appeal> = { data, meta: { total, page, limit, totalPages } };
                resolve({ success: true, data: payload });
            }, 300);
        });
    }
    
};

interface ProcessAppealPayload {
    action: 'accepted' | 'rejected';
    adminId: string;
    notes: string;
}

type ProcessAppealEnvelope = { success: boolean; data: Appeal };

export const processAppeal = (appealId: string, payload: ProcessAppealPayload): Promise<ProcessAppealEnvelope> => {
        return apiClient.put<ProcessAppealEnvelope>(`/moderation/appeals/${appealId}/process`, payload);

    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const appealIndex = mockAppeals.findIndex(a => a.id === appealId);
                if (appealIndex === -1) return reject(new Error('Appeal not found'));

                const appeal = mockAppeals[appealIndex];
                if (appeal.status !== 'pending') return reject(new Error('Appeal already processed'));

                appeal.status = payload.action === 'accepted' ? 'accepted' : 'rejected';
                appeal.resolved_by = payload.adminId;
                appeal.resolved_at = new Date().toISOString();
                appeal.notes = payload.notes;

                if (payload.action === 'accepted') {
                    const violationIndex = mockViolations.findIndex(v => v.id === appeal.violation_id);
                    if (violationIndex !== -1) {
                        const violation = mockViolations[violationIndex];
                        appeal.violation_snapshot = enrichAppeal(appeal).violation;

                        if (violation.target_type === 'post') {
                            const post = mockPosts.find(p => p.id === violation.target_id);
                            if (post) post.status = 'published';
                        } else if (violation.target_type === 'comment') {
                            const comment = mockComments.find(c => c.id === violation.target_id);
                            if (comment) comment.deleted_at = null;
                        } else if (violation.target_type === 'user') {
                            const user = mockUsers.find(u => u.id === violation.target_id);
                            if (user) user.is_active = true;
                        }
                        mockViolations.splice(violationIndex, 1);
                    }
                }

                resolve({ success: true, data: enrichAppeal(appeal) });
            }, 500);
        });
    }
};
