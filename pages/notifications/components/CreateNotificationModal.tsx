import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';

interface CreateNotificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    audience: 'user' as 'user' | 'admin' | 'all',
    recipient_id: '',
    type: 'system',
    title: '',
    message: '',
    priority: 1,
    auto_push: true,
    expires_at: '',
    data: {} as Record<string, string>
  });

  const [dataFields, setDataFields] = useState<Array<{ key: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }

    if (!formData.message.trim()) {
      setError('Nội dung không được để trống');
      return;
    }

    if (formData.audience === 'user' && !formData.recipient_id.trim()) {
      setError('Vui lòng nhập ID người nhận');
      return;
    }

    try {
      setLoading(true);

      // Build data object from fields
      const dataObj: Record<string, string> = {};
      dataFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          dataObj[field.key.trim()] = field.value.trim();
        }
      });

      const payload: any = {
        audience: formData.audience,
        type: formData.type,
        title: formData.title.trim(),
        content: {
          message: formData.message.trim()
        },
        priority: formData.priority,
        auto_push: formData.auto_push
      };

      if (formData.audience === 'user') {
        payload.recipient_id = formData.recipient_id.trim();
      }

      if (Object.keys(dataObj).length > 0) {
        payload.data = dataObj;
      }

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString();
      }

      await apiClient.post('/notifications', payload);
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo thông báo');
    } finally {
      setLoading(false);
    }
  };

  const addDataField = () => {
    setDataFields([...dataFields, { key: '', value: '' }]);
  };

  const removeDataField = (index: number) => {
    setDataFields(dataFields.filter((_, i) => i !== index));
  };

  const updateDataField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...dataFields];
    newFields[index][field] = value;
    setDataFields(newFields);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Tạo thông báo mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng nhận <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="user">Người dùng cụ thể</option>
              <option value="admin">Tất cả Admin</option>
              <option value="all">Tất cả (Broadcast)</option>
            </select>
          </div>

          {/* Recipient ID (only for user) */}
          {formData.audience === 'user' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.recipient_id}
                onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
                placeholder="UUID của người dùng"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Ví dụ: 550e8400-e29b-41d4-a716-446655440000
              </p>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại thông báo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="system">Hệ thống</option>
              <option value="community">Cộng đồng</option>
              <option value="comment_ban">Cấm bình luận</option>
              <option value="achievement">Thành tích</option>
              <option value="subscription">Đăng ký</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề thông báo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Nhập nội dung thông báo"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ ưu tiên
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Thấp</option>
              <option value={2}>Trung bình</option>
              <option value={3}>Cao</option>
            </select>
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian hết hạn (tùy chọn)
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Dữ liệu bổ sung (tùy chọn)
              </label>
              <button
                type="button"
                onClick={addDataField}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Thêm trường
              </button>
            </div>
            {dataFields.map((field, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateDataField(index, 'key', e.target.value)}
                  placeholder="Key"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => updateDataField(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeDataField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Auto Push */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto_push"
              checked={formData.auto_push}
              onChange={(e) => setFormData({ ...formData, auto_push: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_push" className="text-sm text-gray-700">
              Tự động gửi push notification
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
