import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import  Input  from '../../../components/ui/Input';
import { Button } from '../../../components/ui/button';
import type { User, Subscription, Timestamp, UserUsage } from '../../../types/entities';
import { updateUser, fetchUserById } from '../userApi';
import { Loader2, Save, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { MOCK_SUBSCRIPTIONS, MOCK_BADGE_LEVELS } from '../../../mocks/data';
import type { AuthenticatedUser } from '../../../App';

/**
 * @fileoverview UserDetailModal component - Modal xem và chỉnh sửa chi tiết người dùng
 * @description Hiển thị thông tin chi tiết của người dùng, cho phép admin chỉnh sửa các trường như
 * vai trò, trạng thái hoạt động, cấp độ huy hiệu và thông tin gói đăng ký.
 * Bao gồm logic fetch chi tiết user và cập nhật user.
 * Áp dụng phân quyền dựa trên vai trò và chế độ xem/chỉnh sửa.
 */

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isViewMode = mode === 'view';
  const isSelf = currentUser?.id === user?.id; // Người dùng hiện tại có phải là người đang chỉnh sửa không?

  // Helper để kiểm tra quyền của currentUser
  const isSuperAdmin = currentUser?.role === 'super admin';
  const isAdmin = currentUser?.role === 'admin';

  // --- Quyền cho các trường riêng lẻ ---

  // Quyền chỉnh sửa Role
  const canEditRoleField = (): boolean => {
    if (!isSuperAdmin) return false; // Chỉ super admin mới có thể sửa role
    if (user?.role === 'super admin' && !isSelf) return false; // Không sửa role của super admin khác
    return true;
  };

  // Quyền chỉnh sửa các trường thông tin chung (name, email, is_active, badge_level, subscription...)
  const canEditInfoFields = (): boolean => {
    if (!currentUser) return false;
    if (user?.role === 'super admin' && !isSelf) return false; // Không sửa thông tin của super admin khác
    return isSuperAdmin || (isAdmin && user?.role === 'user'); // Super admin sửa tất cả, Admin sửa user thường
  };

  // Check nếu Super Admin đang cố gắng tự hạ cấp
  const isSuperAdminAttemptingToDemoteSelf = (): boolean => {
    return isSuperAdmin && isSelf && editingUser?.role !== 'super admin';
  };


  // Load user details khi modal mở và user thay đổi
  useEffect(() => {
    if (isOpen && user?.id) {
      setFetchLoading(true);
      setError(null);
      setSuccessMessage(null);
      const loadUserDetails = async () => {
        try {
          const response = await fetchUserById(user.id + '/details');
          setEditingUser(response);
        } catch (err: any) {
          console.error("Lỗi khi tải chi tiết người dùng:", err);
          setError(err.message || "Không thể tải chi tiết người dùng.");
          setEditingUser(null);
        } finally {
          setFetchLoading(false);
        }
      };
      loadUserDetails();
    } else if (isOpen && !user) {
        // Modal này không hỗ trợ tạo người dùng mới, chỉ xem/sửa user hiện có.
        // Nếu user là null và modal mở, có nghĩa là có lỗi logic hoặc cố tình mở modal tạo mới.
        // Trong trường hợp này, chúng ta đóng modal.
        onClose(false);
    }
  }, [isOpen, user, onClose]);

  useEffect(() => {
    if (!isOpen) {
        setError(null);
        setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;

    if (editingUser) {
        let newValue: any = value;
        if (type === 'checkbox') {
            newValue = checked;
        } else if (id === 'badge_level' || id === 'community_points') {
            newValue = parseInt(value);
        } else if (id === 'subscription_expiry') {
           newValue = value ? new Date(value).toISOString() : undefined;
        }
        
        // Kiểm tra quyền sửa role riêng
        if (id === 'role' && !canEditRoleField()) {
            alert('Bạn không có quyền chỉnh sửa vai trò này.');
            return;
        }
        // Kiểm tra quyền sửa các trường thông tin chung
        if (id !== 'role' && !canEditInfoFields()) {
            alert('Bạn không có quyền chỉnh sửa thông tin này.');
            return;
        }

        setEditingUser(prev => ({ ...prev, [id]: newValue } as Partial<UserDetail>));
    }
  };

  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEditInfoFields()) { // Kiểm tra quyền trước khi sửa
        alert('Bạn không có quyền chỉnh sửa thông tin gói đăng ký.');
        return;
    }
    if (editingUser) {
        const subId = e.target.value === '' ? undefined : e.target.value;
        const selectedSub = MOCK_SUBSCRIPTIONS.find(s => s.id === subId);
        setEditingUser(prev => ({
            ...prev,
            subscription_id: subId,
            subscription_expiry: selectedSub?.duration_months != null
            ? new Date(Date.now() + selectedSub.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        } as Partial<UserDetail>));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !user?.id) return;

    // Kiểm tra lại quyền trước khi gửi đi
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
        // Lọc ra các trường mà current user không có quyền sửa
        if (!canEditRoleField()) {
            delete payloadToUpdate.role;
        }
        if (!canEditInfoFields()) {
            delete payloadToUpdate.name;
            delete payloadToUpdate.email;
            delete payloadToUpdate.is_active;
            delete payloadToUpdate.badge_level;
            delete payloadToUpdate.subscription_id;
            delete payloadToUpdate.subscription_expiry;
        }
        // Luôn loại bỏ username khi update qua modal này
        delete payloadToUpdate.username;

        await updateUser(user.id, payloadToUpdate);
        setSuccessMessage("Cập nhật thông tin người dùng thành công!");
        
        setTimeout(() => {
            onClose(true); // Yêu cầu refresh danh sách
        }, 1500);

    } catch (err: any) {
      console.error("Lỗi khi lưu người dùng:", err);
      setError(err.message || "Không thể lưu thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (isoString?: Timestamp | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(_open) => onClose(false)}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'view' ? `Chi tiết Người dùng: ${user?.name || user?.username}` : `Chỉnh sửa Người dùng: ${user?.name || user?.username}`}</DialogTitle>
          <DialogDescription>
            {mode === 'view' ? 'Xem thông tin chi tiết của người dùng.' : 'Cập nhật thông tin chi tiết của người dùng này.'}
          </DialogDescription>
        </DialogHeader>

        {fetchLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Đang tải chi tiết người dùng...</span>
            </div>
        ) : error && !successMessage ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Lỗi:</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 p-2 text-red-700 hover:bg-red-200" onClick={() => setError(null)}>
                    <XCircle className="h-4 w-4" />
                </Button>
            </div>
        ) : successMessage ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Thành công:</strong>
                <span className="block sm:inline ml-2">{successMessage}</span>
            </div>
        ) : editingUser && (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Input
              id="name"
              label="Tên đầy đủ"
              value={editingUser.name || ''}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              disabled={isViewMode || !canEditInfoFields()}
            />
            <Input
              id="username"
              label="Username"
              value={editingUser.username || ''}
              // onChange={handleChange} // Không cho phép chỉnh sửa username
              placeholder="van_a"
              disabled // Username luôn disabled
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={editingUser.email || ''}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={isViewMode || !canEditInfoFields()}
            />
            <Input
              id="community_points"
              label="Điểm Cộng đồng"
              type="number"
              value={editingUser.community_points?.toString() || '0'}
              onChange={handleChange}
              disabled={isViewMode || !canEditInfoFields()}
            />

            {/* Role */}
            <div className="space-y-1">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">Vai trò</label>
                <select
                    id="role"
                    value={editingUser.role}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-150"
                    disabled={isViewMode || !canEditRoleField() || isSuperAdminAttemptingToDemoteSelf()} // Disabled nếu chỉ xem, không có quyền sửa role, hoặc cố gắng tự hạ cấp
                >
                    <option value="user">Người dùng</option>
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                </select>
                {isSuperAdminAttemptingToDemoteSelf() && (
                    <p className="mt-1 text-xs text-red-600 font-medium">Super Admin không thể tự hạ cấp vai trò của mình.</p>
                )}
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2 mt-2">
                <input
                    id="is_active"
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    disabled={isViewMode || !canEditInfoFields() || user?.role === 'super admin'} // Không cho phép khóa/mở khóa super admin
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-900 cursor-pointer">Hoạt động</label>
            </div>

            {/* Badge Level */}
            <div className="space-y-1">
                <label htmlFor="badge_level" className="text-sm font-medium text-gray-700">Cấp độ Huy hiệu</label>
                <select
                    id="badge_level"
                    value={editingUser.badge_level}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-150"
                    disabled={isViewMode || !canEditInfoFields()}
                >
                    {MOCK_BADGE_LEVELS.map(badge => (
                        <option key={badge.level} value={badge.level}>{badge.name} (Level {badge.level})</option>
                    ))}
                </select>
            </div>

            {/* Subscription */}
            <div className="space-y-1">
                <label htmlFor="subscription_id" className="text-sm font-medium text-gray-700">Gói Đăng ký</label>
                <select
                    id="subscription_id"
                    value={editingUser.subscription_id || ''}
                    onChange={handleSubscriptionChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-150"
                    disabled={isViewMode || !canEditInfoFields()}
                >
                    <option value="">Không có gói</option>
                    {MOCK_SUBSCRIPTIONS.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.duration_months === null ? 'Vĩnh viễn' : `${sub.duration_months} tháng`})</option>
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

            {user && editingUser.usage && editingUser.usage.length > 0 && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-2">Sử dụng AI gần đây:</h4>
                    {editingUser.usage.map((usageItem, index) => (
                        <p key={index} className="text-sm text-gray-600">
                            {usageItem.feature}: {usageItem.daily_count} lần (Reset: {new Date(usageItem.last_reset).toLocaleDateString()})
                        </p>
                    ))}
                </div>
            )}
            
            {user && editingUser.subscription_details && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-2">Chi tiết gói đăng ký:</h4>
                    <p className="text-sm text-gray-600">Tên gói: {editingUser.subscription_details.name}</p>
                    <p className="text-sm text-gray-600">Giá: {editingUser.subscription_details.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                    <p className="text-sm text-gray-600">Quota AI/ngày: {editingUser.subscription_details.daily_quota_ai_lesson}</p>
                    <p className="text-sm text-gray-600">Quota Dịch/ngày: {editingUser.subscription_details.daily_quota_translate}</p>
                </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={loading}>
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && ( // Chỉ hiển thị nút Lưu khi không phải chế độ xem
                <Button type="submit" disabled={loading} className="min-w-[100px]">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Lưu Thay đổi
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