import React from 'react';
import Input from '../../../components/ui/Input';

interface UserFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export const UserFilter: React.FC<UserFilterProps> = ({ searchTerm, onSearchChange, onRoleChange }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex-grow min-w-[250px]">
        {/* Thêm label ẩn để sửa lỗi TypeScript và tốt cho accessibility */}
        <label htmlFor="search" className="sr-only">
          Tìm kiếm người dùng
        </label>
        <Input
          id="search"
          placeholder="Tìm theo tên, email, username..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)} label={''}        />
      </div>
      <select
        onChange={(e) => onRoleChange(e.target.value)}
        className="p-2 border rounded-md bg-white focus:ring-teal-500 focus:border-teal-500"
      >
        <option value="">Tất cả vai trò</option>
        <option value="user">Người dùng</option>
        <option value="admin">Admin</option>
        <option value="super admin">Super Admin</option>
      </select>
    </div>
  );
};