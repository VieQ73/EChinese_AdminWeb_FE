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

export const fetchAppeals = (params: FetchAppealsParams): Promise<PaginatedResponse<Appeal>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, status } = params;
                let filtered = mockAppeals.map(a => enrichAppeal(a));

                if (search) { /* ... filtering logic ... */ }
                if (status && status !== 'all') { filtered = filtered.filter(a => a.status === status); }

                filtered.sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 300);
        });
    }
    return apiClient.get('/moderation/appeals', { body: params as any });
};

interface ProcessAppealPayload {
    action: 'accepted' | 'rejected';
    adminId: string;
    notes: string;
}

export const processAppeal = (appealId: string, payload: ProcessAppealPayload): Promise<Appeal> => {
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

                // Logic if appeal is accepted
                if (payload.action === 'accepted') {
                    const violationIndex = mockViolations.findIndex(v => v.id === appeal.violation_id);
                    if (violationIndex !== -1) {
                        const violation = mockViolations[violationIndex];
                        appeal.violation_snapshot = enrichAppeal(appeal).violation; // snapshot before removing
                        
                        // Restore content
                        if(violation.target_type === 'post') {
                            const post = mockPosts.find(p => p.id === violation.target_id);
                            if (post) post.status = 'published';
                        } else if(violation.target_type === 'comment') {
                            const comment = mockComments.find(c => c.id === violation.target_id);
                            if(comment) comment.deleted_at = null;
                        } else if(violation.target_type === 'user') {
                            const user = mockUsers.find(u => u.id === violation.target_id);
                            if(user) user.is_active = true;
                        }
                        
                        // Remove violation
                        mockViolations.splice(violationIndex, 1);
                    }
                }
                
                resolve(enrichAppeal(appeal));
            }, 500);
        });
     }
     return apiClient.put(`/moderation/appeals/${appealId}/process`, payload);
};
