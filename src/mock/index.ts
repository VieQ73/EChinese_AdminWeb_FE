// Export tất cả mock data
export * from './badgeLevels';
export * from './users';
export * from './posts';
export * from './comments';
export * from './postLikes';
export * from './postViews';
export * from './userInteractions';
export * from './tips';

// Helper function để format thời gian
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};