import React from 'react';

// Hợp nhất các loại trạng thái từ Payment và Refund
type StatusType = 
    'pending' | 'successful' | 'failed' | 'refunded' | 'manual_confirmed' | 'partially-refunded' | // Trạng thái thanh toán
    'completed' | 'rejected' | // Trạng thái hoàn tiền
    string;

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusInfo = (st: StatusType) => {
    switch (st) {
      // Trạng thái chung
      case 'pending':
        return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
      
      // Trạng thái dành cho Giao dịch (Payment)
      case 'successful':
        return { text: 'Thành công', color: 'bg-green-100 text-green-800' };
      case 'manual_confirmed':
        return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' };
      case 'failed':
        return { text: 'Thất bại', color: 'bg-red-100 text-red-800' };
      case 'refunded':
        return { text: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' };
       case 'partially-refunded':
        return { text: 'Hoàn tiền một phần', color: 'bg-purple-100 text-purple-800' };

      // Trạng thái dành cho Hoàn tiền (Refund)
      case 'completed':
        return { text: 'Đã hoàn tất', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { text: 'Đã từ chối', color: 'bg-red-100 text-red-800' };

      default:
        return { text: st, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const { text, color } = getStatusInfo(status);

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
