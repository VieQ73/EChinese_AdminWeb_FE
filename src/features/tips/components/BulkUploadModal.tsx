import React, { useState } from 'react';
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
          html: "<p><strong>Mẹo nhớ 的地得:</strong></p><ul><li>的 - Tính từ + 的 + Danh từ</li><li>地 - Trạng từ + 地 + Động từ</li><li>得 - Động từ + 得 + Kết quả</li></ul>",
          ops: [{ insert: "Phân biệt 的地得" }]
        },
        is_pinned: true
        // Lưu ý: Không có "answer" vì không phải "Câu đố"
      }
    ]
  };

  // Reset modal state khi đóng/mở
  React.useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setValidationErrors([]);
      setPreviewTips([]);
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
        
        // Validate required fields
        if (!tip.topic || typeof tip.topic !== 'string') {
          errors.push(`Tip ${tipIndex}: Thiếu hoặc sai định dạng "topic"`);
        }
        
        if (!tip.level || typeof tip.level !== 'string') {
          errors.push(`Tip ${tipIndex}: Thiếu hoặc sai định dạng "level"`);
        }
        
        if (!tip.content) {
          errors.push(`Tip ${tipIndex}: Thiếu "content"`);
        } else if (typeof tip.content === 'object' && !tip.content.html) {
          errors.push(`Tip ${tipIndex}: "content" phải có thuộc tính "html"`);
        }

        // Validate enum values
        const validTopics = ['Văn hóa', 'Ngữ pháp', 'Từ vựng', 'Phát âm', 'Khẩu ngữ', 'Kỹ năng nghe', 'Kỹ năng đọc', 'Kỹ năng viết', 'Câu đố', 'HSK', 'Câu nói hay', 'Giao tiếp', 'HSKK', 'Ngôn ngữ mạng', 'Du học', 'Hướng dẫn sử dụng', 'Truyện cười'];
        const validLevels = ['Sơ cấp', 'Trung cấp', 'Cao cấp'];

        if (tip.topic && !validTopics.includes(tip.topic)) {
          errors.push(`Tip ${tipIndex}: "topic" không hợp lệ. Phải là một trong: ${validTopics.join(', ')}`);
        }

        if (tip.level && !validLevels.includes(tip.level)) {
          errors.push(`Tip ${tipIndex}: "level" không hợp lệ. Phải là một trong: ${validLevels.join(', ')}`);
        }

        // Validate answer for riddles
        if (tip.topic === 'Câu đố' && (!tip.answer || typeof tip.answer !== 'string')) {
          errors.push(`Tip ${tipIndex}: Chủ đề "Câu đố" phải có "answer"`);
        }

        if (errors.length === 0 || errors.filter(e => e.includes(`Tip ${tipIndex}:`)).length === 0) {
          const tipPayload: any = {
            topic: tip.topic,
            level: tip.level,
            content: tip.content,
            is_pinned: tip.is_pinned || false
          };

          // CHỈ thêm answer nếu là chủ đề "Câu đố"
          if (tip.topic === 'Câu đố' && tip.answer) {
            tipPayload.answer = tip.answer;
          }

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
      onClose();
    } catch (error) {
      console.error('Lỗi tải lên:', error);
      setValidationErrors(['Lỗi khi tải lên: ' + (error as Error).message]);
    } finally {
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
        
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold leading-none tracking-tight">
            Tải lên hàng loạt mẹo học tập
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 bg-gray-100 hover:bg-gray-200"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn tải lên</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Chuẩn bị file JSON theo cấu trúc mẫu</li>
                <li>• Nhập/dán nội dung JSON vào ô bên dưới</li>
                <li>• Nhấn &quot;Xem trước&quot; để kiểm tra dữ liệu</li>
                <li>• Nhấn &quot;Tải lên&quot; để import vào hệ thống</li>
              </ul>
              
              <button
                onClick={downloadSample}
                className="mt-3 flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={14} />
                Tải file mẫu JSON
              </button>
            </div>

            {/* Sample JSON Structure */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Cấu trúc JSON
              </h3>
              <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{JSON.stringify(sampleJson, null, 2)}</pre>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p><strong>Ghi chú schema Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>topic:</strong> Enum theo learning.dbml - Văn hóa, Ngữ pháp, Từ vựng, Phát âm, Khẩu ngữ, Kỹ năng nghe, Kỹ năng đọc, Kỹ năng viết, Câu đố, HSK, Câu nói hay, Giao tiếp, HSKK, Ngôn ngữ mạng, Du học, Hướng dẫn sử dụng, Truyện cười</li>
                  <li><strong>level:</strong> Enum - &quot;Sơ cấp&quot;, &quot;Trung cấp&quot;, &quot;Cao cấp&quot;</li>
                  <li><strong>content:</strong> JSONB - Rich text với html và ops</li>
                  <li><strong>answer:</strong> TEXT - CHỈ dành cho chủ đề &quot;Câu đố&quot;, các chủ đề khác KHÔNG có trường này</li>
                  <li><strong>is_pinned:</strong> BOOLEAN - Ghim tip lên đầu danh sách (mặc định false)</li>
                </ul>
              </div>
            </div>

            {/* JSON Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">
                Nhập JSON <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Dán nội dung JSON vào đây..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800">Lỗi validation:</h4>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Results */}
            {previewTips.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800">
                      Xem trước thành công: {previewTips.length} mẹo
                    </h4>
                    <div className="mt-2 space-y-2">
                      {previewTips.map((tip, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-green-200">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {tip.topic}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              {tip.level}
                            </span>
                            {tip.is_pinned && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Đã ghim
                              </span>
                            )}
                          </div>
                          <div 
                            className="mt-2 text-sm text-gray-700 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: typeof tip.content === 'object' ? tip.content.html : tip.content 
                            }}
                          />
                          {tip.answer && (
                            <p className="mt-1 text-xs text-gray-600">
                              <strong>Đáp án:</strong> {tip.answer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          
          <button
            onClick={handlePreview}
            disabled={uploading || !jsonInput.trim()}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FileText size={16} />
            Xem trước
          </button>
          
          <button
            onClick={handleUpload}
            disabled={uploading || previewTips.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload size={16} />
                Tải lên ({previewTips.length} mẹo)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;