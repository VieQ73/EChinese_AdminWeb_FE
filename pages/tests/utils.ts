export const testTypeLabels = {
  'HSK': 'HSK',
  'TOCFL': 'TOCFL', 
  'D4': 'D4',
  'HSKK': 'HSKK'
} as const;

export const getTestTypeColor = (type: string) => {
  const colors = {
    'HSK': 'bg-blue-100 text-blue-800',
    'TOCFL': 'bg-green-100 text-green-800',
    'D4': 'bg-purple-100 text-purple-800',
    'HSKK': 'bg-orange-100 text-orange-800'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const formatTestDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const formatTestTime = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours} giờ`;
};

// Thông tin trạng thái hoàn thành
export const getCompletionStatusInfo = (status: string, percentage: number) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Bản nháp',
        color: 'bg-gray-100 text-gray-700',
        icon: 'draft',
        description: 'Chưa bắt đầu'
      };
    case 'incomplete':
      return {
        label: `Chưa hoàn thành (${percentage}%)`,
        color: 'bg-yellow-100 text-yellow-700',
        icon: 'warning',
        description: 'Thiếu thông tin'
      };
    case 'completed':
      return {
        label: 'Hoàn thành',
        color: 'bg-green-100 text-green-700',
        icon: 'success',
        description: 'Đã đầy đủ thông tin'
      };
    case 'reviewed':
      return {
        label: 'Đã duyệt',
        color: 'bg-blue-100 text-blue-700',
        icon: 'success',
        description: 'Sẵn sàng sử dụng'
      };
    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-600',
        icon: 'draft',
        description: ''
      };
  }
};

// Thông tin trạng thái xuất bản
export const getPublishStatusInfo = (isPublished: boolean, isActive: boolean) => {
  if (!isActive) {
    return {
      label: 'Tạm dừng',
      color: 'bg-red-100 text-red-700',
      icon: 'inactive',
      description: 'Không hoạt động'
    };
  }
  
  if (isPublished) {
    return {
      label: 'Đã xuất bản',
      color: 'bg-green-100 text-green-700',
      icon: 'published',
      description: 'Hiển thị với người dùng'
    };
  }
  
  return {
    label: 'Chưa xuất bản',
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'unpublished',
    description: 'Chỉ admin xem được'
  };
};