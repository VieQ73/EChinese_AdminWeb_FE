import React, { useState, useRef, useLayoutEffect } from 'react';
import { Post, User } from '../../../../types';
import { ThumbUpIcon, ChatAltIcon, EyeIcon, PencilIcon, TrashIcon, PinIcon, RestoreIcon } from '../../../../constants';
import Badge from '../ui/Badge';
import ClickableUser from '../user/ClickableUser';
import ImageLightbox from '../ui/ImageLightbox'; // Import component mới

interface PostFeedCardProps {
    post: Post;
    currentUser: User | null;
    onViewDetails: (post: Post) => void;
    onEdit: (post: Post) => void;
    onRemove: (post: Post) => void;
    onUserClick: (user: User) => void;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    isLiked: boolean;
    onToggleView: (postId: string, isViewed: boolean) => void;
    isViewed: boolean;
    isRemoved?: boolean;
    onRestore?: (post: Post) => void;
}

const MAX_HEIGHT_PX = 120; // Chiều cao tối đa trước khi hiển thị "Xem thêm"

const PostFeedCard: React.FC<PostFeedCardProps> = ({ 
    post,
    currentUser,
    onViewDetails, 
    onEdit, 
    onRemove, 
    onUserClick, 
    onToggleLike, 
    isLiked,
    onToggleView,
    isViewed,
    isRemoved = false,
    onRestore
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [textHeight, setTextHeight] = useState(0);
    const textRef = useRef<HTMLDivElement>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    useLayoutEffect(() => {
        if (textRef.current) {
            const height = textRef.current.scrollHeight;
            setTextHeight(height);
            const hasImages = post.content?.images?.length > 0;
            setIsOverflowing(height > MAX_HEIGHT_PX || hasImages);
        }
    }, [post.content]);

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return "Vài giây trước";
    };

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleLike(post.id, isLiked); // Truyền trạng thái HIỆN TẠI
    };

    const handleViewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleView(post.id, isViewed); // Truyền trạng thái HIỆN TẠI
    };
    
    const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
        e.stopPropagation();
        setLightboxImage(imageUrl);
    };
    
    const isActuallyRemoved = isRemoved || post.status === 'removed';

    // Một người dùng (kể cả admin) chỉ có thể sửa bài viết của chính họ.
    const canEdit = !isActuallyRemoved && currentUser && currentUser.id === post.user.id;
    
    // Phân quyền gỡ bài viết
    const canRemove = !isActuallyRemoved && currentUser && (
        // Tác giả có thể tự gỡ bài của mình
        currentUser.id === post.user.id ||
        // Super admin có thể gỡ bài của user hoặc admin khác, không gỡ được bài của superadmin
        (currentUser.role === 'super admin' && currentUser.id !== post.user.id && post.user.role !== 'super admin') ||
        // Admin có thể gỡ bài của user hoặc admin khác, không gỡ được bài của superadmin
        (currentUser.role === 'admin' && currentUser.id !== post.user.id && post.user.role !== 'super admin')
    );

    // Bất kỳ ai có quyền đều có thể phục hồi bài trong thùng rác
    const canRestore = isActuallyRemoved && onRestore;

    const fullContentHtml = post.content?.html || 
                           (post.content?.text ? `<p>${post.content.text.replace(/\n/g, '<br>')}</p>` : '');
                           
    const images = post.content?.images || [];
    const imageGridClass = images.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

    return (
        <>
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200`}>
                {/* Header */}
                <div className="p-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <ClickableUser userId={post.user.id} onUserClick={onUserClick} fallbackUser={post.user}>
                            <img 
                                src={post.user.avatar_url || `https://picsum.photos/seed/${post.user_id}/100`} 
                                alt={post.user.name} 
                                className="w-12 h-12 rounded-full"
                            />
                        </ClickableUser>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                                    
                             <ClickableUser userId={post.user.id} onUserClick={onUserClick} fallbackUser={post.user}>
                                    <span className="font-semibold text-gray-900 hover:underline">{post.user.name}</span>
                               </ClickableUser>
                               {post.badge && <Badge badge={post.badge} />}
                               {isActuallyRemoved && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                        Đã gỡ
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                               {timeAgo(post.created_at)} · <span className="font-medium text-gray-600">{post.topic}</span>
                            </p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                         {post.is_pinned && !isActuallyRemoved && <span title="Đã ghim"><PinIcon className="w-5 h-5 text-yellow-500" /></span>}
                         {canRestore && (
                            <button onClick={() => onRestore && onRestore(post)} className="p-1.5 text-green-500 hover:text-green-700 rounded-md hover:bg-green-100" title="Phục hồi bài viết">
                                <RestoreIcon className="w-5 h-5" />
                            </button>
                         )}
                         {canEdit && <button onClick={() => onEdit(post)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100" title="Sửa"><PencilIcon className="w-4 h-4" /></button>}
                         {canRemove && <button onClick={() => onRemove(post)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100" title="Gỡ bài"><TrashIcon className="w-4 h-4" /></button>}
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 pb-2">
                    <h3 className={`text-lg font-bold text-gray-800 cursor-pointer hover:text-primary-600 transition-colors`} onClick={() => onViewDetails(post)}>{post.title}</h3>
                    
                    <div className="relative mt-1">
                        <div
                            ref={textRef}
                            className="text-gray-700 prose prose-sm max-w-none leading-relaxed overflow-hidden transition-all duration-300"
                            style={{ maxHeight: !isExpanded && textHeight > MAX_HEIGHT_PX ? `${MAX_HEIGHT_PX}px` : 'none' }}
                            dangerouslySetInnerHTML={{ __html: fullContentHtml }}
                        />
                        
                        {isExpanded && images.length > 0 && (
                            <div className={`mt-4 grid ${imageGridClass} gap-2`}>
                                {images.map((image, index) => (
                                    <div 
                                        key={index}
                                        className="relative overflow-hidden rounded-lg cursor-pointer group max-h-[800px]"
                                        onClick={(e) => handleImageClick(e, image)}
                                    >
                                        <img
                                            src={image}
                                            alt={`Hình ảnh ${index + 1}`}
                                            className="w-full h-auto object-contain border transition-transform duration-300 group-hover:scale-105"
                                            style={{ objectPosition: 'top' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isExpanded && isOverflowing && (
                            <div className="text-center mt-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                    className="px-4 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                                >
                                    Thu gọn
                                </button>
                            </div>
                        )}
                        
                        {isOverflowing && !isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-2 pointer-events-none">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                                    className="px-4 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors pointer-events-auto"
                                >
                                    Xem thêm...
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Stats */}
                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <ThumbUpIcon className="w-4 h-4 text-blue-500"/>
                        <span>{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="space-x-4">
                        <span>{post.comment_count?.toLocaleString() || 0} bình luận</span>
                        <span>{post.views.toLocaleString()} lượt xem</span>
                    </div>
                </div>
                
                {/* Footer Actions */}
                <div className={`p-2 border-t border-gray-200 grid grid-cols-3 gap-1 ${isActuallyRemoved ? 'pointer-events-none opacity-50' : ''}`}>
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center justify-center p-2 rounded-lg font-semibold transition-colors ${isLiked ? 'text-primary-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ThumbUpIcon className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} /> {isLiked ? 'Đã thích' : 'Thích'}
                    </button>
                     <button onClick={() => onViewDetails(post)} className="flex items-center justify-center p-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                        <ChatAltIcon className="w-5 h-5 mr-2" /> Bình luận
                    </button>
                     <button onClick={handleViewClick} className={`flex items-center justify-center p-2 rounded-lg font-semibold transition-colors ${isViewed ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <EyeIcon className="w-5 h-5 mr-2" /> {isViewed ? 'Đã xem' : 'Xem'}
                    </button>
                </div>
            </div>
            <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
        </>
    );
};

export default PostFeedCard;