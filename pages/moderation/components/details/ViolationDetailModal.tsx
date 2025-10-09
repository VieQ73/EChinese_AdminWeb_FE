
import React from 'react';
// FIX: Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
// FIX: Import RawPost and Comment types to correctly handle targetContent
import { Violation, Appeal, RawPost, Comment, User } from '../../../../types';
import Modal from '../../../../components/Modal';
import StatusBadge from '../ui/StatusBadge';
import ClickableTarget from '../shared/ClickableTarget';
import { AlertCircle, User as UserIcon, Clock, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAppData } from '../../../../contexts/AppDataContext';

interface ViolationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  violation: Violation | null;
  relatedAppeal?: Appeal;
  onOpenAppeal: (appeal: Appeal) => void;
}

const InfoRow: React.FC<{ label: string; icon: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
      <Icon className="w-4 h-4 mr-2" /> {label}
    </p>
    <div className="text-sm text-gray-800 mt-1 pl-6">{children}</div>
  </div>
);

const ViolationDetailModal: React.FC<ViolationDetailModalProps> = ({ isOpen, onClose, violation, relatedAppeal, onOpenAppeal }) => {
  const navigate = useNavigate();
  const { posts, comments, users } = useAppData();
  if (!violation) return null;

  const handleNavigateRequest = () => {
    if (!violation) return;
    
    let path = '';
    const { target_type, target_id, targetContent } = violation;

    if (['user', 'post', 'comment'].includes(target_type)) {
      // Lấy trạng thái mới nhất của content từ context để tránh dữ liệu cũ từ snapshot
      let latestContent: Partial<RawPost & Comment & User> | undefined;
      if (target_type === 'post') {
        latestContent = posts.find(p => p.id === target_id);
      } else if (target_type === 'comment') {
        latestContent = comments.find(c => c.id === target_id);
      } else if (target_type === 'user') {
        latestContent = users.find(u => u.id === target_id);
      }
      
      const content = latestContent || (targetContent as Partial<RawPost & Comment & User>);
      const isRemoved = (content as RawPost)?.status === 'removed' || !!(content as Comment)?.deleted_at;
      const isBanned = !(content as User)?.is_active;
      
      if (isRemoved && (target_type === 'post' || target_type === 'comment')) {
        const userId = (content as any).user_id;
        if (userId) {
          const subTab = target_type === 'post' ? 'posts' : 'comments';
          path = `/community?openUserActivity=${userId}&tab=removed&subTab=${subTab}`;
        }
      } else {
        switch(target_type) {
          case 'user':
            path = `/users/${target_id}`;
            break;
          case 'post':
            path = `/community?openPostId=${target_id}`;
            break;
          case 'comment':
            const postId = comments.find(c => c.id === target_id)?.post_id;
            if (postId) {
              path = `/community?openPostId=${postId}&highlightCommentId=${target_id}`;
            }
            break;
        }
      }
    }

    if (path) {
      onClose();
      navigate(path);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết vi phạm #${violation.id.substring(0, 4)}`}
      className="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Thông tin vi phạm */}
        <div className="space-y-4">
          <InfoRow label="Người vi phạm" icon={UserIcon}>
            <div className="flex items-center space-x-2">
              <img src={violation.user?.avatar_url || ''} alt={violation.user?.name} className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{violation.user?.name}</span>
            </div>
          </InfoRow>
          
          <InfoRow label="Loại vi phạm" icon={AlertCircle}>
            <div className="font-semibold">
              {violation.rules?.map((r, index) => (
                <span key={r.id}>
                  {r.title}
                  {!r.is_active && <span className="text-gray-500 font-normal italic"> (Đã tắt)</span>}
                  {index < (violation.rules?.length || 0) - 1 && ', '}
                </span>
              ))}
            </div>
          </InfoRow>

          <InfoRow label="Mức độ" icon={ShieldCheck}>
            <StatusBadge status={violation.severity} />
          </InfoRow>

          <InfoRow label="Ngày vi phạm" icon={Clock}>
            {new Date(violation.created_at).toLocaleString('vi-VN')}
          </InfoRow>

          <InfoRow label="Phát hiện bởi" icon={UserIcon}>
            <span className="capitalize">{violation.detected_by.replace('_', ' ')}</span>
          </InfoRow>
          
          {violation.resolution && (
            <InfoRow label="Hướng xử lý" icon={ShieldCheck}>
               <p className="text-sm bg-gray-100 p-2 rounded-md border border-gray-200">{violation.resolution}</p>
            </InfoRow>
          )}

          {relatedAppeal && (
             <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                    <MessageSquare size={16} /> Người dùng đã gửi khiếu nại cho vi phạm này.
                </p>
                <button 
                    onClick={() => onOpenAppeal(relatedAppeal)}
                    className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
                >
                    Xem chi tiết khiếu nại
                </button>
             </div>
          )}

        </div>

        {/* Cột phải: Nội dung vi phạm */}
        <div>
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nội dung vi phạm</p>
            <ClickableTarget 
              targetType={violation.target_type}
              targetId={violation.target_id}
              targetContent={violation.targetContent}
              onNavigateRequest={handleNavigateRequest}
            />
        </div>
      </div>
    </Modal>
  );
};

export default ViolationDetailModal;
