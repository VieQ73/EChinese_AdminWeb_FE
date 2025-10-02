import React from 'react';
import type { Post } from '../../../types/entities';
import CommentItem from './CommentItem';
import { useBadgeLevels } from '../../badges/useBadgeLevels';
import { useUser } from '../../users/useUserCache';
import { useBadgeList } from '../../badges/useBadgeList';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '../../users/components/DropdownMenu';
import { MoreVertical, Heart, MessageCircle } from 'lucide-react';
import UserCommunityModal from './UserCommunityModal';

// --- Small helper for relative time (unchanged) ---
function timeAgo(iso?: string){
  if(!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff/60000);
  if(mins < 1) return 'vừa xong';
  if(mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs/24);
  return `${days} ngày trước`;
}

// --- ActionMenu component (minimal styling changes for consistency) ---
const ActionMenu: React.FC<{ post: Post; onRemove?: (p: Post)=>void; onEdit?: (p: Post)=>void; onRestore?: (p: Post)=>void; onHardDelete?: (p: Post)=>void }> = ({ post, onRemove, onEdit, onRestore, onHardDelete }) => {
  const currentUser = useAuth();
  const isOwner = currentUser?.id === post.user_id;
  const isSuperAdmin = currentUser?.role === 'super admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
  // determine granular permissions per spec
  const postOwnerRole = (post as any).user_role || 'user';
  const selfDeleted = (post as any).removed_kind === 'self' || false;
  const canEdit = isOwner && !post.deleted_at;
  const canRemove = (isOwner && !post.deleted_at) || (isAdmin && !isOwner && !post.deleted_at && postOwnerRole === 'user');
  // admins cannot remove other admins' posts; superadmin can
  const canRestore = isAdmin && !!post.deleted_at && !selfDeleted && !(postOwnerRole === 'admin' && !isSuperAdmin);
  const canHardDelete = isSuperAdmin && !!post.deleted_at;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Adjusted button style to match Facebook's small, subtle action menu */}
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-colors">
          <span className="sr-only">Mở menu</span>
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        {!post.deleted_at ? (
          <>
            <DropdownMenuItem onClick={()=>onEdit?.(post)} disabled={!canEdit}>
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>onRemove?.(post)} disabled={!canRemove}>
              Gỡ bài
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={()=>onRestore?.(post)} disabled={!canRestore}>
              Phục hồi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>onHardDelete?.(post)} disabled={!canHardDelete} className="text-red-600">
              Xóa vĩnh viễn
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


// --- PostCard Component (Main UI changes here) ---
const PostCard: React.FC<{ post: Post; onRemove?: (p: Post)=>void; onEdit?: (p: Post)=>void; onRestore?: (p: Post)=>void; onHardDelete?: (p: Post)=>void; comments?: any[]; repliesMap?: Record<string, any[]>; addReply?: (postId:string,parentId:string,payload:any)=>Promise<any>; likePost?: (postId:string)=>Promise<any>; onOpenProfile?: (userId:string)=>void; onToggleComments?: (postId:string)=>Promise<void>|void }>= ({ post, onRemove, onEdit, onRestore, onHardDelete, comments=[], repliesMap = {}, addReply, likePost, onOpenProfile, onToggleComments }) => {
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const badgeMap = useBadgeLevels();
  const { user: postUser } = useUser(post.user_id);
  const badgeList = useBadgeList() || [];
  const [optimisticLikes, setOptimisticLikes] = React.useState<number|undefined>(undefined);
  const [optimisticComments, setOptimisticComments] = React.useState<number|undefined>(undefined);
  const handleLike = async ()=>{ 
    // optimistic
    setOptimisticLikes((prev)=> (typeof prev === 'number' ? prev + 1 : (post.likes||0) + 1));
    try{ if(likePost) await likePost(post.id); } catch(e){ console.error(e); /* don't revert for simplicity */ }
  };

  const openProfile = () => { if(onOpenProfile) onOpenProfile(post.user_id); else setUserModalOpen(true); };

  return (
    // Facebook-style card: large shadow, rounded corners, white background
    <div className={`p-4 shadow-md rounded-lg ${post.deleted_at ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
      {/* Header: avatar + name + topic/time */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button onClick={openProfile} className="flex items-center gap-2"> {/* Reduced gap for compact look */}
            {/* Avatar placeholder with better styling */}
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-lg font-bold border-2 border-white shadow-sm">
              {(post.user_id||'U').toString().charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              {/* User Name - Primary info, slightly larger */}
              <div className="font-bold text-sm text-gray-900 hover:underline flex items-center gap-2">{(post as any).user_name || (post as any).user_display_name || post.user_id}
                <span className="ml-1 text-xs relative group">
                  <span className="select-none">{badgeMap[(postUser?.badge_level ?? (post as any).badge_level ?? (post as any).user_badge_level) || 0]}</span>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white border shadow-md rounded p-2 w-40 text-xs">
                      <div className="font-semibold mb-1">Huy hiệu</div>
                      {badgeList.map(b=> (
                        <div key={b.level} className="flex items-center gap-2 py-0.5">
                          <div className="w-6 text-center">{b.icon}</div>
                          <div>{b.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </span>
              </div>
              {/* Topic and Time - Secondary info, subtle text */}
              <div className="text-xs text-gray-500">
                {post.topic && <span className="font-medium">{post.topic}</span>}
                {post.topic && ' · '}
                {timeAgo(post.created_at)}
              </div>
            </div>
          </button>
        </div>
        <div>
          <ActionMenu post={post} onRemove={onRemove} onEdit={onEdit} onRestore={onRestore} onHardDelete={onHardDelete} />
        </div>
      </div>

      {/* Title (if present, usually Facebook posts don't have titles, but keeping it for completeness) */}
      {post.title && <h2 className="mt-3 text-base font-semibold text-gray-900">{post.title}</h2>}

      {/* Content */}
      {/* Adjusted spacing and text size for content */}
      <div className="mt-3 text-base text-gray-800" dangerouslySetInnerHTML={{ __html: (post.content?.ops?.map((o:any)=>o.insert).join('') || '') }} />

      {/* Images grid */}
      {(post as any).images && (post as any).images.length>0 && (
        // Adjusted gap and added slight border-radius to images
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {(post as any).images.map((src:string, idx:number) => (
            <img key={idx} src={src} alt={`img-${idx}`} className="w-full h-56 object-cover rounded-md" />
          ))}
        </div>
      )}

      {/* Stats bar (Above interaction bar) - Lighter text for secondary info */}
      <div className="mt-3 flex justify-between items-center text-xs text-gray-500 pb-2 border-b border-gray-200">
        {(optimisticLikes ?? post.likes) > 0 && (
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>{optimisticLikes ?? post.likes} lượt thích</span>
          </div>
        )}
        <div className="flex-1 text-right">
        {(((optimisticComments ?? (post as any).comments_count) as number) > 0 || post.views > 0) && (
          <span>{(optimisticComments ?? (post as any).comments_count) || 0} bình luận · {post.views || 0} lượt xem</span>
            )}
        </div>
      </div>


      {/* Bottom bar: Action buttons (Like, Comment) */}
      <div className="mt-2 pt-1">
        <div className="flex items-center text-sm text-gray-600 -mx-1">
          {/* Like Button - Facebook style, wider click area */}
          <button onClick={handleLike} className="flex-1 flex justify-center items-center gap-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Heart className="h-5 w-5 text-gray-500" /> 
            <span className="font-semibold">Thích</span>
          </button>
          {/* Comment Button - Facebook style, wider click area */}
          <button onClick={async ()=>{ if(onToggleComments) await onToggleComments(post.id); setShowComments(s=>!s); }} className="flex-1 flex justify-center items-center gap-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MessageCircle className="h-5 w-5 text-gray-500" /> 
            <span className="font-semibold">Bình luận</span>
          </button>
          {/* View/Share placeholder (keeping the structure but modifying) */}
          <div className="flex-1 text-center invisible">
            <div className="inline-flex items-center gap-2"></div>
          </div>
        </div>
      </div>

      <div className={`mt-3 border-t pt-3 overflow-hidden transition-[max-height] duration-300 ease-in-out`} style={{ maxHeight: showComments ? (comments.length * 220) + 120 : 0 }}>
        {/* slide down container - maxHeight tuned roughly per comment height */}
        {comments.map(c=> (
          <div key={c.id} className="mb-3">
            <CommentItem comment={c} replies={repliesMap[c.id] || []} onReply={async (parentId:string, text:string)=>{ 
              if(!addReply) return; 
              // optimistic increment comment count
              setOptimisticComments((prev)=> (typeof prev==='number' ? prev + 1 : ((post as any).comments_count||0) + 1));
              await addReply(post.id, parentId, { user_id: 'current-mock', content: { ops: [{ insert: text }] } });
            }} />
          </div>
        ))}
      </div>
      <UserCommunityModal isOpen={userModalOpen} onClose={()=>setUserModalOpen(false)} userId={post.user_id} />
    </div>
  );
};

export default PostCard;