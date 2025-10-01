import React, { useState } from 'react';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/button';
import { changePassword } from '../features/auth/authApi';
import { useToast } from '../components/ui/Toast';

const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.push('Mật khẩu mới và xác nhận không khớp', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      toast.push(res.message || 'Đổi mật khẩu thành công', 'success');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.push(err.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="current" label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        <Input id="new" label="Mật khẩu mới" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <Input id="confirm" label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
