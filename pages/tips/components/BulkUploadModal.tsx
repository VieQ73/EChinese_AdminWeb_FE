import React, { useState, useEffect } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { bulkUploadTips } from '../tipApi';
import type { TipPayload } from '../tipApi';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

/**
 * Modal tải lên hàng loạt tips từ JSON
 * Hỗ trợ preview, validation và upload với error handling
 */
const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewTips, setPreviewTips] = useState<TipPayload[]>([]);

  // Sample JSON structure - CHỈ "Câu đố" mới có answer
  const sampleJson = {
    tips: [
      {
        topic: "Câu đố",
        level: "Sơ cấp", 
        content: {
          html: "<p><strong>Câu đố thanh điệu:</strong></p><p>Một từ có 4 thanh điệu khác nhau: mā, má, mǎ, mà</p>",
          ops: [{ insert: "Câu đố thanh điệu" }]
        },
        answer: "Đáp án: mā (妈-mẹ), má (麻-gai), mǎ (马-ngựa), mà (骂-chửi)",
        is_pinned: false
      },
      {
        topic: "Ngữ pháp",
        level: "Trung cấp",
        content: {
          html: "<p><strong>Mẹo nhớ 的地得:</strong></p><ul><li>của - Tính từ + của + Danh từ</li><li>một cách - Trạng từ + một cách + Động từ</li><li>đến nỗi - Động từ + đến nỗi + Kết quả</li></ul>",
          ops: [{ insert: "Phân biệt 的地得" }]
        },
        is_pinned: true
        // Lưu ý: Không có "answer" vì không phải "Câu đố"
      }
    ]
  };

  // Reset modal state khi đóng/mở
  useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setValidationErrors([]);
      setPreviewTips([]);
      setUploading(false);
    }
  }, [isOpen]);

  // Validate JSON và parse tips
  const validateAndParseJson = (jsonStr: string): TipPayload[] | null => {
    try {
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.tips || !Array.isArray(parsed.tips)) {
        setValidationErrors(['JSON phải có thuộc tính "tips" là một mảng']);
        return null;
      }

      const errors: string[] = [];
      const validTips: TipPayload[] = [];

      parsed.tips.forEach((tip: any, index: number) => {
        const tipIndex = index + 1;
        let hasErrorForThisTip = false;
        
        // Validate required fields
        if (!tip.topic || typeof tip.topic !== 'string') {
          errors.push(`Tip ${tipIndex}: Thiếu hoặc sai định dạng "topic"`);
          hasErrorForThisTip = true;
        }
        
        if (!tip.level || typeof tip.level !== 'string') {
          errors.push(`Tip ${tipIndex}: Thiếu hoặc sai định dạng "level"`);
          hasErrorForThisTip = true;
        }
        
        if (!tip.content) {
          errors.push(`Tip ${tipIndex}: Thiếu "content"`);
          hasErrorForThisTip = true;
        } else if (typeof tip.content === 'object' && !tip.content.html) {
          errors.push(`Tip ${tipIndex}: "content" phải có thuộc tính "html"`);
          hasErrorForThisTip = true;
        }

        // Validate enum values
        const validTopics = ['Văn hóa', 'Ngữ pháp', 'Từ vựng', 'Phát âm', 'Khẩu ngữ', 'Kỹ năng nghe', 'Kỹ năng đọc', 'Kỹ năng viết', 'Câu đố', 'HSK', 'Câu nói hay', 'Giao tiếp', 'HSKK', 'Ngôn ngữ mạng', 'Du học', 'Hướng dẫn sử dụng', 'Truyện cười'];
        const validLevels = ['Sơ cấp', 'Trung cấp', 'Cao cấp'];

        if (tip.topic && !validTopics.includes(tip.topic)) {
          errors.push(`Tip ${tipIndex}: "topic" không hợp lệ.`);
          hasErrorForThisTip = true;
        }

        if (tip.level && !validLevels.includes(tip.level)) {
          errors.push(`Tip ${tipIndex}: "level" không hợp lệ.`);
          hasErrorForThisTip = true;
        }

        if (tip.topic === 'Câu đố' && (!tip.answer || typeof tip.answer !== 'string')) {
          errors.push(`Tip ${tipIndex}: Chủ đề "Câu đố" phải có "answer"`);
          hasErrorForThisTip = true;
        }

        if (!hasErrorForThisTip) {
          const tipPayload: TipPayload = {
            topic: tip.topic,
            level: tip.level,
            content: tip.content,
            is_pinned: tip.is_pinned || false,
            ...(tip.topic === 'Câu đố' && tip.answer && { answer: tip.answer }),
          };
          validTips.push(tipPayload);
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        return null;
      }

      setValidationErrors([]);
      return validTips;
    } catch (error) {
      setValidationErrors(['JSON không hợp lệ: ' + (error as Error).message]);
      return null;
    }
  };

  // Preview JSON
  const handlePreview = () => {
    const tips = validateAndParseJson(jsonInput);
    if (tips) {
      setPreviewTips(tips);
    } else {
      setPreviewTips([]);
    }
  };

  // Upload tips
  const handleUpload = async () => {
    const tips = validateAndParseJson(jsonInput);
    if (!tips || tips.length === 0) return;

    setUploading(true);
    try {
      const result = await bulkUploadTips(tips);
      onSuccess(result);
    } catch (error) {
      console.error('Lỗi tải lên:', error);
      setValidationErrors(['Lỗi khi tải lên: ' + (error as Error).message]);
      setUploading(false);
    }
  };

  // Download sample JSON
  const downloadSample = () => {
    const dataStr = JSON.stringify(sampleJson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tips-sample.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Tải lên hàng loạt mẹo học tập</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100" disabled={uploading}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Chuẩn bị file JSON theo cấu trúc mẫu.</li>
                <li>Dán nội dung JSON vào ô bên dưới.</li>
                <li>Nhấn "Xem trước" để kiểm tra dữ liệu.</li>
                <li>Nhấn "Tải lên" để import vào hệ thống.</li>
              </ul>
              <button onClick={downloadSample} className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><Download size={14} /> Tải file mẫu</button>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Dán nội dung JSON vào đây..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />

            {validationErrors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 flex items-center gap-2"><AlertCircle size={16} /> Lỗi xác thực:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1 pl-5">
                  {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </div>
            )}

            {previewTips.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 flex items-center gap-2"><CheckCircle size={16} /> Xem trước thành công: {previewTips.length} mẹo</h4>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                  {previewTips.map((tip, i) => (
                    <div key={i} className="bg-white p-2 border border-green-200 rounded-md text-sm">
                      <strong>{tip.topic} ({tip.level}):</strong>
                      <div className="text-gray-600 line-clamp-1" dangerouslySetInnerHTML={{ __html: (tip.content as any)?.html || '' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button onClick={onClose} disabled={uploading} className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
          <button onClick={handlePreview} disabled={uploading || !jsonInput.trim()} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Xem trước</button>
          <button onClick={handleUpload} disabled={uploading || validationErrors.length > 0 || previewTips.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Đang tải...</> : <><Upload size={16} /> Tải lên ({previewTips.length})</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;