import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, HelpCircle, BookOpen, Lightbulb } from 'lucide-react';
import { 
  fetchTips, 
  createTip, 
  updateTip, 
  deleteTip, 
  togglePinTip,
  TIP_TOPICS,
  type GetTipsParams, 
  type TipPayload 
} from './tipApi';
import Modal from '../../components/Modal';
import { Pagination } from '../../components/ui/pagination';
import { 
  CreateEditTipModal, 
  TipCard, 
  SearchAndFilters, 
  PageHeader, 
  BulkUploadModal
} from './components';
import type { Tip } from '../../types';
import type { PaginatedResponse } from '../../types';

// Định nghĩa tabs
type TabId = 'riddles' | 'readings' | 'tips';

const TABS = [
  { id: 'riddles' as TabId, label: 'Câu đố', icon: HelpCircle, topic: 'Câu đố' },
  { id: 'readings' as TabId, label: 'Bài đọc hiểu', icon: BookOpen, topic: 'Mỗi ngày một đoạn văn' },
  { id: 'tips' as TabId, label: 'Mẹo', icon: Lightbulb, topic: null }, // null = các topic còn lại
];

// Topics thuộc tab Mẹo (loại trừ Câu đố và Bài đọc)
const TIPS_TOPICS = TIP_TOPICS.filter(t => t !== 'Tất cả' && t !== 'Câu đố' && t !== 'Mỗi ngày một đoạn văn');

const TipsManagementPage: React.FC = () => {
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState<TabId>('riddles');
  
  // State cho tips data
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalTips, setTotalTips] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho pagination và filter
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // State cho modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [deletingTip, setDeletingTip] = useState<Tip | null>(null);

  // State cho toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load tips data - Gọi API không filter topic, sau đó filter client-side
  const loadTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Gọi API với limit lớn để lấy tất cả, không filter topic ở server
      const params: GetTipsParams = {
        page: 1,
        limit: 999, // Lấy tất cả
        search: searchQuery || undefined,
        level: selectedLevel !== 'Tất cả' ? selectedLevel : undefined,
        is_pinned: showPinnedOnly ? true : undefined
      };

      const response: PaginatedResponse<Tip> = await fetchTips(params);
      let allData = response.data || [];
      
      // Filter client-side theo tab
      let filteredData: Tip[] = [];
      
      if (activeTab === 'riddles') {
        // Tab Câu đố
        filteredData = allData.filter(tip => tip.topic === 'Câu đố');
      } else if (activeTab === 'readings') {
        // Tab Bài đọc hiểu
        filteredData = allData.filter(tip => tip.topic === 'Mỗi ngày một đoạn văn');
      } else {
        // Tab Mẹo - loại trừ Câu đố và Bài đọc
        filteredData = allData.filter(tip => 
          tip.topic !== 'Câu đố' && tip.topic !== 'Mỗi ngày một đoạn văn'
        );
        // Nếu có chọn topic cụ thể trong tab Mẹo
        if (selectedTopic !== 'Tất cả') {
          filteredData = filteredData.filter(tip => tip.topic === selectedTopic);
        }
      }
      
      // Client-side pagination
      const total = filteredData.length;
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
      
      setTips(paginatedData);
      setTotalTips(total);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải danh sách nội dung');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedTopic, selectedLevel, showPinnedOnly, activeTab]);

  // Load tips khi dependencies thay đổi
  useEffect(() => {
    loadTips();
  }, [loadTips]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTopic, selectedLevel, showPinnedOnly, pageSize, activeTab]);

  // Reset topic filter khi đổi tab
  useEffect(() => {
    setSelectedTopic('Tất cả');
    setSearchQuery('');
    setSelectedLevel('Tất cả');
    setShowPinnedOnly(false);
  }, [activeTab]);

  // Handlers
  const handleCreateTip = async (tipData: TipPayload) => {
    try {
      await createTip(tipData);
      setToast({ message: 'Tạo thành công!', type: 'success' });
      setShowCreateModal(false);
      await loadTips();
    } catch (error) {
      console.error('Lỗi tạo:', error);
      setToast({ message: 'Có lỗi khi tạo', type: 'error' });
      throw error;
    }
  };

  const handleUpdateTip = async (tipData: TipPayload) => {
    if (!editingTip) return;
    try {
      await updateTip(editingTip.id, tipData);
      setToast({ message: 'Cập nhật thành công!', type: 'success' });
      setEditingTip(null);
      await loadTips();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      setToast({ message: 'Có lỗi khi cập nhật', type: 'error' });
      throw error;
    }
  };

  const handleDeleteTip = async () => {
    if (!deletingTip) return;
    try {
      await deleteTip(deletingTip.id);
      setToast({ message: 'Xóa thành công!', type: 'success' });
      setDeletingTip(null);
      await loadTips();
    } catch (error) {
      console.error('Lỗi xóa:', error);
      setToast({ message: 'Có lỗi khi xóa', type: 'error' });
    }
  };

  const handleTogglePin = async (tip: Tip) => {
    try {
      await togglePinTip(tip.id, !tip.is_pinned);
      setToast({ message: tip.is_pinned ? 'Đã bỏ ghim' : 'Đã ghim', type: 'success' });
      await loadTips();
    } catch (error) {
      console.error('Lỗi toggle pin:', error);
      setToast({ message: 'Có lỗi khi thay đổi trạng thái ghim', type: 'error' });
    }
  };

  const handleBulkUploadSuccess = async (result: any) => {
    const successCount = result.success_count || 0;
    const skippedCount = result.skipped_count || 0;
    let message = `Tải lên thành công ${successCount} nội dung!`;
    if (skippedCount > 0) {
      message += ` (Bỏ qua ${skippedCount} có lỗi)`;
    }
    setToast({ message, type: 'success' });
    setShowBulkUploadModal(false);
    await loadTips();
  };

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const totalPages = Math.ceil(totalTips / pageSize);
  const currentTabInfo = TABS.find(t => t.id === activeTab);
  const tabLabel = currentTabInfo?.label || 'nội dung';

  // Lấy danh sách topics cho filter (chỉ hiển thị ở tab Mẹo)
  const availableTopics = activeTab === 'tips' ? ['Tất cả', ...TIPS_TOPICS] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        onBulkUpload={() => setShowBulkUploadModal(true)}
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Action Bar - Nút tạo mới riêng cho mỗi loại */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          {currentTabInfo && (
            <>
              {React.createElement(currentTabInfo.icon, { className: 'w-5 h-5 text-primary-600' })}
              <span className="font-medium text-gray-900">{currentTabInfo.label}</span>
            </>
          )}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo {tabLabel} mới
        </button>
      </div>

      {/* Search and Filters - Chỉ hiển thị topic filter ở tab Mẹo */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTopic={selectedTopic}
        onTopicChange={setSelectedTopic}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        showPinnedOnly={showPinnedOnly}
        onPinnedOnlyChange={setShowPinnedOnly}
        availableTopics={availableTopics}
        showTopicFilter={activeTab === 'tips'}
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

      {/* Tips List */}
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
              <p className="text-gray-500">Không tìm thấy {tabLabel} nào</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Tạo {tabLabel} đầu tiên
              </button>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {tips.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span>/ trang</span>
            </div>
            <div className="text-sm text-gray-600">
              Tổng cộng: <span className="font-semibold text-gray-900">{totalTips}</span> {tabLabel}
            </div>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
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
        defaultTopic={currentTabInfo?.topic || undefined}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletingTip !== null}
        onClose={() => setDeletingTip(null)}
        title="Xóa nội dung"
        footer={
          <div className="space-x-2">
            <button
              onClick={() => setDeletingTip(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteTip}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        }
      >
        <p>{`Bạn có chắc chắn muốn xóa "${deletingTip?.topic || ''}" không? Hành động này không thể hoàn tác.`}</p>
      </Modal>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className={`max-w-sm w-full px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all duration-300 border ${
            toast.type === 'success' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <span>{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-4 text-gray-500 hover:text-gray-700">✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipsManagementPage;
