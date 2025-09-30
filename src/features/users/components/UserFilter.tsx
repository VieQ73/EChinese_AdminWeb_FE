import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import { Button } from '../../../components/ui/button';
import { Search, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
    <div className="w-full max-w-7xl mx-auto p-5 bg-white rounded-xl shadow-xl border border-gray-100">
      
      {/* Hàng 1: Tìm kiếm chính và các nút hành động */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Trường tìm kiếm */}
        <div className="flex-grow">
          <Input
            id="user-search"
            label="Tìm kiếm nhanh"
            placeholder="Nhập tên, email hoặc username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-11 px-4 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Nút Tìm kiếm (Chỉ hiển thị trên màn hình nhỏ hoặc khi có nhu cầu nhấn nút) */}
        <div className="flex gap-3 md:hidden">
            <Button
              onClick={handleApplyFilters}
              className="flex-1 h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              <Search className="h-4 w-4 mr-2" /> Lọc
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1 h-11 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Đặt lại
            </Button>
        </div>
      </div>
      
      {/* Hàng 2: Bộ lọc chi tiết và nút hành động trên màn hình lớn */}
      <div className="flex flex-wrap md:flex-row gap-4 items-end pt-2 border-t border-gray-100 md:border-none md:pt-0">
        
        {/* Vai trò */}
        <div className="w-full sm:w-1/2 md:w-auto md:flex-grow">
          <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1.5">
            Vai trò
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-11 px-4 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Admin</option>
            <option value="super admin">Super Admin</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div className="w-full sm:w-1/2 md:w-auto md:flex-grow">
          <label htmlFor="user-active" className="block text-sm font-medium text-gray-700 mb-1.5">
            Trạng thái
          </label>
          <select
            id="user-active"
            value={isActive === undefined ? '' : isActive.toString()}
            onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full h-11 px-4 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>
        </div>
        
        {/* Nút Hành động trên màn hình lớn (Ẩn trên màn hình nhỏ) */}
        <div className="hidden md:flex gap-3">
          <Button
            onClick={handleApplyFilters}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center shadow-md whitespace-nowrap"
          >
            <Search className="h-5 w-5 mr-2" /> Lọc
          </Button>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="h-11 px-5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200 flex items-center justify-center shadow-md whitespace-nowrap"
          >
            <RotateCcw className="h-5 w-5 mr-2" /> Đặt lại
          </Button>
        </div>
        
      </div>
    </div>
  );
};

export { UserFilter };