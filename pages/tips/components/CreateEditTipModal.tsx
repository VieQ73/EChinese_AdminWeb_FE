import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { TIP_TOPICS, TIP_LEVELS, type TipPayload } from '../tipApi';
import RichTextEditor from '../../../components/RichTextEditor';
import type { Tip } from '../../../types';

interface CreateEditTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tipData: TipPayload) => Promise<void>;
  initialTip?: Tip | null;
  defaultTopic?: string;
}

const CreateEditTipModal: React.FC<CreateEditTipModalProps> = ({ isOpen, onClose, onSave, initialTip = null, defaultTopic }) => {
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<TipPayload['level'] | ''>('');
  const [content, setContent] = useState('');
  const [answer, setAnswer] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  // Kiểm tra có phải topic cố định (Câu đố hoặc Bài đọc)
  const isFixedTopic = defaultTopic === 'Câu đố' || defaultTopic === 'Mỗi ngày một đoạn văn';
  
  // Kiểm tra có cần hiển thị trường đáp án
  const showAnswerField = topic === 'Câu đố' || topic === 'Mỗi ngày một đoạn văn';

  useEffect(() => {
    if (isOpen) {
      if (initialTip) {
        setTopic(initialTip.topic || '');
        setLevel(initialTip.level as TipPayload['level'] || '');
        const htmlContent = (initialTip.content as any)?.html || '';
        setContent(htmlContent);
        setAnswer(initialTip.answer || '');
        setIsPinned(initialTip.is_pinned || false);
      } else {
        setTopic(defaultTopic || '');
        setLevel('');
        setContent('');
        setAnswer('');
        setIsPinned(false);
      }
      setSaving(false);
    }
  }, [isOpen, initialTip, defaultTopic]);

  // Reset answer khi topic thay đổi và không phải Câu đố hoặc Bài đọc
  useEffect(() => {
    if (topic !== 'Câu đố' && topic !== 'Mỗi ngày một đoạn văn') {
      setAnswer('');
    }
  }, [topic]);

  const isFormValid = () => {
    const basicValid = topic && level && content.replace(/<[^>]*>/g, '').trim();
    // Câu đố và Bài đọc bắt buộc có đáp án
    if (topic === 'Câu đố' || topic === 'Mỗi ngày một đoạn văn') {
      return basicValid && answer.trim();
    }
    return !!basicValid;
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    setSaving(true);
    try {
      const tipData: TipPayload = {
        topic: topic,
        level: level as TipPayload['level'],
        content: { html: content },
        is_pinned: isPinned,
        ...((topic === 'Câu đố' || topic === 'Mỗi ngày một đoạn văn') && { answer: answer.trim() }),
      };
      await onSave(tipData);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      alert('Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  // Xác định label dựa trên topic
  const getLabel = () => {
    if (topic === 'Câu đố') return 'câu đố';
    if (topic === 'Mỗi ngày một đoạn văn') return 'bài đọc';
    return 'mẹo';
  };

  // Lấy placeholder cho nội dung
  const getContentPlaceholder = () => {
    if (topic === 'Câu đố') return 'Nhập nội dung câu đố...';
    if (topic === 'Mỗi ngày một đoạn văn') return 'Nhập nội dung bài đọc hiểu...';
    return 'Nhập nội dung mẹo...';
  };

  // Lấy label và placeholder cho đáp án
  const getAnswerLabel = () => {
    if (topic === 'Câu đố') return 'Đáp án';
    if (topic === 'Mỗi ngày một đoạn văn') return 'Đáp án / Giải thích';
    return 'Đáp án';
  };

  const getAnswerPlaceholder = () => {
    if (topic === 'Câu đố') return 'Nhập đáp án cho câu đố...';
    if (topic === 'Mỗi ngày một đoạn văn') return 'Nhập đáp án hoặc giải thích cho bài đọc...';
    return 'Nhập đáp án...';
  };

  if (!isOpen) return null;

  const label = getLabel();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{initialTip ? `Chỉnh sửa ${label}` : `Tạo ${label} mới`}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100" disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Chủ đề - Chỉ hiển thị khi không phải topic cố định */}
          {!isFixedTopic && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Chủ đề <span className="text-red-500">*</span>
                </label>
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  className="w-full p-3 bg-gray-50 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500" 
                  disabled={saving}
                >
                  <option value="">Chọn chủ đề</option>
                  {TIP_TOPICS.filter(t => t !== 'Tất cả' && t !== 'Câu đố' && t !== 'Mỗi ngày một đoạn văn').map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Cấp độ <span className="text-red-500">*</span>
                </label>
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value as TipPayload['level'] | '')} 
                  className="w-full p-3 bg-gray-50 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500" 
                  disabled={saving}
                >
                  <option value="">Chọn cấp độ</option>
                  {TIP_LEVELS.filter(l => l !== 'Tất cả').map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Cấp độ - Hiển thị riêng khi là topic cố định */}
          {isFixedTopic && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Cấp độ <span className="text-red-500">*</span>
              </label>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value as TipPayload['level'] | '')} 
                className="w-full p-3 bg-gray-50 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500" 
                disabled={saving}
              >
                <option value="">Chọn cấp độ</option>
                {TIP_LEVELS.filter(l => l !== 'Tất cả').map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <RichTextEditor 
              key={`editor-${initialTip?.id || 'new'}-${topic}`} 
              initialContent={content} 
              onChange={setContent} 
              placeholder={getContentPlaceholder()} 
            />
          </div>

          {/* Đáp án - Hiển thị cho Câu đố và Bài đọc hiểu */}
          {showAnswerField && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {getAnswerLabel()} <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                placeholder={getAnswerPlaceholder()} 
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  topic === 'Câu đố' 
                    ? 'bg-yellow-50 border-yellow-300 focus:ring-yellow-500' 
                    : 'bg-blue-50 border-blue-300 focus:ring-blue-500'
                }`}
                rows={3} 
                disabled={saving} 
              />
            </div>
          )}

          {/* Ghim */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isPinned" 
              checked={isPinned} 
              onChange={(e) => setIsPinned(e.target.checked)} 
              className="w-4 h-4 text-blue-600 rounded" 
              disabled={saving} 
            />
            <label htmlFor="isPinned" className="text-sm font-medium">Ghim {label} này</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button 
            onClick={onClose} 
            disabled={saving} 
            className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || !isFormValid()} 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
            ) : (
              <><Save size={16} /> {initialTip ? 'Cập nhật' : `Tạo ${label}`}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTipModal;
