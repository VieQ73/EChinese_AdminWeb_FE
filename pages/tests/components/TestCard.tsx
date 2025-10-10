import React from 'react';
import { MockTest } from '../../../types/mocktest';
import { getTestTypeColor, testTypeLabels, formatTestDate, getCompletionStatusInfo, getPublishStatusInfo } from '../utils';
import { Eye, Edit, Copy, Trash2, Clock, Target, Users, CheckCircle, AlertCircle, XCircle, Globe, FileText } from 'lucide-react';

interface TestCardProps {
  test: MockTest;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({
  test,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus
}) => {
  // Lấy thông tin trạng thái
  const completionInfo = getCompletionStatusInfo(
    test.completion_status || 'draft', 
    test.completion_percentage || 0
  );
  const publishInfo = getPublishStatusInfo(
    test.is_active, 
    test.is_active
  );

  // Render icon theo loại
  const renderStatusIcon = (iconType: string, className: string = "w-4 h-4") => {
    switch (iconType) {
      case 'success':
        return <CheckCircle className={className} />;
      case 'warning':
        return <AlertCircle className={className} />;
      case 'inactive':
        return <XCircle className={className} />;
      case 'published':
        return <Globe className={className} />;
      case 'unpublished':
        return <FileText className={className} />;
      case 'draft':
      default:
        return <FileText className={className} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTestTypeColor(test.type)}`}>
                {testTypeLabels[test.type]}
              </span>
              <span className="text-sm text-gray-500">{test.level}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {test.title}
            </h3>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Completion Status */}
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${completionInfo.color}`}>
            {renderStatusIcon(completionInfo.icon, "w-3 h-3 mr-1")}
            {completionInfo.label}
          </div>

          {/* Publish Status */}
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${publishInfo.color}`}>
            {renderStatusIcon(publishInfo.icon, "w-3 h-3 mr-1")}
            {publishInfo.label}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xs text-gray-500">Thời gian</div>
            <div className="text-sm font-medium text-gray-900">{test.total_time_limit}p</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xs text-gray-500">Điểm</div>
            <div className="text-sm font-medium text-gray-900">{test.total_max_score}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xs text-gray-500">Đạt</div>
            <div className="text-sm font-medium text-gray-900">
              {test.passing_score || 'N/A'}
            </div>
          </div>
        </div>

        {/* Instructions Preview */}
        {test.instructions && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {test.instructions}
            </p>
          </div>
        )}

        {/* Meta Info */}
        <div className="text-xs text-gray-500 mb-4">
          Tạo ngày: {formatTestDate(test.created_at)}
        </div>

        {/* Progress Bar for Incomplete Tests */}
        {test.completion_status === 'incomplete' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Tiến độ hoàn thành</span>
              <span>{test.completion_percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${test.completion_percentage || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-end">          
          <div className="flex items-center space-x-1">
            {/* View Test */}
            <button
              onClick={onView}
              className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
              title={test.completion_status === 'draft' ? 'Bắt đầu điền đề' : 'Xem chi tiết đề thi'}
            >
              <Eye className="w-4 h-4" />
            </button>
            {/* Toggle Active Status */}
            <button
              onClick={onToggleStatus}
              className={`p-1.5 rounded-lg transition-colors ${
                test.is_active 
                  ? 'text-green-600 hover:bg-green-100' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={test.is_active ? 'Tạm dừng' : 'Kích hoạt'}
            >
              {test.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </button>

            {/* Publish status is now controlled by is_active */}

            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sao chép"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};