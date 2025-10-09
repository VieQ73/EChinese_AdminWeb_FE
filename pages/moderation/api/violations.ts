import { apiClient } from '../../../services/apiClient';
import { Violation, PaginatedResponse } from '../../../types';
import { mockViolations, enrichViolation } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// VIOLATIONS API
// =============================

interface FetchViolationsParams {
    page?: number;
    limit?: number;
    search?: string;
    severity?: 'all' | 'low' | 'medium' | 'high';
    targetType?: 'all' | 'post' | 'comment' | 'user';
}

export const fetchViolations = (params: FetchViolationsParams): Promise<PaginatedResponse<Violation>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, severity, targetType } = params;
                let filtered = mockViolations.map(v => enrichViolation(v));

                if (search) { /* ... filtering logic ... */ }
                if (severity && severity !== 'all') { filtered = filtered.filter(v => v.severity === severity); }
                if (targetType && targetType !== 'all') { filtered = filtered.filter(v => v.target_type === targetType); }

                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 300);
        });
    }
    return apiClient.get('/moderation/violations', { body: params as any });
};
