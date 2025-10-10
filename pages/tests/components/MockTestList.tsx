import React, { useState, useEffect } from 'react';
import { MockTest } from '../../../types/mocktest';
import { fetchMockTests, updateMockTest, createMockTest, deleteMockTest, MockTestListParams } from '../api';
import { TestGrid } from './TestGrid';
import { Plus } from 'lucide-react';

interface MockTestListProps {
  onCreateClick: () => void;
  onEditClick: (test: MockTest) => void;
  onViewDetailsClick: (test: MockTest) => void;
  refreshKey?: number;
  filterType?: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  filterLevel?: string;
}

export const MockTestList: React.FC<MockTestListProps> = ({
  onCreateClick,
  onEditClick,
  onViewDetailsClick,
  refreshKey,
  filterType,
  filterLevel
}) => {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Load data
  const loadTests = async () => {
    try {
      setLoading(true);
      const filters: MockTestListParams = {
        page: currentPage,
        limit,
        type: filterType || '',
        level: filterLevel || ''
      };
      const response = await fetchMockTests(filters);
      setTests(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đề thi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [currentPage, refreshKey, filterType, filterLevel]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterLevel]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle actions
  const handleToggleStatus = async (test: MockTest) => {
    try {
      await updateMockTest(test.id, { is_active: !test.is_active });
      loadTests();
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error);
    }
  };

  // Publish status is now controlled by is_active

  const handleDuplicate = async (test: MockTest) => {
    try {
      const duplicateData = {
        ...test,
        title: `${test.title} (Bản sao)`,
        id: undefined
      };
      await createMockTest(duplicateData);
      loadTests();
    } catch (error) {
      console.error('Lỗi khi sao chép đề thi:', error);
    }
  };

  const handleDelete = async (test: MockTest) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi "${test.title}"?`)) {
      return;
    }
    try {
      await deleteMockTest(test.id);
      loadTests();
    } catch (error) {
      console.error('Lỗi khi xóa đề thi:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đề thi thử</h1>
        <button 
          onClick={onCreateClick}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo đề thi mới
        </button>
      </div>

      {/* Test Grid */}
      <TestGrid
        tests={tests}
        onTestView={onViewDetailsClick}
        onTestEdit={onEditClick}
        onTestDuplicate={handleDuplicate}
        onTestDelete={handleDelete}
        onTestToggleStatus={handleToggleStatus}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};