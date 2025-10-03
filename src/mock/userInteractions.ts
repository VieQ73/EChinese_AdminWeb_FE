import { mockPostLikes } from './postLikes';
import { mockPostViews } from './postViews';
import { mockComments } from './comments';

// Dữ liệu tương tác của user với posts (likes, views, comments)
export interface UserInteraction {
  user_id: string;
  post_id: string;
  type: 'like' | 'view' | 'comment';
  interaction_date: string;
}

// Tạo mock data từ PostLikes, PostViews và Comments
const createUserInteractionsFromMockData = (): UserInteraction[] => {
  const interactions: UserInteraction[] = [];

  // Thêm interactions từ PostLikes
  mockPostLikes.forEach(like => {
    interactions.push({
      user_id: like.user_id,
      post_id: like.post_id,
      type: 'like',
      interaction_date: like.created_at
    });
  });

  // Thêm interactions từ PostViews (chỉ những views có user_id)
  mockPostViews.forEach(view => {
    if (view.user_id) {
      interactions.push({
        user_id: view.user_id,
        post_id: view.post_id,
        type: 'view',
        interaction_date: view.viewed_at
      });
    }
  });

  // Thêm interactions từ Comments
  mockComments.forEach(comment => {
    interactions.push({
      user_id: comment.user_id,
      post_id: comment.post_id,
      type: 'comment',
      interaction_date: comment.created_at
    });
  });

  return interactions;
};

export const mockUserInteractions: UserInteraction[] = createUserInteractionsFromMockData();

// Helper functions để lấy dữ liệu interactions
export const getUserInteractions = (userId: string) => {
  return mockUserInteractions.filter(interaction => interaction.user_id === userId);
};

export const getPostInteractionByUser = (userId: string, postId: string, type: 'like' | 'view' | 'comment') => {
  return mockUserInteractions.find(
    interaction => interaction.user_id === userId && interaction.post_id === postId && interaction.type === type
  );
};

// Lấy tất cả bài viết mà user đã like
export const getUserLikedPosts = (userId: string): string[] => {
  return mockUserInteractions
    .filter(interaction => interaction.user_id === userId && interaction.type === 'like')
    .map(interaction => interaction.post_id);
};

// Lấy tất cả bài viết mà user đã xem
export const getUserViewedPosts = (userId: string): string[] => {
  return mockUserInteractions
    .filter(interaction => interaction.user_id === userId && interaction.type === 'view')
    .map(interaction => interaction.post_id);
};

// Lấy tất cả bài viết mà user đã comment
export const getUserCommentedPosts = (userId: string): string[] => {
  return [...new Set(mockUserInteractions
    .filter(interaction => interaction.user_id === userId && interaction.type === 'comment')
    .map(interaction => interaction.post_id))];
};

// Lấy bài viết mà user đã comment nhưng không phải bài của chính user đó
export const getUserCommentedOthersPosts = (userId: string, userOwnPosts: string[]): string[] => {
  return mockUserInteractions
    .filter(interaction => 
      interaction.user_id === userId && 
      interaction.type === 'comment' && 
      !userOwnPosts.includes(interaction.post_id)
    )
    .map(interaction => interaction.post_id);
};

// Lấy bài viết mà user đã xem nhưng không phải bài của chính user đó
export const getUserViewedOthersPosts = (userId: string, userOwnPosts: string[]): string[] => {
  return mockUserInteractions
    .filter(interaction => 
      interaction.user_id === userId && 
      interaction.type === 'view' && 
      !userOwnPosts.includes(interaction.post_id)
    )
    .map(interaction => interaction.post_id);
};