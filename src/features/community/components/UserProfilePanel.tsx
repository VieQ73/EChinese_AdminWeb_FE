import React, { useEffect, useState } from 'react';
import { fetchUserById } from '../../users/userApi';
import { fetchUserPostsAll } from '../communityApi';
import type { User } from '../../../types/entities';

const UserProfilePanel: React.FC<{ userId?: string; onClose?: ()=>void }> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!userId) return;
    setLoading(true);
    Promise.all([fetchUserById(userId), fetchUserPostsAll(userId)])
      .then(([u, ps]) => { setUser(u); setPosts(ps || []); })
      .finally(()=>setLoading(false));
  }, [userId]);

  if(!userId) return null;
  return (
    <div className="h-full bg-white p-4 rounded shadow overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">{user?.name?.charAt(0)}</div>
          <div>
            <div className="font-semibold">{user?.name}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>
        <div>
          <button className="px-3 py-1 border rounded" onClick={onClose}>Đóng</button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Bài đã đăng</h4>
        <div className="mt-2 space-y-2">
          {loading ? <div>Đang tải...</div> : (
            posts.map(p => (
              <div key={p.id} className="p-2 border rounded bg-gray-50">
                <div className="text-sm font-semibold">{p.title || 'Không tiêu đề'}</div>
                <div className="text-xs text-gray-500">{p.deleted_at ? 'Đã gỡ/Đã xóa' : 'Đã đăng'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePanel;
