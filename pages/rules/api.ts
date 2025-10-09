
import { apiClient } from '../../services/apiClient';
import { CommunityRule, PaginatedResponse } from '../../types';
import { mockCommunityRules } from '../../mock/rules';
import { mockViolationRules } from '../../mock/moderation';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// COMMUNITY RULES API
// =============================

export type RulePayload = Omit<CommunityRule, 'id' | 'created_at' | 'updated_at'>;

interface FetchRulesParams {
    page?: number;
    limit?: number;
    search?: string;
    severity?: 'all' | 'low' | 'medium' | 'high';
    status?: 'all' | 'active' | 'inactive';
}

/**
 * Lấy danh sách quy tắc với filter và phân trang.
 */
export const fetchRules = (params: FetchRulesParams): Promise<PaginatedResponse<CommunityRule>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, severity, status } = params;
                let filtered = [...mockCommunityRules];

                if (search) {
                    filtered = filtered.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
                }
                if (severity && severity !== 'all') {
                    filtered = filtered.filter(r => r.severity_default === severity);
                }
                if (status && status !== 'all') {
                    filtered = filtered.filter(r => r.is_active === (status === 'active'));
                }
                
                filtered.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
                
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const data = filtered.slice((page - 1) * limit, page * limit);
                
                resolve({ data, meta: { total, page, limit, totalPages } });
            }, 400);
        });
    }
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/rules?${query}`);
};

/**
 * Tạo quy tắc mới.
 */
export const createRule = (payload: RulePayload): Promise<CommunityRule> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (mockCommunityRules.some(r => r.title.toLowerCase() === payload.title.toLowerCase())) {
                    return reject(new Error('Tiêu đề quy tắc đã tồn tại.'));
                }
                const newRule: CommunityRule = {
                    ...payload,
                    id: `rule-${Date.now()}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mockCommunityRules.unshift(newRule);
                resolve(newRule);
            }, 300);
        });
    }
    return apiClient.post('/rules', payload);
};

/**
 * Cập nhật quy tắc.
 */
export const updateRule = (id: string, payload: Partial<RulePayload>): Promise<CommunityRule> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockCommunityRules.findIndex(r => r.id === id);
                if (index === -1) return reject(new Error("Rule not found."));
                
                if (payload.title && mockCommunityRules.some(r => r.id !== id && r.title.toLowerCase() === payload.title!.toLowerCase())) {
                    return reject(new Error('Tiêu đề quy tắc đã tồn tại.'));
                }

                mockCommunityRules[index] = { ...mockCommunityRules[index], ...payload, updated_at: new Date().toISOString() };
                resolve(mockCommunityRules[index]);
            }, 300);
        });
    }
    return apiClient.put(`/rules/${id}`, payload);
};

/**
 * Xóa quy tắc.
 */
export const deleteRule = (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const isRuleInUse = mockViolationRules.some(vr => vr.rule_id === id);
                if (isRuleInUse) {
                    return reject(new Error('Không thể xóa quy tắc đang được sử dụng bởi các vi phạm. Vui lòng tắt quy tắc thay thế.'));
                }
                
                const index = mockCommunityRules.findIndex(r => r.id === id);
                if (index > -1) {
                    mockCommunityRules.splice(index, 1);
                    resolve({ success: true });
                } else {
                    reject(new Error("Rule not found."));
                }
            }, 400);
        });
    }
    return apiClient.delete(`/rules/${id}`);
};
