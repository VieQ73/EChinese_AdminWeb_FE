// contexts/appData/actions/monetizationActions.ts
import { useCallback, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { Subscription, Payment, Refund, EnrichedUserSubscription } from '../../../types';
import * as api from '../../../pages/monetization/api';
import type { AddAdminLogPayload } from '../types';

interface UseMonetizationActionsProps {
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setRefunds: React.Dispatch<React.SetStateAction<Refund[]>>;
  setUserSubscriptions: React.Dispatch<React.SetStateAction<EnrichedUserSubscription[]>>;
  addAdminLog: (payload: AddAdminLogPayload) => void;
}

export const useMonetizationActions = ({
  setSubscriptions,
  setPayments,
  setRefunds,
  setUserSubscriptions,
  addAdminLog,
}: UseMonetizationActionsProps) => {
  const { user: currentUser } = useContext(AuthContext)!;

  // --- Subscriptions ---
  const createSubscription = useCallback(async (payload: api.SubscriptionPayload) => {
    const newSub = await api.createSubscription(payload);
    setSubscriptions(prev => [newSub, ...prev]);
    addAdminLog({ action_type: 'CREATE_SUBSCRIPTION', target_id: newSub.id, description: `Tạo gói đăng ký mới: ${newSub.name}` });
  }, [setSubscriptions, addAdminLog]);

  const updateSubscription = useCallback(async (id: string, payload: Partial<api.SubscriptionPayload>) => {
    const updated = await api.updateSubscription(id, payload);
    setSubscriptions(prev => prev.map(s => s.id === id ? updated : s));
    addAdminLog({ action_type: 'UPDATE_SUBSCRIPTION', target_id: id, description: `Cập nhật gói đăng ký: ${updated.name}` });
  }, [setSubscriptions, addAdminLog]);
  
  const deleteSubscription = useCallback(async (id: string) => {
    const subToDelete = (await api.fetchSubscriptions()).data.find(s => s.id === id);
    await api.deleteSubscription(id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    if (subToDelete) {
        addAdminLog({ action_type: 'DELETE_SUBSCRIPTION', target_id: id, description: `Xóa gói đăng ký: ${subToDelete.name}` });
    }
  }, [setSubscriptions, addAdminLog]);
  
  // --- Payments ---
  const updatePaymentStatus = useCallback(async (id: string, status: 'manual_confirmed' | 'failed') => {
    const updated = await api.updatePaymentStatus(id, status, currentUser.id);
    setPayments(prev => prev.map(p => p.id === id ? updated : p));
    addAdminLog({ action_type: 'UPDATE_PAYMENT_STATUS', target_id: id, description: `Cập nhật trạng thái giao dịch thành: ${status}` });
  }, [setPayments, addAdminLog, currentUser]);

  const bulkUpdatePaymentStatus = useCallback(async (ids: string[], status: 'manual_confirmed') => {
      await api.bulkUpdatePaymentStatus(ids, status, currentUser.id);
      setPayments(prev => prev.map(p => ids.includes(p.id) ? { ...p, status, processed_by_admin: currentUser.id } : p));
      addAdminLog({ action_type: 'BULK_UPDATE_PAYMENT_STATUS', description: `Xác nhận hàng loạt ${ids.length} giao dịch.` });
  }, [setPayments, addAdminLog, currentUser]);

  // --- Refunds ---
  const processRefund = useCallback(async (id: string, payload: Omit<api.ProcessRefundPayload, 'adminId'>) => {
      const updated = await api.processRefund(id, { ...payload, adminId: currentUser.id });
      setRefunds(prev => prev.map(r => r.id === id ? updated : r));
      addAdminLog({ action_type: 'PROCESS_REFUND', target_id: id, description: `Xử lý hoàn tiền: ${payload.action}` });
  }, [setRefunds, addAdminLog, currentUser]);
  
  // --- User Subscriptions ---
  const updateUserSubscriptionDetails = useCallback(async (id: string, payload: api.UpdateUserSubscriptionDetailsPayload) => {
    await api.updateUserSubscriptionDetails(id, payload);
    // Tải lại toàn bộ danh sách để đảm bảo dữ liệu nhất quán
    const response = await api.fetchEnrichedUserSubscriptions({ limit: 999 });
    setUserSubscriptions(response.data);
    addAdminLog({ action_type: 'UPDATE_USER_SUBSCRIPTION', target_id: id, description: `Cập nhật chi tiết gói của người dùng. Hành động: ${payload.action}` });
  }, [setUserSubscriptions, addAdminLog]);


  return {
    createSubscription,
    updateSubscription,
    deleteSubscription,
    updatePaymentStatus,
    bulkUpdatePaymentStatus,
    processRefund,
    updateUserSubscriptionDetails,
  };
};