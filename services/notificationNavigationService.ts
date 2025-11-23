import { apiClient } from './apiClient';

/**
 * Service để xử lý điều hướng từ thông báo đến chi tiết post/comment
 */

interface PostResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    user_id: string;
    deleted_at?: string | null;
    deleted_by?: string | null;
  };
}

interface CommentResponse {
  success: boolean;
  data: {
    id: string;
    post_id: string;
    user_id: string;
    deleted_at?: string | null;
    deleted_by?: string | null;
  };
}

// Callback để mở modal từ bên ngoài
let openPostModalCallback: ((postId: string) => void) | null = null;

export const setOpenPostModalCallback = (callback: (postId: string) => void) => {
  openPostModalCallback = callback;
};

export const openPostModal = (postId: string) => {
  if (openPostModalCallback) {
    openPostModalCallback(postId);
  } else {
    console.warn('⚠️ [openPostModal] Callback not set');
  }
};

/**
 * Lấy thông tin chi tiết bài viết
 * 
 * API Endpoint: GET /community/posts/:postId
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     status: 'published' | 'removed' | 'draft',
 *     user_id: string,
 *     deleted_at: string | null,
 *     deleted_by: string | null,
 *     ... other post fields
 *   }
 * }
 */
export const getPostById = async (postId: string): Promise<PostResponse> => {
  try {
    const response = await apiClient.get<PostResponse>(`/community/posts/${postId}`);
    return response;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết comment
 * 
 * API Endpoint: GET /community/comments/:commentId
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     post_id: string,
 *     user_id: string,
 *     deleted_at: string | null,
 *     deleted_by: string | null,
 *     ... other comment fields
 *   }
 * }
 */
export const getCommentById = async (commentId: string): Promise<CommentResponse> => {
  try {
    const response = await apiClient.get<CommentResponse>(`/community/comments/${commentId}`);
    return response;
  } catch (error) {
    console.error('Error fetching comment:', error);
    throw error;
  }
};

/**
 * Xử lý điều hướng từ thông báo
 * 
 * @param type - Loại thông báo: 'post', 'post_remove', 'comment', 'comment_remove'
 * @param id - ID của post hoặc comment
 * @param navigate - Hàm navigate từ react-router
 * @param notificationData - Toàn bộ data của notification (optional, để lấy post_id nếu có)
 * @returns URL để điều hướng
 */
export const handleNotificationNavigation = async (
  type: string,
  id: string,
  navigate: (url: string) => void,
  notificationData?: any
): Promise<void> => {
  console.log('🚀 [handleNotificationNavigation] Starting navigation...', { type, id, notificationData });
  
  try {
    if (type === 'post' || type === 'post_remove') {
      console.log('📝 [handleNotificationNavigation] Handling post navigation...');
      // Lấy thông tin bài viết
      const postResponse = await getPostById(id);
      const post = postResponse.data;
      console.log('📥 [handleNotificationNavigation] Got post:', post);

      // Kiểm tra trạng thái bài viết
      if (post.status === 'removed' || post.deleted_at) {
        console.log('🚫 [handleNotificationNavigation] Post is removed, navigating to user removed tab');
        // Bài viết bị gỡ -> chuyển đến tab "Đã gỡ" của user
        navigate(`/community?user=${post.user_id}&tab=removed`);
      } else {
        console.log('✅ [handleNotificationNavigation] Post is active, navigating to post detail');
        // Bài viết bình thường -> mở chi tiết bài viết
        navigate(`/community?post=${id}`);
      }
    } else if (type === 'comment' || type === 'comment_remove') {
      console.log('💬 [handleNotificationNavigation] Handling comment navigation...');
      
      // Kiểm tra xem có post_id trong notificationData không (để tránh gọi API không cần thiết)
      const postIdFromData = notificationData?.post_id;
      
      if (postIdFromData) {
        console.log('✅ [handleNotificationNavigation] Found post_id in notification data:', postIdFromData);
        // Có post_id trong data -> điều hướng trực tiếp
        navigate(`/community?post=${postIdFromData}&comment=${id}`);
      } else {
        console.log('🔄 [handleNotificationNavigation] No post_id in data, fetching comment...');
        // Không có post_id -> phải gọi API lấy thông tin comment
        const commentResponse = await getCommentById(id);
        const comment = commentResponse.data;
        console.log('📥 [handleNotificationNavigation] Got comment:', comment);

        // Kiểm tra trạng thái comment
        if (comment.deleted_at) {
          console.log('🚫 [handleNotificationNavigation] Comment is deleted, navigating to user removed tab');
          // Comment bị gỡ -> chuyển đến tab "Đã gỡ" của user
          navigate(`/community?user=${comment.user_id}&tab=removed`);
        } else {
          console.log('✅ [handleNotificationNavigation] Comment is active, navigating to post with comment');
          // Comment bình thường -> mở bài viết chứa comment và scroll đến comment
          navigate(`/community?post=${comment.post_id}&comment=${id}`);
        }
      }
    } else {
      console.warn('⚠️ [handleNotificationNavigation] Unknown type, navigating to community');
      // Type không hợp lệ -> chuyển về trang community
      navigate('/community');
    }
  } catch (error) {
    console.error('❌ [handleNotificationNavigation] Error:', error);
    // Nếu có lỗi (ví dụ: không tìm thấy post/comment) -> chuyển về trang community
    navigate('/community');
  }
};

/**
 * Kiểm tra xem có nên hiển thị nút điều hướng không
 * 
 * @param type - Loại thông báo
 * @returns true nếu nên hiển thị nút
 */
export const shouldShowNavigationButton = (type: string): boolean => {
  const allowedTypes = ['post', 'post_remove', 'comment', 'comment_remove'];
  return allowedTypes.includes(type);
};
