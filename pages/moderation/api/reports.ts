import { apiClient } from '../../../services/apiClient';
import { Report, PaginatedResponse, Violation } from '../../../types';
import { mockReports, enrichReport, mockViolations, mockViolationRules } from '../../../mock';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// =============================
// REPORTS API
// =============================

interface FetchReportsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'pending' | 'in_progress' | 'resolved' | 'dismissed';
    targetType?: 'all' | 'post' | 'comment' | 'user' | 'bug' | 'other';
}

export const fetchReports = (params: FetchReportsParams): Promise<PaginatedResponse<Report>> => {
    if (USE_MOCK_API) {
        return new Promise(resolve => {
            setTimeout(() => {
                const { page = 1, limit = 10, search, status, targetType } = params;
                let filtered = mockReports.map(enrichReport);

                if (search) { /* ... filtering logic ... */ }
                if (status && status !== 'all') { filtered = filtered.filter(r => r.status === status); }
                if (targetType && targetType !== 'all') { filtered = filtered.filter(r => r.target_type === targetType); }

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
    return apiClient.get('/moderation/reports', { body: params as any });
};

interface UpdateReportStatusPayload {
    status: 'in_progress' | 'resolved' | 'dismissed';
    adminId: string;
    resolution?: string;
    severity?: Violation['severity'];
}

export const updateReportStatus = (reportId: string, payload: UpdateReportStatusPayload): Promise<Report> => {
    if (USE_MOCK_API) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const reportIndex = mockReports.findIndex(r => r.id === reportId);
                if (reportIndex === -1) return reject(new Error('Report not found'));

                const report = mockReports[reportIndex];
                report.status = payload.status;
                report.updated_at = new Date().toISOString();

                if (payload.status === 'resolved' || payload.status === 'dismissed') {
                    report.resolved_by = payload.adminId;
                    report.resolved_at = new Date().toISOString();
                    report.resolution = payload.resolution;
                }
                
                // If resolved, create a violation record
                if (payload.status === 'resolved' && payload.severity) {
                    const newViolationId = `v-from-r${report.id}`;
                    report.related_violation_id = newViolationId;

                    const newViolation: Omit<Violation, 'rules' | 'user' | 'targetContent'> = {
                        id: newViolationId,
                        user_id: (report.targetContent as any).user_id || report.target_id, // Fallback for user reports
                        target_type: report.target_type as any,
                        target_id: report.target_id,
                        severity: payload.severity,
                        detected_by: 'admin',
                        handled: true,
                        created_at: new Date().toISOString(),
                        resolved_at: new Date().toISOString(),
                        resolution: payload.resolution
                    };
                    mockViolations.push(newViolation);
                    // Giả lập liên kết rule. Trong thực tế, ruleIds sẽ được gửi lên.
                    mockViolationRules.push({id: `vr-${newViolationId}`, violation_id: newViolationId, rule_id: 'rule-03'});
                }

                resolve(enrichReport(report));
            }, 400);
        });
    }
    return apiClient.put(`/moderation/reports/${reportId}/status`, payload);
};
