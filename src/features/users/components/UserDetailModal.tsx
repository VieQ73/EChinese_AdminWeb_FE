/* eslint-disable no-empty */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import Input from '../../../components/ui/Input';
import { Button } from '../../../components/ui/button';
import type { User, Subscription, Timestamp, UserUsage, BadgeLevel } from '../../../types/entities';
import { updateUser, fetchUserById } from '../userApi';
import { fetchAllSubscriptions } from '../../subscriptions/subscriptionApi';
import { fetchAllBadgeLevels } from '../../badges/badgeApi';
import { Loader2, Save, User as UserIcon, Shield, Crown } from 'lucide-react';
import type { AuthenticatedUser } from '../../../App';

interface UserDetail extends User {
  usage?: UserUsage[];
  subscription_details?: Subscription;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: (refreshNeeded?: boolean) => void;
  user: User | null;
  mode: 'view' | 'edit';
  currentUser: AuthenticatedUser | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user, mode, currentUser }) => {
  const [editingUser, setEditingUser] = useState<Partial<UserDetail> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [badgeLevels, setBadgeLevels] = useState<BadgeLevel[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isViewMode = mode === 'view';
  const isSelf = currentUser?.id === user?.id;
  const isSuperAdmin = currentUser?.role === 'super admin';
  const isAdmin = currentUser?.role === 'admin';

  // Quyền chỉnh sửa role
  const canEditRoleField = (): boolean => {
    if (!isSuperAdmin) return false;
    if (user?.role === 'super admin' && !isSelf) return false;
    return true;
  };

  // Quyền chỉnh sửa thông tin chung
  const canEditInfoFields = (): boolean => {
    if (!currentUser) return false;
    if (user?.role === 'super admin' && !isSelf) return false;
    return isSuperAdmin || (isAdmin && user?.role === 'user');
  };

  // Chặn SuperAdmin tự hạ cấp vai trò của mình
  const isSuperAdminAttemptingToDemoteSelf = (): boolean => {
    return isSuperAdmin && isSelf && editingUser?.role !== 'super admin';
  };

  // Load dữ liệu chi tiết user và dropdown
  useEffect(() => {
    if (isOpen && user?.id) {
      setFetchLoading(true);
      setError(null);
      setSuccessMessage(null);

      const loadUserDetails = async () => {
        try {
          const response = await fetchUserById(user.id);
          setEditingUser(response);
        } catch (err: any) {
          setError(err.message || 'Không thể tải chi tiết người dùng.');
          setEditingUser(null);
        } finally {
          setFetchLoading(false);
        }
      };

      const loadDropdownData = async () => {
        try {
          const [subs, badges] = await Promise.all([
            fetchAllSubscriptions(),
            fetchAllBadgeLevels(),
          ]);
          setSubscriptions(subs);
          setBadgeLevels(badges);
        } catch {}
      };

      loadUserDetails();
      loadDropdownData();
    } else if (isOpen && !user) {
      onClose(false);
    }
  }, [isOpen, user, onClose]);

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    if (editingUser) {
      let newValue: any = value;
      if (type === 'checkbox') newValue = checked;
      else if (id === 'badge_level' || id === 'community_points') newValue = parseInt(value);
      else if (id === 'subscription_expiry') newValue = value ? new Date(value).toISOString() : undefined;

      if (id === 'role' && !canEditRoleField()) return;
      if (id !== 'role' && !canEditInfoFields()) return;

      setEditingUser(prev => ({ ...prev, [id]: newValue } as Partial<UserDetail>));
    }
  };

  // Handle thay đổi subscription
  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEditInfoFields()) return;
    if (editingUser) {
      const subId = e.target.value === '' ? undefined : e.target.value;
      const selectedSub = subscriptions.find(s => s.id === subId);
      setEditingUser(prev => ({
        ...prev,
        subscription_id: subId,
        subscription_expiry: selectedSub?.duration_months != null
          ? new Date(Date.now() + selectedSub.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      } as Partial<UserDetail>));
    }
  };

  // Submit lưu thay đổi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !user?.id) return;
    if (!canEditInfoFields() && !canEditRoleField()) {
      setError('Bạn không có quyền để lưu thay đổi này.');
      return;
    }
    if (isSuperAdminAttemptingToDemoteSelf()) {
      setError('Super Admin không thể tự hạ cấp vai trò của mình.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payloadToUpdate: Partial<User> = {
        name: editingUser.name,
        email: editingUser.email,
        is_active: editingUser.is_active,
        role: editingUser.role,
        badge_level: editingUser.badge_level,
        subscription_id: editingUser.subscription_id,
        subscription_expiry: editingUser.subscription_expiry,
      };
      if (!canEditRoleField()) delete payloadToUpdate.role;
      if (!canEditInfoFields()) {
        delete payloadToUpdate.name;
        delete payloadToUpdate.email;
        delete payloadToUpdate.is_active;
        delete payloadToUpdate.badge_level;
        delete payloadToUpdate.subscription_id;
        delete payloadToUpdate.subscription_expiry;
      }
      delete payloadToUpdate.username;
      await updateUser(user.id, payloadToUpdate);
      setSuccessMessage('Cập nhật thông tin người dùng thành công!');
      setTimeout(() => onClose(true), 1500);
    } catch (err: any) {
      setError(err.message || 'Không thể lưu thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  // Format date cho input datetime-local
  const formatDateForInput = (isoString?: Timestamp | null) =>
    isoString ? new Date(isoString).toISOString().slice(0, 16) : '';

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <UserIcon className="w-6 h-6 text-teal-600" />
            {mode === 'view' ? `Chi tiết Người dùng` : `Chỉnh sửa Người dùng`}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            {mode === 'view'
              ? 'Xem thông tin chi tiết của người dùng.'
              : 'Cập nhật thông tin chi tiết của người dùng này.'}
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {fetchLoading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="mt-2 text-gray-600">Đang tải chi tiết người dùng...</p>
          </div>
        ) : error && !successMessage ? (
          // Hiển thị lỗi
          <div className="mx-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong className="font-semibold">Lỗi:</strong>
            <span className="ml-2">{error}</span>
          </div>
        ) : successMessage ? (
          // Hiển thị thành công
          <div className="mx-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <strong className="font-semibold">Thành công:</strong>
            <span className="ml-2">{successMessage}</span>
          </div>
        ) : editingUser && (
          // Form chính
          <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
            
            {/* Thông tin cá nhân */}
            <section className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-teal-600" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  id="name" 
                  label="Tên đầy đủ" 
                  value={editingUser.name || ''} 
                  onChange={handleChange} 
                  disabled={isViewMode || !canEditInfoFields()} 
                />
                <Input 
                  id="username" 
                  label="Username" 
                  value={editingUser.username || ''} 
                  disabled 
                />
                <div className="md:col-span-2">
                  <Input 
                    id="email" 
                    label="Email" 
                    type="email" 
                    value={editingUser.email || ''} 
                    onChange={handleChange} 
                    disabled={isViewMode || !canEditInfoFields()} 
                  />
                </div>
              </div>
            </section>

            {/* Quyền & Trạng thái */}
            <section className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Quyền & Trạng thái
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-gray-700">Vai trò</label>
                  <select 
                    id="role" 
                    value={editingUser.role} 
                    onChange={handleChange} 
                    disabled={isViewMode || !canEditRoleField() || isSuperAdminAttemptingToDemoteSelf()} 
                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="user">Người dùng</option>
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 h-[42px]">
                  <input 
                    id="is_active" 
                    type="checkbox" 
                    checked={!!editingUser.is_active} 
                    onChange={handleChange} 
                    disabled={isViewMode || !canEditInfoFields() || user?.role === 'super admin'} 
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50" 
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Tài khoản hoạt động</label>
                </div>
              </div>
            </section>

            {/* Thành tích & Gói */}
            <section className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Thành tích & Gói
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  id="community_points" 
                  label="Điểm cộng đồng" 
                  type="number" 
                  value={editingUser.community_points?.toString() || '0'} 
                  onChange={handleChange} 
                  disabled={isViewMode || !canEditInfoFields()} 
                />
                <div className="space-y-2">
                  <label htmlFor="badge_level" className="text-sm font-medium text-gray-700">Cấp độ huy hiệu</label>
                  <select 
                    id="badge_level" 
                    value={editingUser.badge_level} 
                    onChange={handleChange} 
                    disabled={isViewMode || !canEditInfoFields()} 
                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                  >
                    {badgeLevels.map(b => (
                      <option key={b.level} value={b.level}>{b.name} (Level {b.level})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subscription_id" className="text-sm font-medium text-gray-700">Gói đăng ký</label>
                  <select 
                    id="subscription_id" 
                    value={editingUser.subscription_id || ''} 
                    onChange={handleSubscriptionChange} 
                    disabled={isViewMode || !canEditInfoFields()} 
                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Không có gói</option>
                    {subscriptions.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                {editingUser.subscription_id && (
                  <Input 
                    id="subscription_expiry" 
                    label="Ngày hết hạn gói" 
                    type="datetime-local" 
                    value={formatDateForInput(editingUser.subscription_expiry)} 
                    onChange={handleChange} 
                    disabled={isViewMode || !canEditInfoFields()} 
                  />
                )}
              </div>
            </section>

            {/* Footer */}
            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onClose(false)} 
                disabled={loading}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="min-w-[120px] px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Lưu thay đổi
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { UserDetailModal };
