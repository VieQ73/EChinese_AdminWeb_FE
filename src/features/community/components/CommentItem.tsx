/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useUser } from '../../users/useUserCache';
import { useBadgeList } from '../../badges/useBadgeList';

const CommentItem: React.FC<{ comment: any; replies?: any[]; onReply?: (parentId:string, text:string)=>Promise<void> }> = ({ comment, replies = [], onReply }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  // ensure we resolve the canonical user object for this comment
  const { user } = useUser(comment.user_id);
  const badgeList = useBadgeList() || [];
  const badgeMap: Record<number,string> = {};
  badgeList.forEach((b:any)=>{ if(b.icon) badgeMap[b.level]=b.icon; });

  const handleReply = async ()=>{
    if(!replyText.trim() || !onReply) return;
    setReplying(true);
    try{ await onReply(comment.id, replyText); setReplyText(''); setShowReplies(true); }catch(e){ console.error(e); }finally{ setReplying(false); }
  };

  function ReplyBlock({ r }: { r: any }){
    const { user: replyUser } = useUser(r.user_id);
    const level = (replyUser?.badge_level ?? r.badge_level) || 0;
    return (
      <div className="p-2 bg-gray-50 rounded flex items-start gap-3">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">{(r.user_name||r.user_id||'U').toString().charAt(0).toUpperCase()}</div>
          {replyUser && replyUser.is_active === false && (
            <div title="Tài khoản đã bị khóa!" className="absolute -bottom-0.5 -right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium flex items-center gap-2">
            <span>{r.user_name || replyUser?.name || r.user_id}</span>
            <span className="ml-1 text-xs">{badgeMap[level]}</span>
          </div>
          <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
          <div className="mt-1 text-sm" dangerouslySetInnerHTML={{ __html: (r.content?.ops?.map((o:any)=>o.insert).join('') || '') }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-white rounded shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">{(comment.user_id||'U').toString().charAt(0).toUpperCase()}</div>
          {user && user.is_active === false && (
            <div title="Tài khoản đã bị khóa!" className="absolute -bottom-0.5 -right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium flex items-center gap-2">
            <span>{comment.user_name || user?.name || comment.user_id}</span>
            <span className="ml-1 text-xs relative group">
              <span className="select-none">{badgeMap[(user?.badge_level ?? comment.badge_level) || 0]}</span>
              {/* popover on hover: show badge list */}
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
          <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</div>
          <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: (comment.content?.ops?.map((o:any)=>o.insert).join('') || '') }} />
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <button className="hover:text-teal-600">Thích</button>
            <button className="hover:text-teal-600" onClick={()=>setShowReplies(s=>!s)}>{showReplies ? 'Ẩn phản hồi' : `Xem ${replies.length} phản hồi`}</button>
            <button className="hover:text-teal-600" onClick={()=>setShowReplyBox(s=>!s)}>{showReplyBox ? 'Hủy' : 'Trả lời'}</button>
          </div>

          {showReplies && (
            <div className="mt-3 space-y-2 pl-4 border-l">
              {replies.map(r => (
                <ReplyBlock key={r.id} r={r} />
              ))}
            </div>
          )}

          {showReplyBox && (
            <div className="mt-3">
              <textarea className="w-full p-2 border rounded" rows={2} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Viết trả lời..." />
              <div className="flex justify-end mt-2">
                <button className="px-3 py-1 bg-teal-600 text-white rounded" onClick={handleReply} disabled={replying || !replyText.trim()}>{replying ? 'Đang...' : 'Gửi'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
