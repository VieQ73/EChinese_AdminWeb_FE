import React, { useCallback, useEffect, useRef, useState } from 'react';
import useCommunity from '../features/community/hooks/useCommunity';
import { fetchPosts } from '../features/community/communityApi';
import PostCard from '../features/community/components/PostCard';
import CreateEditPostModal from '../features/community/components/CreateEditPostModal';
import RemoveConfirmModal from '../features/community/components/RemoveConfirmModal';
import { useAuth } from '../hooks/useAuth';
import UserProfilePanel from '../features/community/components/UserProfilePanel';

const AdminCommunityPage: React.FC = () => {
  const { removePost, restorePost, hardDeletePost, createPost, updatePost, fetchComments, addReply, likePost } = useCommunity();
  const [postsList, setPostsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const currentUser = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [postComments, setPostComments] = useState<Record<string, { parents: any[]; replies: Record<string, any[]> }>>({});
  const [profileOpenUserId, setProfileOpenUserId] = useState<string|undefined>(undefined);
  const [searchQ, setSearchQ] = useState('');
  const [topicFilter, setTopicFilter] = useState<string|undefined>(undefined);

  const openRemove = (post: any) => { setConfirmTarget(post); setConfirmOpen(true); };

  const doRemove = async () => {
    if (!confirmTarget) return;
    const self = currentUser?.id === confirmTarget.user_id;
    await removePost(confirmTarget.id, { reason: self ? undefined : reason, self, actor: { id: currentUser?.id, role: currentUser?.role } });
    setConfirmOpen(false); setReason('');
    await loadFirstPage();
  };

  const openEdit = (post: any) => { setEditingPost(post); setEditOpen(true); };
  const doSavePost = async (data: any) => {
    if (editingPost) { await updatePost(editingPost.id, data); setEditingPost(null); }
    else { await createPost(data); }
    setEditOpen(false);
    await loadFirstPage();
  };

  // loadComments replaced by per-post onToggleComments handler passed to PostCard

  const loadPage = useCallback(async (p: number) => {
    setLoadingMore(true);
    try {
      // NOTE: Should pass searchQ and topicFilter to fetchPosts here to make filters work
      const res: any = await fetchPosts({ page: p, limit: LIMIT, search: searchQ, topic: topicFilter }); 
      const items = Array.isArray(res) ? res : (res.items || []);
      // enrich with user display name from mock users
      const enhanced = await Promise.all(items.map(async (it:any)=>{
        try{
          const u:any = await (await import('../features/users/userApi')).fetchUserById(it.user_id);
          return { ...it, user_name: u?.name || u?.username, badge_level: u?.badge_level };
        }catch(_e){ return it; }
      }));
      // Correcting the logic for setting posts list on first page load
      if (p === 1) setPostsList(enhanced);
      else setPostsList(prev => ([...prev, ...enhanced]));
      
      setHasMore(items.length === LIMIT);
      setPage(p);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  }, [LIMIT, searchQ, topicFilter]);

  // Load first page when filters or search change
  const loadFirstPage = useCallback(async () => { await loadPage(1); }, [loadPage]);
  useEffect(() => { loadFirstPage(); }, [loadFirstPage, searchQ, topicFilter]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore && !loadingMore) { loadPage(page + 1); }
      });
    }, { root: null, rootMargin: '200px', threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [page, hasMore, loadingMore, loadPage]);

  // wrapper to add reply and then refresh comments for the post
  const handleAddReply = async (postId: string, parentId: string, payload: any) => {
    try{
      await addReply(postId, parentId, payload);
      // reload comments same as onToggleComments logic
      const cs = await fetchComments(postId);
      const userApi = await import('../features/users/userApi');
      const usersMap: Record<string, any> = {};
      await Promise.all(cs.map(async (c:any)=>{
        if(!usersMap[c.user_id]){
          try{ usersMap[c.user_id] = await userApi.fetchUserById(c.user_id); }catch(_e){ usersMap[c.user_id] = null; }
        }
      }));
                      const parents = cs.filter((c: any) => !c.parent_comment_id).map((p: any) => ({ ...p, user_name: usersMap[p.user_id]?.name || usersMap[p.user_id]?.username, avatar_url: usersMap[p.user_id]?.avatar_url, badge_level: usersMap[p.user_id]?.badge_level }));
                      const replies = cs.filter((c: any) => c.parent_comment_id).map((r:any)=> ({ ...r, user_name: usersMap[r.user_id]?.name || usersMap[r.user_id]?.username, avatar_url: usersMap[r.user_id]?.avatar_url, badge_level: usersMap[r.user_id]?.badge_level }));
      const grouped: Record<string, any[]> = {};
      replies.forEach((r: any) => { grouped[r.parent_comment_id] = grouped[r.parent_comment_id] || []; grouped[r.parent_comment_id].push(r); });
      setPostComments(prev => ({ ...prev, [postId]: { parents, replies: grouped } }));
    }catch(err){ console.error(err); }
  };

  return (
    <div className="p-0 space-y-6"> 
        <div className="w-full max-w-[1200px] flex gap-5 mx-auto"> 
        
        {/* Center feed (Feed) */}
        <div className="flex flex-col bg-transparent max-w-[650px] flex-grow">
          
          <div className="p-0 mb-4 hidden sm:block">
            <h1 className="text-2xl font-bold text-gray-800">Bảng tin Cộng đồng</h1>
          </div>
          
          {/* Compact composer */}
          <div className="p-4 bg-white rounded-lg shadow-md mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-lg font-bold">
                {(currentUser?.id||'U').toString().charAt(0).toUpperCase()}
              </div>
              <input
                onFocus={() => { setEditingPost(null); setEditOpen(true); }}
                className="flex-1 p-2 bg-gray-100 rounded-full cursor-pointer text-gray-600 focus:outline-none hover:bg-gray-200 transition-colors"
                placeholder="Bạn đang nghĩ gì...?"
              />
            </div>
          </div>

          {/* Post Feed Area */}
          <div className="space-y-4">
            {postsList.length === 0 && loadingMore && page === 1 ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 shadow-md rounded-lg bg-white animate-pulse h-44" />
                ))}
              </div>
            ) : (
              postsList.map(p => (
                <div key={p.id}>
                  <PostCard
                    post={p}
                    onRemove={(pp: any) => openRemove(pp)}
                    onEdit={(pp: any) => openEdit(pp)}
                    onRestore={async (pp: any) => { await restorePost(pp.id, { actor: { id: currentUser?.id, role: currentUser?.role } }); await loadFirstPage(); }}
                    onHardDelete={async (pp: any) => { await hardDeletePost(pp.id, { actor: { id: currentUser?.id, role: currentUser?.role } }); await loadFirstPage(); }}
                    comments={(postComments[p.id]?.parents) || []}
                    repliesMap={(postComments[p.id]?.replies) || {}}
                    addReply={handleAddReply}
                    likePost={likePost}
                    onOpenProfile={(uid:string)=>setProfileOpenUserId(uid)}
                        onToggleComments={async (postId:string)=>{
                          // if already loaded, do nothing (toggle handled by PostCard)
                          if(postComments[postId]?.parents && postComments[postId].parents.length>0) return;
                          // fetch comments and enrich with user display name
                          const cs = await fetchComments(postId);
                          // fetch users for names
                          const userApi = await import('../features/users/userApi');
                          const usersMap: Record<string, any> = {};
                          await Promise.all(cs.map(async (c:any)=>{
                            if(!usersMap[c.user_id]){
                              try{ usersMap[c.user_id] = await userApi.fetchUserById(c.user_id); }catch(_e){ usersMap[c.user_id] = null; }
                            }
                          }));
                      const parents = cs.filter((c: any) => !c.parent_comment_id).map((p: any) => ({ ...p, user_name: usersMap[p.user_id]?.name || usersMap[p.user_id]?.username, avatar_url: usersMap[p.user_id]?.avatar_url, badge_level: usersMap[p.user_id]?.badge_level }));
                      const replies = cs.filter((c: any) => c.parent_comment_id).map((r:any)=> ({ ...r, user_name: usersMap[r.user_id]?.name || usersMap[r.user_id]?.username, avatar_url: usersMap[r.user_id]?.avatar_url, badge_level: usersMap[r.user_id]?.badge_level }));
                          const grouped: Record<string, any[]> = {};
                          replies.forEach((r: any) => { grouped[r.parent_comment_id] = grouped[r.parent_comment_id] || []; grouped[r.parent_comment_id].push(r); });
                          setPostComments(prev => ({ ...prev, [postId]: { parents, replies: grouped } }));
                        }}
                      />
                </div>
              ))
            )}

            <div ref={sentinelRef} />
            {loadingMore && postsList.length > 0 && (
              <div className="py-4 flex justify-center">
                <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
            {!hasMore && postsList.length > 0 && (
                <div className="text-center py-4 text-gray-500">Đã tải hết bài viết.</div>
            )}
            
            <div className="h-4"/> 
          </div>
        </div>

        {/* Sidebar - Expanded for Admin Tools */}
        <aside className="flex-1 hidden md:block self-start sticky top-0">
          <div className="p-0 space-y-4">
            {!profileOpenUserId ? (
              <div className="space-y-4">
                
                {/* Search Filter Card - Existing */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Tìm kiếm bài viết</label>
                  <input 
                    value={searchQ} 
                    onChange={(e)=>{ setSearchQ(e.target.value); setPage(1); setPostsList([]); setHasMore(true); }} 
                    placeholder="Tìm theo tiêu đề hoặc nội dung" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>

                {/* Topic Filter Card - Existing */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Lọc theo chủ đề</label>
                  <select 
                    value={topicFilter || ''} 
                    onChange={(e)=>{ setTopicFilter(e.target.value || undefined); setPage(1); setPostsList([]); setHasMore(true); }} 
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="Cơ khí">Cơ khí</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Dịch">Dịch</option>
                    <option value="Du học">Du học</option>
                    <option value="Du lịch">Du lịch</option>
                    <option value="Góc chia sẻ">Góc chia sẻ</option>
                    <option value="Tìm bạn học chung">Tìm bạn học chung</option>
                    <option value="Học tiếng Trung">Học tiếng Trung</option>
                    <option value="Tìm gia sư">Tìm gia sư</option>
                    <option value="Việc làm">Việc làm</option>
                    <option value="Văn hóa">Văn hóa</option>
                    <option value="Thể thao">Thể thao</option>
                    <option value="Xây dựng">Xây dựng</option>
                    <option value="Y tế">Y tế</option>
                    <option value="Tâm sự">Tâm sự</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Quản lý Bài viết</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng số bài:</span>
                      <span className="font-semibold text-blue-600">Mock 1.2k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã gỡ (Mềm):</span>
                      <span className="font-semibold text-orange-600">Mock 45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã xóa (Cứng):</span>
                      <span className="font-semibold text-red-600">Mock 8</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Công cụ Kiểm duyệt</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Xem Bài viết Bị báo cáo
                    </button>
                    <button className="w-full text-left p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors flex items-center gap-2 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M5 12h14M5 5h14M5 19h14" /></svg>
                      Quản lý Người dùng Bị cấm
                    </button>
                  </div>
                </div>

                {/* Topic List Card - Existing */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-2">Danh sách chủ đề</h3>
                  <ul className="text-sm text-gray-700 space-y-1 max-h-64 overflow-y-auto">
                    {['Cơ khí', 'Công nghệ thông tin', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ', 'Tìm bạn học chung', 'Học tiếng Trung', 'Tìm gia sư', 'Việc làm', 'Văn hóa', 'Thể thao', 'Xây dựng', 'Y tế', 'Khác'].map(topic => (
                        <li 
                          key={topic} 
                          className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={()=>{ setTopicFilter(topic); setPage(1); setPostsList([]); setHasMore(true); }} 
                        >
                          {topic}
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full">
                {/* User profile panel rendered here, styled to fit the sidebar */}
                <div className="h-full bg-white rounded-lg shadow-sm">
                  <UserProfilePanel userId={profileOpenUserId} onClose={()=>setProfileOpenUserId(undefined)} />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <RemoveConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => { setConfirmOpen(false); setReason(''); }} 
        onConfirm={async (r?: string) => { setReason(r || ''); await doRemove(); }} 
        requireReason={currentUser?.id !== confirmTarget?.user_id} 
      />
      <CreateEditPostModal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditingPost(null); }} onSave={doSavePost} initial={editingPost || undefined} />
    </div>
  );
};

export default AdminCommunityPage;
