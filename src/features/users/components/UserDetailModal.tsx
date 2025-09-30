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
import type { User, Subscription, Timestamp, UserUsage, UUID } from '../../../types/entities';
import { updateUser, fetchUserById } from '../userApi'; // Import API
import { Loader2, Save, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { MOCK_SUBSCRIPTIONS, MOCK_BADGE_LEVELS } from '../../../mocks/data'; // Để lấy danh sách subscriptions và badge levels

/**
 * @fileoverview UserDetailModal component - Modal xem và chỉnh sửa chi tiết người dùng
 * @description Hiển thị thông tin chi tiết của người dùng, cho phép admin chỉnh sửa các trường như
 * vai trò, trạng thái hoạt động, cấp độ huy hiệu và thông tin gói đăng ký.
 * Bao gồm logic fetch chi tiết user và cập nhật user.
 */

// Định nghĩa kiểu dữ liệu cho user với các trường bổ sung từ API details
interface UserDetail extends User {
    usage?: UserUsage[];
    subscription_details?: Subscription;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null; // Có thể null khi tạo mới user hoặc khi modal đang đóng
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  const [editingUser, setEditingUser] = useState<Partial<UserDetail> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load user details khi modal mở và user thay đổi
  useEffect(() => {
    if (isOpen && user?.id) {
      setFetchLoading(true);
      setError(null);
      setSuccessMessage(null);
      const loadUserDetails = async () => {
        try {
          // Fetch chi tiết user, bao gồm usage và subscription_details
          const response = await fetchUserById(user.id + '/details'); // Endpoint /users/:id/details
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
        // Trường hợp tạo người dùng mới, khởi tạo form trống
        setEditingUser({
            name: '',
            username: '',
            email: '',
            role: 'user',
            is_active: true,
            badge_level: 0,
            level: '1',
            language: 'Tiếng Việt',
            community_points: 0,
            isVerify: false,
            // Các trường khác có thể để mặc định hoặc không hiển thị trong form tạo
        });
        setFetchLoading(false);
    }
  }, [isOpen, user]);

  // Reset messages khi đóng modal
  useEffect(() => {
    if (!isOpen) {
        setError(null);
        setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;

    if (editingUser) {
        if (id === 'is_active') {
            setEditingUser({ ...editingUser, [id]: checked });
        } else if (id === 'badge_level' || id === 'community_points') {
            setEditingUser({ ...editingUser, [id]: parseInt(value) });
        } else if (id === 'subscription_expiry') {
           setEditingUser({ ...editingUser, [id]: value ? new Date(value).toISOString() : undefined });
        } else {
            setEditingUser({ ...editingUser, [id]: value });
        }
    }
  };

  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editingUser) {
        const subId = e.target.value === '' ? undefined : e.target.value;
        const selectedSub = MOCK_SUBSCRIPTIONS.find(s => s.id === subId);
        setEditingUser({
            ...editingUser,
            subscription_id: subId,
            // Cập nhật subscription_expiry dựa trên gói đã chọn (ví dụ: +1 tháng)
            subscription_expiry: selectedSub?.duration_months != null
            ? new Date(Date.now() + selectedSub.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,// undefined nếu là gói vĩnh viễn hoặc không chọn
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
        if (user?.id) { // Chỉnh sửa user hiện có
            await updateUser(user.id, editingUser);
            setSuccessMessage("Cập nhật thông tin người dùng thành công!");
        } else { // Tạo người dùng mới (chưa có API tạo trong spec, đây là giả lập)
            // Trong thực tế, bạn sẽ có một API `createUser` riêng
            // Ví dụ: await createUser(editingUser);
            setSuccessMessage("Tạo người dùng mới thành công! (Mock)");
            // Thêm user vào MOCK_USERS nếu cần mock persistent hơn
        }
        
        // Tự động đóng modal sau khi thành công
        setTimeout(() => {
            onClose();
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
    // Format thành YYYY-MM-DDTHH:MM
    return date.toISOString().slice(0, 16);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? `Chỉnh sửa Người dùng: ${user.name || user.username}` : 'Tạo Người dùng mới'}</DialogTitle>
          <DialogDescription>
            {user ? 'Cập nhật thông tin chi tiết của người dùng này.' : 'Nhập thông tin để tạo người dùng mới.'}
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
            />
            <Input
              id="username"
              label="Username"
              value={editingUser.username || ''}
              onChange={handleChange}
              placeholder="van_a"
              disabled={!!user} // Không cho phép sửa username khi chỉnh sửa user đã tồn tại
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={editingUser.email || ''}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={!!user} // Không cho phép sửa email khi chỉnh sửa user đã tồn tại
            />

            {/* Role */}
            <div className="space-y-1">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">Vai trò</label>
                <select
                    id="role"
                    value={editingUser.role}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-150"
                >
                    <option value="user">Người dùng</option>
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                </select>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2 mt-2">
                <input
                    id="is_active"
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
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
                />
            )}

            {/* Display UserUsage if available (only in view/edit mode for existing user) */}
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
            
            {/* Display Subscription Details if available */}
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
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[100px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Lưu Thay đổi
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { UserDetailModal };