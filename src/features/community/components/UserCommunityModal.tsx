import React, { useEffect, useState } from 'react';
import useCommunity from '../hooks/useCommunity';
import PostCard from './PostCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';

const UserCommunityModal: React.FC<{ isOpen: boolean; onClose: ()=>void; userId?: string }> = ({ isOpen, onClose, userId }) => {
  const { fetchUserPosts } = useCommunity();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if(isOpen && userId){ setLoading(true); fetchUserPosts(userId).then(r=>setPosts(r||[])).finally(()=>setLoading(false)); } },[isOpen,userId,fetchUserPosts]);

  if(!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(o)=>{ if(!o) onClose(); }}>
      {/* chiều rộng của modal */}
      <DialogContent className="w-full max-w-4xl"> 
        <DialogHeader>
          <DialogTitle>Hồ sơ cộng đồng — {userId}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <h3 className="font-semibold">Bài đã đăng</h3>
          {loading ? <div>Đang tải...</div> : (
            <div className="space-y-3 mt-3">
              {posts.map(p=> <PostCard key={p.id} post={p} comments={[]} />)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCommunityModal;