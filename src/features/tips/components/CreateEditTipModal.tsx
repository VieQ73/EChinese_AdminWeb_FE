import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { TIP_TOPICS, TIP_LEVELS } from '../tipApi';
import RichTextEditor from './RichTextEditor';
import type { Tip } from '../../../types/entities';

interface CreateEditTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tipData: any) => Promise<void>;
  initialTip?: Tip | null;
}

/**
 * Modal tạo/chỉnh sửa tip với Rich Text Editor
 * Theo database schema: topic, level, content (jsonb), answer, is_pinned
 */
const CreateEditTipModal: React.FC<CreateEditTipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTip = null
}) => {
  // Form state
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [content, setContent] = useState('');
  const [answer, setAnswer] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form khi mở modal hoặc khi initialTip thay đổi
  useEffect(() => {
    if (isOpen) {
      if (initialTip) {
        // Chỉnh sửa tip hiện có
        setTopic(initialTip.topic || '');
        setLevel(initialTip.level || '');
        // Content là JSON, lấy HTML từ đó
        const htmlContent = typeof initialTip.content === 'object' && initialTip.content && 'html' in initialTip.content
          ? (initialTip.content as any).html 
          : initialTip.content?.toString() || '';
        setContent(htmlContent);
        setAnswer(initialTip.answer || '');
        setIsPinned(initialTip.is_pinned || false);
      } else {
        // Tạo tip mới - reset tất cả về trống
        setTopic('');
        setLevel('');
        setContent('');
        setAnswer('');
        setIsPinned(false);
      }
    } else {
      // Khi đóng modal, reset form để lần mở tiếp theo không bị cache
      setTopic('');
      setLevel('');
      setContent('');
      setAnswer('');
      setIsPinned(false);
    }
  }, [isOpen, initialTip]);

  // Reset answer khi chuyển từ "Câu đố" sang chủ đề khác
  useEffect(() => {
    if (topic !== '' && topic !== 'Câu đố') {
      // Clear answer vì chỉ "Câu đố" mới có answer
      setAnswer('');
    }
  }, [topic]);

  // Validate form
  const isFormValid = () => {
    const basicValid = topic.trim() && level.trim() && content.trim();
    // Nếu là câu đố thì phải có đáp án, các chủ đề khác không cần answer
    if (topic === 'Câu đố') {
      return basicValid && answer.trim();
    }
    return basicValid;
  };

  // Xử lý lưu
  const handleSave = async () => {
    if (!isFormValid()) {
      const missingFields = [];
      if (!topic.trim()) missingFields.push('chủ đề');
      if (!level.trim()) missingFields.push('cấp độ');
      if (!content.trim()) missingFields.push('nội dung');
      if (topic === 'Câu đố' && !answer.trim()) missingFields.push('đáp án');
      
      alert(`Vui lòng điền đầy đủ: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      // Tạo payload theo format database - CHỈ gửi answer cho "Câu đố"
      const tipData: any = {
        topic: topic.trim(),
        level: level.trim(),
        // Content theo định dạng JSON như Post (có html và ops)
        content: {
          html: content,
          ops: [{ insert: content }] // Simple ops format
        },
        is_pinned: isPinned
      };

      // CHỈ thêm answer nếu là chủ đề "Câu đố" và có nội dung
      if (topic === 'Câu đố' && answer.trim()) {
        tipData.answer = answer.trim();
      }

      await onSave(tipData);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu tip:', error);
      alert('Có lỗi xảy ra khi lưu tip');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold leading-none tracking-tight">
            {initialTip ? 'Chỉnh sửa mẹo' : 'Tạo mẹo mới'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 bg-gray-100 hover:bg-gray-200"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Topic và Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chủ đề */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">
                Chủ đề <span className="text-red-500">*</span>
              </label>
              <select 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Chọn chủ đề</option>
                {TIP_TOPICS.filter(t => t !== 'Tất cả').map(topicOption => (
                  <option key={topicOption} value={topicOption}>
                    {topicOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Cấp độ */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">
                Cấp độ <span className="text-red-500">*</span>
              </label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Chọn cấp độ</option>
                {TIP_LEVELS.filter(l => l !== 'Tất cả').map(levelOption => (
                  <option key={levelOption} value={levelOption}>
                    {levelOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nội dung Rich Text */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              key={`editor-${initialTip?.id || 'new'}-${isOpen}`}
              content={content}
              onChange={setContent}
              placeholder="Nhập nội dung mẹo học tập..."
              className="min-h-[200px]"
            />
          </div>

          {/* Trường Đáp án - CHỈ hiển thị cho chủ đề "Câu đố" */}
          {topic === 'Câu đố' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">
                Đáp án <span className="text-red-500">*</span>
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập đáp án cho câu đố..."
                className="w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none bg-yellow-50 border-yellow-300 focus:border-yellow-500 transition-colors"
                rows={3}
                disabled={saving}
              />
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <span>💡</span>
                <span>Đáp án là bắt buộc với chủ đề &quot;Câu đố&quot;</span>
              </p>
            </div>
          )}

          {/* Ghim tip */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              disabled={saving}
            />
            <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
              Ghim mẹo này (hiển thị ưu tiên)
            </label>
          </div>
        </div>

        {/* Footer với nút Save/Cancel */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !isFormValid()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} />
                {initialTip ? 'Cập nhật' : 'Tạo mẹo'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTipModal;