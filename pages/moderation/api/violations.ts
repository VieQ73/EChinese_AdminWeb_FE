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

type ViolationsEnvelope = { success: boolean; data: PaginatedResponse<Violation> };

export const fetchViolations = (params: FetchViolationsParams): Promise<ViolationsEnvelope> => {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== 'all') as [string, string][]
    ).toString();
    const endpoint = query ? `/moderation/violations?${query}` : '/moderation/violations';
    return apiClient.get<ViolationsEnvelope>(endpoint);

    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, severity, targetType } = params;
                let filtered = mockViolations.map(v => enrichViolation(v));

                if (search) { /* filtering placeholder */ }
                if (severity && severity !== 'all') filtered = filtered.filter(v => v.severity === severity);
                if (targetType && targetType !== 'all') filtered = filtered.filter(v => v.target_type === targetType);

                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const pageData = filtered.slice((page - 1) * limit, page * limit);
                const payload: PaginatedResponse<Violation> = { data: pageData, meta: { total, page, limit, totalPages } };
                console.log( JSON.stringify({ success: true, data: payload }));
                
                resolve({ success: true, data: payload });
            }, 250);
        });
    }

    // Real API expected to already return the envelope shown in the sample provided.
    // Pass params as query string (GET bodies are non-standard).
    
};
