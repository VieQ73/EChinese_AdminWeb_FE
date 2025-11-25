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
}

const CreateEditTipModal: React.FC<CreateEditTipModalProps> = ({ isOpen, onClose, onSave, initialTip = null }) => {
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<TipPayload['level'] | ''>('');
  const [content, setContent] = useState('');
  const [answer, setAnswer] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setTopic('');
        setLevel('');
        setContent('');
        setAnswer('');
        setIsPinned(false);
      }
      setSaving(false);
    }
  }, [isOpen, initialTip]);

  useEffect(() => {
    if (topic !== 'Câu đố') {
      setAnswer('');
    }
  }, [topic]);

  const isFormValid = () => {
    const basicValid = topic && level && content.replace(/<[^>]*>/g, '').trim();
    return topic === 'Câu đố' ? basicValid && answer.trim() : !!basicValid;
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
        ...(topic === 'Câu đố' && { answer: answer.trim() }),
      };
      await onSave(tipData);
      // Đóng modal khi lưu thành công
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu tip:', error);
      alert('Có lỗi xảy ra khi lưu tip');
    } finally {
      // Luôn luôn tắt trạng thái loading
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{initialTip ? 'Chỉnh sửa mẹo' : 'Tạo mẹo mới'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100" disabled={saving}><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Chủ đề <span className="text-red-500">*</span></label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 bg-gray-50 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500" disabled={saving}>
                <option value="">Chọn chủ đề</option>
                {TIP_TOPICS.filter(t => t !== 'Tất cả').map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Cấp độ <span className="text-red-500">*</span></label>
              <select value={level} onChange={(e) => setLevel(e.target.value as TipPayload['level'] | '')} className="w-full p-3 bg-gray-50 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500" disabled={saving}>
                <option value="">Chọn cấp độ</option>
                {TIP_LEVELS.filter(l => l !== 'Tất cả').map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nội dung <span className="text-red-500">*</span></label>
            <RichTextEditor 
              key={`editor-${initialTip?.id || 'new'}`} 
              // Dữ liệu ban đầu
              initialContent={content} 
              // Callback khi nội dung thay đổi
              onChange={setContent} 
              // Truyền placeholder tùy chỉnh
              placeholder="Nhập nội dung mẹo..." 
            />
          </div>

          {topic === 'Câu đố' && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Đáp án <span className="text-red-500">*</span></label>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Nhập đáp án cho câu đố..." className="w-full p-3 border rounded-lg bg-yellow-50 border-yellow-300 focus:ring-2 focus:ring-yellow-500" rows={3} disabled={saving} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" disabled={saving} />
            <label htmlFor="isPinned" className="text-sm font-medium">Ghim mẹo này</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
          <button onClick={handleSave} disabled={saving || !isFormValid()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><Save size={16} /> {initialTip ? 'Cập nhật' : 'Tạo mẹo'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTipModal;