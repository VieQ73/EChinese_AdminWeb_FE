import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserPostsAll, fetchUserComments } from '../features/community/communityApi';
import { fetchUserById } from '../features/users/userApi';
import PostCard from '../features/community/components/PostCard';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const UserCommunityPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'posted'|'removed'|'deleted'>('posted');
  const [items, setItems] = useState<any[]>([]);
  // page state reserved for future pagination if needed
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ (async ()=>{ if(!userId) return; const u = await fetchUserById(userId); setUser(u); })(); }, [userId]);

  useEffect(()=>{ setItems([]); setPage(1); setHasMore(true); }, [activeTab, userId]);

  useEffect(()=>{
    if(!userId) return;
    let mounted = true;
    (async ()=>{
      // For simplicity in this mock: fetch all posts and then filter by tab
      const all = await fetchUserPostsAll(userId);
      if(!mounted) return;
      const posted = all.filter((p:any)=> !p.deleted_at);
      const removed = all.filter((p:any)=> p.deleted_at && p.removed_kind === 'admin');
      const selfRemoved = all.filter((p:any)=> p.deleted_at && p.removed_kind === 'self');
      const hard = all.filter((p:any)=> p.removed_kind === 'hard');
      const comments = await fetchUserComments(userId, true);
      // Build items depending on tab
      if(activeTab === 'posted'){
        const merged = [...posted];
        // include comments as contextual items linking to posts
        const commentNodes = comments.filter(c=> !c.deleted_at).map(c=> ({ ...c, _isComment: true }));
        setItems([...merged, ...commentNodes]);
      }else if(activeTab === 'removed'){
        setItems([...removed, ...selfRemoved]);
      }else{
        setItems([...hard]);
      }
      setHasMore(false);
    })();
    return ()=>{ mounted=false; };
  }, [userId, activeTab]);

  useEffect(()=>{
    const el = sentinelRef.current; if(!el) return; const io = new IntersectionObserver(entries=>{ entries.forEach(en=>{ if(en.isIntersecting && hasMore){ setPage(p=>p+1); } }); }, { root:null, rootMargin:'200px' }); io.observe(el); return ()=>io.disconnect();
  }, [hasMore]);

  if(!userId) return <div>Không tìm thấy người dùng</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow-sm" onClick={()=>navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h2 className="text-2xl font-semibold">Hồ sơ cộng đồng — {user?.name || userId}</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">{(user?.name||'U').charAt(0)}</div>
            {user && user.is_active === false && (
              <div title="Tài khoản đã bị khóa!" className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px]">!</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-bold text-lg">{user?.name}</div>
                <div className="text-sm text-gray-500">@{user?.username} · Huy hiệu cấp {user?.badge_level}</div>
              </div>
              <div className="ml-auto">
                <Button onClick={async ()=>{ /* stub: lock/unlock */ }}>{user?.is_active ? 'Khóa tài khoản' : 'Mở khóa'}</Button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex gap-2">
                <button className={`px-3 py-1 rounded ${activeTab==='posted' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setActiveTab('posted')}>Đã đăng</button>
                <button className={`px-3 py-1 rounded ${activeTab==='removed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setActiveTab('removed')}>Bị gỡ</button>
                <button className={`px-3 py-1 rounded ${activeTab==='deleted' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setActiveTab('deleted')}>Bị xóa</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4">
          {items.length===0 ? <div className="text-sm text-gray-500 italic">Không có mục</div> : (
            items.map(it => (
              it._isComment ? (
                <div key={it.id} className="p-3 bg-white rounded border shadow-sm">
                  <div className="text-sm text-gray-700">Bình luận trên bài <button className="underline text-blue-600">mở bài viết</button></div>
                  <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: (it.content?.ops?.map((o:any)=>o.insert).join('') || '') }} />
                </div>
              ) : (
                <PostCard key={it.id} post={it} comments={[]} />
              )
            ))
          )}
          <div ref={sentinelRef} />
        </div>
      </div>
    </div>
  );
};

export default UserCommunityPage;
