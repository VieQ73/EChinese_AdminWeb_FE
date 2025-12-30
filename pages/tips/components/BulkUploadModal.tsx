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

  // Validate JSON và parse tips - Cho phép partial success
  const validateAndParseJson = (jsonStr: string): { validTips: TipPayload[]; errors: string[]; skippedCount: number } | null => {
    try {
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.tips || !Array.isArray(parsed.tips)) {
        setValidationErrors(['JSON phải có thuộc tính "tips" là một mảng']);
        return null;
      }

      const errors: string[] = [];
      const validTips: TipPayload[] = [];
      let skippedCount = 0;

      parsed.tips.forEach((tip: any, index: number) => {
        const tipIndex = index + 1;
        const tipErrors: string[] = [];
        
        // Validate required fields
        if (!tip.topic || typeof tip.topic !== 'string') {
          tipErrors.push(`Thiếu hoặc sai định dạng "topic"`);
        }
        
        if (!tip.level || typeof tip.level !== 'string') {
          tipErrors.push(`Thiếu hoặc sai định dạng "level"`);
        }
        
        if (!tip.content) {
          tipErrors.push(`Thiếu "content"`);
        } else if (typeof tip.content === 'object' && !tip.content.html) {
          tipErrors.push(`"content" phải có thuộc tính "html"`);
        }

        // Validate enum values
        const validTopics = ['Văn hóa', 'Ngữ pháp', 'Từ vựng', 'Phát âm', 'Khẩu ngữ', 'Kỹ năng nghe', 'Kỹ năng đọc', 'Kỹ năng viết', 'Câu đố', 'HSK', 'Câu nói hay', 'Giao tiếp', 'HSKK', 'Ngôn ngữ mạng', 'Du học', 'Hướng dẫn sử dụng', 'Truyện cười', 'Mỗi ngày một đoạn văn'];
        const validLevels = ['Sơ cấp', 'Trung cấp', 'Cao cấp'];

        if (tip.topic && !validTopics.includes(tip.topic)) {
          tipErrors.push(`"topic" không hợp lệ`);
        }

        if (tip.level && !validLevels.includes(tip.level)) {
          tipErrors.push(`"level" không hợp lệ`);
        }

        if (tip.topic === 'Câu đố' && (!tip.answer || typeof tip.answer !== 'string')) {
          tipErrors.push(`Chủ đề "Câu đố" phải có "answer"`);
        }

        // Nếu có lỗi → Bỏ qua tip này và ghi log
        if (tipErrors.length > 0) {
          errors.push(`Tip ${tipIndex} (bỏ qua): ${tipErrors.join(', ')}`);
          skippedCount++;
        } else {
          // Tip hợp lệ → Thêm vào danh sách
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

      // Cập nhật errors (warnings về các tip bị bỏ qua)
      setValidationErrors(errors);

      // Trả về kết quả ngay cả khi có lỗi (partial success)
      return { validTips, errors, skippedCount };
    } catch (error) {
      setValidationErrors(['JSON không hợp lệ: ' + (error as Error).message]);
      return null;
    }
  };

  // Preview JSON
  const handlePreview = () => {
    const result = validateAndParseJson(jsonInput);
    if (result) {
      setPreviewTips(result.validTips);
    } else {
      setPreviewTips([]);
    }
  };

  // Upload tips
  const handleUpload = async () => {
    const result = validateAndParseJson(jsonInput);
    if (!result || result.validTips.length === 0) return;

    setUploading(true);
    try {
      const uploadResult = await bulkUploadTips(result.validTips);
      onSuccess({
        ...uploadResult,
        skipped_count: result.skippedCount,
        skipped_errors: result.errors
      });
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
          <h2 className="text-xl font-bold">Tải lên hàng loạt câu đố, bài đọc và mẹo</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100" disabled={uploading}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Tải file mẫu để xem cấu trúc JSON.</li>
                <li>Chọn file JSON từ máy tính hoặc dán nội dung vào ô bên dưới.</li>
                <li>Nhấn "Xem trước" để kiểm tra dữ liệu.</li>
                <li>Nhấn "Tải lên" để import vào hệ thống.</li>
              </ul>
              <button onClick={downloadSample} className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><Download size={14} /> Tải file mẫu JSON</button>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Tải lên file JSON
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        setJsonInput(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-gray-500">Hoặc dán nội dung JSON vào ô bên dưới</p>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Dán nội dung JSON vào đây..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />

            {validationErrors.length > 0 && previewTips.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                  <AlertCircle size={16} /> 
                  Cảnh báo: {validationErrors.length} mẹo bị bỏ qua
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Các mẹo sau có lỗi và sẽ không được tải lên:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-1 space-y-1 pl-5 max-h-32 overflow-y-auto">
                  {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </div>
            )}

            {validationErrors.length > 0 && previewTips.length === 0 && (
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <h4 className="font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle size={16} /> 
                  Lỗi: Không có mẹo hợp lệ
                </h4>
                <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1 pl-5 max-h-32 overflow-y-auto">
                  {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </div>
            )}

            {previewTips.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle size={16} /> 
                  Sẵn sàng tải lên: {previewTips.length} mẹo hợp lệ
                  {validationErrors.length > 0 && (
                    <span className="text-yellow-700 text-sm font-normal">
                      ({validationErrors.length} mẹo bị bỏ qua)
                    </span>
                  )}
                </h4>
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
          <button onClick={handleUpload} disabled={uploading || previewTips.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Đang tải...</> : <><Upload size={16} /> Tải lên ({previewTips.length} mẹo)</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;