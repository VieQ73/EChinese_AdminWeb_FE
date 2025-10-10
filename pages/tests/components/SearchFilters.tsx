import React from 'react';
import { Search, Filter } from 'lucide-react';
import { MockTestListParams } from '../api';
import { testTypeLabels } from '../utils';

interface SearchFiltersProps {
  filters: MockTestListParams;
  onFilterChange: (key: keyof MockTestListParams, value: any) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  showAdvanced,
  onToggleAdvanced
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đề thi..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={onToggleAdvanced}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
            showAdvanced 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5 mr-2" />
          Bộ lọc
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại đề thi
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả loại</option>
              {Object.entries(testTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp độ
            </label>
            <input
              type="text"
              placeholder="VD: HSK3, Band A..."
              value={filters.level || ''}
              onChange={(e) => onFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              onChange={(e) => onFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Tạm dừng</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};