/**
 * Debug utility để kiểm tra trạng thái likes/views của users
 */

import { getUserLikedPosts, getUserViewedPosts } from './userInteractions';

// Debug function - chỉ dùng cho development
export const debugUserInteractions = () => {
  console.log('=== DEBUG USER INTERACTIONS ===');
  
  // Super Admin
  const superAdminId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const superAdminLikes = getUserLikedPosts(superAdminId);
  const superAdminViews = getUserViewedPosts(superAdminId);
  
  console.log('Super Admin:', {
    id: superAdminId,
    likedPosts: superAdminLikes,
    viewedPosts: superAdminViews
  });
  
  // Admin
  const adminId = 'b2c3d4e5-f6a7-8901-2345-67890abcdef0';
  const adminLikes = getUserLikedPosts(adminId);
  const adminViews = getUserViewedPosts(adminId);
  
  console.log('Admin:', {
    id: adminId,
    likedPosts: adminLikes,
    viewedPosts: adminViews
  });
  
  return {
    superAdmin: { likes: superAdminLikes, views: superAdminViews },
    admin: { likes: adminLikes, views: adminViews }
  };
};

// Export để dùng trong component
export default debugUserInteractions;