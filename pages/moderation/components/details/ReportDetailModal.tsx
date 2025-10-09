import React, { useState, useEffect, useMemo } from 'react';
// FIX: Changed import of `useNavigate` from `react-router-dom` to `react-router` to resolve module export error.
import { useNavigate } from 'react-router';
import { Report, RawPost, Comment } from '../../../../types';
import Modal from '../../../../components/Modal';
import { mockUsers } from '../../../../mock';
import StatusBadge from '../ui/StatusBadge';
import ClickableTarget from '../shared/ClickableTarget';
import ReportActionFooter from './ReportActionFooter';
import ReportActionForm from './ReportActionForm';
import { AlertCircle, ClipboardList, User, Clock } from 'lucide-react';
import { useAppData } from '../../../../contexts/AppDataContext';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onAction: (
    reportId: string,
    action: 'start_processing' | 'resolve' | 'dismiss',
    data: { resolution?: string; severity?: 'low' | 'medium' | 'high' }
  ) => void;
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    <div className="text-sm text-gray-800 mt-1">{children}</div>
  </div>
);

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ isOpen, onClose, report, onAction }) => {
  const { posts, comments } = useAppData();
  const [view, setView] = useState<'details' | 'resolve' | 'dismiss'>('details');
  const [resolution, setResolution] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setView('details');
      setResolution('');
      setSeverity('medium');
    }
  }, [isOpen]);
  
  const updatedReport = useMemo(() => {
    if (!report) return null;
    let latestTargetContent = report.targetContent;
    if (report.target_type === 'post') {
      const latestPost = posts.find(p => p.id === report.target_id);
      if (latestPost) latestTargetContent = latestPost;
    } else if (report.target_type === 'comment') {
      latestTargetContent = comments.find(c => c.id === report.target_id) || report.targetContent;
    }
    return { ...report, targetContent: latestTargetContent };
  }, [report, posts, comments]);

  const deadline = useMemo(() => {
    if (!report || report.status === 'resolved' || report.status === 'dismissed' || ['bug', 'other'].includes(report.target_type)) {
      return null;
    }
    const baseDate = new Date(report.status === 'pending' ? report.created_at : report.updated_at);
    const deadlineDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const timeLeft = deadlineDate.getTime() - Date.now();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    return { date: deadlineDate, daysLeft };
  }, [report]);

  const processAndNavigate = () => {
    if (!updatedReport) return;

    // Bước 1: Luôn cập nhật trạng thái nếu đang chờ xử lý.
    if (updatedReport.status === 'pending') {
        onAction(updatedReport.id, 'start_processing', { resolution: "Báo cáo đang được xử lý." });
    }

    // Bước 2: Tính toán đường dẫn điều hướng.
    let path = '';
    const { target_type, target_id, targetContent } = updatedReport;
    const isNavigable = ['user', 'post', 'comment'].includes(target_type);

    if (isNavigable) {
        const content = targetContent as Partial<RawPost & Comment>;
        const isRemoved = content?.status === 'removed' || !!content?.deleted_at;

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
                    const findPostIdByCommentId = (commentId: string) => {
                        return comments.find(c => c.id === commentId)?.post_id;
                    };
                    const postId = findPostIdByCommentId(target_id);
                    if (postId) {
                        path = `/community?openPostId=${postId}&highlightCommentId=${target_id}`;
                    }
                    break;
            }
        }
    }
    
    // Bước 3: Điều hướng nếu có đường dẫn.
    if (path) {
        onClose();
        navigate(path);
    }
  };


  if (!updatedReport) return null;

  const reporter = updatedReport.auto_flagged ? { name: 'Hệ thống AI', role: 'system' } : updatedReport.reporter;
  const resolvedByAdmin = mockUsers.find((u) => u.id === updatedReport.resolved_by);
  const canStartProcessing = updatedReport.status === 'pending';
  const isActionable = updatedReport.status === 'pending' || updatedReport.status === 'in_progress';
  
  const handleConfirmAction = () => {
    if (view === 'dismiss') {
      onAction(updatedReport.id, 'dismiss', { resolution });
    } else if (view === 'resolve') {
      onAction(updatedReport.id, 'resolve', { resolution, severity });
    }
  };

  const getModalTitle = () => {
    if (view === 'resolve') return `Giải quyết báo cáo #${updatedReport.id.substring(0, 4)}`;
    if (view === 'dismiss') return `Bỏ qua báo cáo #${updatedReport.id.substring(0, 4)}`;
    return `Chi tiết báo cáo #${updatedReport.id.substring(0, 4)}`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getModalTitle()} 
      footer={
        <ReportActionFooter 
          report={updatedReport}
          view={view}
          isActionable={isActionable}
          canStartProcessing={canStartProcessing}
          onStartProcessing={processAndNavigate}
          onDismiss={() => { setView('dismiss'); setResolution('Nội dung hợp lệ, không vi phạm.'); }}
          onResolve={() => { setView('resolve'); setResolution(`Nội dung đã bị gỡ do vi phạm quy tắc: ${updatedReport.reason}.`); }}
          onCancel={() => setView('details')}
          onConfirm={handleConfirmAction}
          isConfirmDisabled={view !== 'details' && !resolution.trim()}
        />
      }
      className="max-w-4xl"
    >
      {view === 'details' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-primary-600 mr-2" />
                <h3 className="font-semibold text-sm text-gray-700">Thông tin báo cáo</h3>
              </div>
              <div className="space-y-3">
                <InfoRow label="Trạng thái" children={<StatusBadge status={updatedReport.status} />} />
                <InfoRow label="Người báo cáo" children={
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-1 text-gray-500" />
                    <span className={updatedReport.auto_flagged ? 'italic text-purple-600' : ''}>
                      {reporter?.name || 'Không xác định'}
                    </span>
                  </div>
                }/>
                <InfoRow label="Lý do" children={updatedReport.reason} />
                {updatedReport.details && <InfoRow label="Chi tiết" children={<p className="text-sm bg-gray-100 p-2 rounded-md border border-gray-200">{updatedReport.details}</p>} />}
                <InfoRow label="Ngày báo cáo" children={
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(updatedReport.created_at).toLocaleString('vi-VN')}
                  </div>
                }/>
                {deadline && (
                  <InfoRow label="Hạn xử lý" children={
                    <span className={`font-bold ${deadline.daysLeft <= 2 ? 'text-red-600' : 'text-yellow-700'}`}>
                      Còn {deadline.daysLeft} ngày
                    </span>
                  }/>
                )}
              </div>
            </div>
            {updatedReport.resolved_at && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <h4 className="font-semibold text-sm text-green-700 mb-1">Đã xử lý</h4>
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">{resolvedByAdmin?.name || 'Không rõ'}</span> –{' '}
                  {new Date(updatedReport.resolved_at).toLocaleString('vi-VN')}
                </p>
                {updatedReport.resolution && (
                  <p className="text-sm bg-white text-green-800 p-2 rounded-md mt-2 border border-green-100">
                    {updatedReport.resolution}
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <ClipboardList className="w-4 h-4 text-primary-600 mr-2" />
                <h3 className="font-semibold text-sm text-gray-700">Đối tượng bị báo cáo</h3>
              </div>
              <ClickableTarget 
                  targetType={updatedReport.target_type}
                  targetId={updatedReport.target_id}
                  targetContent={updatedReport.targetContent}
                  reason={updatedReport.reason}
                  details={updatedReport.details || undefined}
                  onNavigateRequest={processAndNavigate}
              />
            </div>
          </div>
        </div>
      ) : (
        <ReportActionForm
          view={view}
          resolution={resolution}
          setResolution={setResolution}
          severity={severity}
          setSeverity={setSeverity}
          isAiReport={updatedReport.auto_flagged}
        />
      )}
    </Modal>
  );
};

export default ReportDetailModal;
