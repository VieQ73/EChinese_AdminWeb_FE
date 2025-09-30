import React, { useState, useEffect } from 'react';
import  Input  from '../../../components/ui/Input';
import { Button } from '../../../components/ui/button';
import { Search, RotateCcw } from 'lucide-react'; // Import icons
import { cn } from '../../../lib/utils'; // Import cn

/**
 * @fileoverview UserFilter component - Bộ lọc và tìm kiếm người dùng
 * @description Cung cấp các trường nhập liệu để lọc danh sách người dùng theo tìm kiếm, vai trò và trạng thái hoạt động.
 */

interface UserFilterProps {
  currentFilters: {
    search: string;
    role: string;
    is_active: boolean | undefined;
  };
  onFilterChange: (filters: { search: string; role: string; is_active: boolean | undefined }) => void;
}

const UserFilter: React.FC<UserFilterProps> = ({ currentFilters, onFilterChange }) => {
  const [search, setSearch] = useState(currentFilters.search);
  const [role, setRole] = useState(currentFilters.role);
  const [isActive, setIsActive] = useState(currentFilters.is_active);

  // Đồng bộ hóa internal state với external props khi props thay đổi
  useEffect(() => {
    setSearch(currentFilters.search);
    setRole(currentFilters.role);
    setIsActive(currentFilters.is_active);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    onFilterChange({ search, role, is_active: isActive });
  };

  const handleResetFilters = () => {
    setSearch('');
    setRole('');
    setIsActive(undefined);
    onFilterChange({ search: '', role: '', is_active: undefined });
  };

  // Cho phép nhấn Enter để tìm kiếm
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex-1 min-w-[200px] max-w-xs">
        <Input
          id="user-search"
          label="Tìm kiếm người dùng"
          placeholder="Tên, Email hoặc Username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="p-2"
        />
      </div>

      <div className="flex-1 min-w-[150px] max-w-[200px] mb-4">
        <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
          Vai trò
        </label>
        <select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-150"
        >
          <option value="">Tất cả</option>
          <option value="user">Người dùng</option>
          <option value="admin">Admin</option>
          <option value="super admin">Super Admin</option>
        </select>
      </div>

      <div className="flex-1 min-w-[120px] max-w-[180px] mb-4">
        <label htmlFor="user-active" className="block text-sm font-medium text-gray-700 mb-1">
          Trạng thái
        </label>
        <select
          id="user-active"
          value={isActive === undefined ? '' : isActive.toString()}
          onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}
          className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-150"
        >
          <option value="">Tất cả</option>
          <option value="true">Hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="h-10 px-4">
          <Search className="h-4 w-4 mr-2" /> Lọc
        </Button>
        <Button variant="outline" onClick={handleResetFilters} className="h-10 px-4">
          <RotateCcw className="h-4 w-4 mr-2" /> Đặt lại
        </Button>
      </div>
    </div>
  );
};

export { UserFilter };