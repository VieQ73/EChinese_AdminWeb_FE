import React from 'react';

type StatusType = 'pending' | 'in_progress' | 'resolved' | 'dismissed' | 'accepted' | 'rejected' | 'low' | 'medium' | 'high';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusInfo = (st: StatusType) => {
    switch (st) {
      // Report & Appeal Status
      case 'pending': return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
      case 'in_progress': return { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' };
      case 'resolved': return { text: 'Đã giải quyết', color: 'bg-green-100 text-green-800' };
      case 'dismissed': return { text: 'Đã bỏ qua', color: 'bg-gray-100 text-gray-800' };
      case 'accepted': return { text: 'Chấp nhận', color: 'bg-green-100 text-green-800' };
      case 'rejected': return { text: 'Từ chối', color: 'bg-red-100 text-red-800' };
      // Violation Severity
      case 'low': return { text: 'Thấp', color: 'bg-blue-100 text-blue-800' };
      case 'medium': return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' };
      case 'high': return { text: 'Cao', color: 'bg-red-100 text-red-800' };
      default: return { text: st, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const { text, color } = getStatusInfo(status);

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
