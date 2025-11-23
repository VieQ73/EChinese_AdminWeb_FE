import { apiClient } from '../../services/apiClient';
import type { AdminLog } from '../../types/system';

export async function fetchAdminLogs(): Promise<AdminLog[]> {
  const res = await apiClient.get('/admin/logs');
  
  // Envelope: { success, message, data }
  if (res && typeof res === 'object' && 'data' in res) {
    // Nếu res.data là mảng log
    if (Array.isArray(res.data)) return res.data as AdminLog[];
    // Nếu res.data là envelope
    const envelope = res.data as { data?: AdminLog[] };
    
    
    if (envelope.data && Array.isArray(envelope.data)) return envelope.data;
  }
  return [];
}
