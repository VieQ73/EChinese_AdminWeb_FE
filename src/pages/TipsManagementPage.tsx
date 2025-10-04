import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  fetchTips, 
  createTip, 
  updateTip, 
  deleteTip, 
  togglePinTip,
  type GetTipsParams, 
  type TipPayload 
} from '../features/tips/tipApi';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Pagination } from '../components/ui/pagination';
import { 
  CreateEditTipModal, 
  TipCard, 
  SearchAndFilters, 
  PageHeader, 
  StatsDisplay,
  BulkUploadModal
} from '../features/tips/components';
import type { Tip } from '../types/entities';
import type { PaginatedResponse } from '../types/api';

/**
 * Trang quản lý mẹo học tập cho Admin
 * Có đầy đủ chức năng CRUD, filter, search, pin tips
 */
const TipsManagementPage: React.FC = () => {
  // State cho tips data
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalTips, setTotalTips] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho pagination và filter
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 12 tips per page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // State cho modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [deletingTip, setDeletingTip] = useState<Tip | null>(null);

  // State cho toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load tips data
  const loadTips = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: GetTipsParams = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        topic: selectedTopic !== 'Tất cả' ? selectedTopic : undefined,
        level: selectedLevel !== 'Tất cả' ? selectedLevel : undefined,
        is_pinned: showPinnedOnly ? true : undefined
      };

      const response: PaginatedResponse<Tip> = await fetchTips(params);
      setTips(response.data || []);
      setTotalTips(response.meta?.total || 0);
    } catch (err) {
      console.error('Lỗi khi tải tips:', err);
      setError('Không thể tải danh sách mẹo học tập');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedTopic, selectedLevel, showPinnedOnly]);

  // Load tips khi component mount hoặc filter thay đổi
  useEffect(() => {
    loadTips();
  }, [currentPage, searchQuery, selectedTopic, selectedLevel, showPinnedOnly, loadTips]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTopic, selectedLevel, showPinnedOnly]);

  // Xử lý tạo tip mới
  const handleCreateTip = async (tipData: TipPayload) => {
    try {
      await createTip(tipData);
      setToast({ message: 'Tạo mẹo thành công!', type: 'success' });
      loadTips(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi tạo tip:', error);
      setToast({ message: 'Có lỗi khi tạo mẹo', type: 'error' });
      throw error;
    }
  };

  // Xử lý cập nhật tip
  const handleUpdateTip = async (tipData: TipPayload) => {
    if (!editingTip) return;
    
    try {
      await updateTip(editingTip.id, tipData);
      setToast({ message: 'Cập nhật mẹo thành công!', type: 'success' });
      setEditingTip(null);
      loadTips(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi cập nhật tip:', error);
      setToast({ message: 'Có lỗi khi cập nhật mẹo', type: 'error' });
      throw error;
    }
  };

  // Xử lý xóa tip
  const handleDeleteTip = async () => {
    if (!deletingTip) return;

    try {
      await deleteTip(deletingTip.id);
      setToast({ message: 'Xóa mẹo thành công!', type: 'success' });
      setDeletingTip(null);
      loadTips(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi xóa tip:', error);
      setToast({ message: 'Có lỗi khi xóa mẹo', type: 'error' });
    }
  };

  // Xử lý ghim/bỏ ghim tip
  const handleTogglePin = async (tip: Tip) => {
    try {
      await togglePinTip(tip.id, !tip.is_pinned);
      setToast({ 
        message: tip.is_pinned ? 'Đã bỏ ghim mẹo' : 'Đã ghim mẹo', 
        type: 'success' 
      });
      loadTips(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi toggle pin:', error);
      setToast({ message: 'Có lỗi khi thay đổi trạng thái ghim', type: 'error' });
    }
  };

  // Xử lý bulk upload thành công
  const handleBulkUploadSuccess = (result: any) => {
    setToast({ 
      message: `Tải lên thành công ${result.success_count} mẹo!`, 
      type: 'success' 
    });
    setShowBulkUploadModal(false);
    loadTips(); // Reload danh sách
  };

  // Tính toán pagination
  const totalPages = Math.ceil(totalTips / pageSize);

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <PageHeader 
        onCreateTip={() => setShowCreateModal(true)}
        onBulkUpload={() => setShowBulkUploadModal(true)}
      />

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTopic={selectedTopic}
        onTopicChange={setSelectedTopic}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        showPinnedOnly={showPinnedOnly}
        onPinnedOnlyChange={setShowPinnedOnly}
      />

      {/* Stats Display */}
      <StatsDisplay
        currentCount={tips.length}
        totalCount={totalTips}
        selectedTopic={selectedTopic}
        selectedLevel={selectedLevel}
        showPinnedOnly={showPinnedOnly}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Tips List - Layout dạng vertical stack */}
      {!loading && !error && (
        <>
          {tips.length > 0 ? (
            <div className="space-y-4">
              {tips.map((tip) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  onEdit={(tip) => setEditingTip(tip)}
                  onDelete={(tip) => setDeletingTip(tip)}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Không tìm thấy mẹo nào</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Tạo mẹo đầu tiên
              </button>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Modal */}
      <CreateEditTipModal
        isOpen={showCreateModal || editingTip !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTip(null);
        }}
        onSave={editingTip ? handleUpdateTip : handleCreateTip}
        initialTip={editingTip}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingTip !== null}
        onCancel={() => setDeletingTip(null)}
        onConfirm={handleDeleteTip}
        title="Xóa mẹo học tập"
        message={`Bạn có chắc chắn muốn xóa mẹo "${deletingTip?.topic || ''}" không? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`max-w-sm w-full px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-opacity duration-300 border ${
            toast.type === 'success' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <span>{toast.message}</span>
              <button 
                onClick={() => setToast(null)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipsManagementPage;