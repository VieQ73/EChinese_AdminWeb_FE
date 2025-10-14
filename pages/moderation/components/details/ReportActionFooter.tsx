import React from 'react';
import { Report } from '../../../../types';
import { ShieldCheckIcon, XCircleIcon } from '../../../../constants';
import { PlayCircle } from 'lucide-react';

interface ReportActionFooterProps {
  report: Report;
  view: 'details' | 'resolve' | 'dismiss';
  isActionable: boolean;
  canStartProcessing: boolean; 
  onStartProcessing: () => void;
  onDismiss: () => void;
  onResolve: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  isConfirmDisabled: boolean;
}

const ReportActionFooter: React.FC<ReportActionFooterProps> = ({
  report,
  view,
  isActionable,
  canStartProcessing,
  onStartProcessing,
  onDismiss,
  onResolve,
  onCancel,
  onConfirm,
  isConfirmDisabled,
}) => {
  if (!isActionable) {
    return (
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Đóng
        </button>
      </div>
    );
  }

  if (view === 'details') {
    return (
      <div className="flex flex-wrap gap-2 justify-end">
        {canStartProcessing && (
          <button
            onClick={onStartProcessing}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <PlayCircle className="w-4 h-4 mr-2 text-gray-500" />
            Bắt đầu xử lý
          </button>
        )}
        <button
          onClick={onDismiss}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          <XCircleIcon className="w-4 h-4 mr-2 text-gray-500" />
          Bỏ qua
        </button>
        <button
          onClick={onResolve}
          className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 transition"
        >
          <ShieldCheckIcon className="w-4 h-4 mr-2" />
          Giải quyết
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
      >
        Hủy
      </button>
      <button
        onClick={onConfirm}
        disabled={isConfirmDisabled}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
          view === 'resolve'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        } ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {view === 'resolve' ? 'Xác nhận giải quyết' : 'Xác nhận bỏ qua'}
      </button>
    </div>
  );
};

export default ReportActionFooter;
