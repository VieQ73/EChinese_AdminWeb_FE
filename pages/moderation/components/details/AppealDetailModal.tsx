
import React, { useState, useEffect } from 'react';
import { Appeal, Violation } from '../../../../types';
import Modal from '../../../../components/Modal';
import StatusBadge from '../ui/StatusBadge';
import { User, MessageSquare, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AppealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appeal: Appeal | null;
  onAction: (appealId: string, action: 'accepted' | 'rejected', notes: string) => void;
  onOpenViolation: (violation: Violation) => void;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const AppealDetailModal: React.FC<AppealDetailModalProps> = ({ isOpen, onClose, appeal, onAction, onOpenViolation }) => {
  const [view, setView] = useState<'details' | 'accepted' | 'rejected'>('details');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView('details');
      setNotes('');
    }
  }, [isOpen]);

  if (!appeal) return null;

  const handleConfirmAction = () => {
    if (view === 'details' || !notes.trim()) return;
    onAction(appeal.id, view, notes);
  };

  const getModalTitle = () => {
    if (view === 'accepted') return `Chấp nhận khiếu nại #${appeal.id.substring(0, 4)}`;
    if (view === 'rejected') return `Từ chối khiếu nại #${appeal.id.substring(0, 4)}`;
    return `Chi tiết khiếu nại #${appeal.id.substring(0, 4)}`;
  };
  
  const violationToShow = appeal.violation_snapshot || appeal.violation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      className="max-w-2xl"
      footer={
      view === 'details' ? (
        appeal.status === 'pending' ? (
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setView('rejected')}
              className="group flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 active:scale-95 transition transform duration-150 shadow-sm hover:shadow-md"
            >
              <XCircle
                size={18}
                className="mr-2 transition-transform duration-150 group-hover:rotate-12"
              />
              Từ chối
            </button>

            <button
              onClick={() => setView('accepted')}
              className="group flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 active:scale-95 transition transform duration-150 shadow-sm hover:shadow-md"
            >
              <CheckCircle
                size={18}
                className="mr-2 transition-transform duration-150 group-hover:rotate-12"
              />
              Chấp nhận
            </button>
          </div>
        ) : null
      ) : (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setView('details')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 active:scale-95 transition transform duration-150"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmAction}
            disabled={!notes.trim()}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white transition transform duration-150 active:scale-95 shadow-sm hover:shadow-md ${
              view === 'accepted'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
            }`}
          >
            {view === 'accepted' ? (
              <CheckCircle size={18} className="mr-2" />
            ) : (
              <XCircle size={18} className="mr-2" />
            )}
            Xác nhận
          </button>
        </div>
      )
    }
    >
      <div className="space-y-6">
        {view === 'details' ? (
          <>
            <InfoSection title="Người khiếu nại">
                <div className="flex items-center space-x-3">
                    <img src={appeal.user?.avatar_url || ''} alt={appeal.user?.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold">{appeal.user?.name}</p>
                        <p className="text-xs text-gray-500">ID: {appeal.user_id}</p>
                    </div>
                </div>
            </InfoSection>

            <InfoSection title="Lý do khiếu nại">
              <blockquote className="border-l-4 border-blue-300 bg-blue-50 p-4 rounded-r-lg text-gray-800 italic">
                "{appeal.reason}"
              </blockquote>
            </InfoSection>
            
            <InfoSection title="Vi phạm gốc">
                <div 
                    onClick={() => violationToShow && onOpenViolation(violationToShow)}
                    className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm cursor-pointer hover:bg-gray-200 hover:border-primary-300 transition-colors"
                >
                    <p><strong>Loại:</strong>{' '}
                      {violationToShow?.rules?.map((r, index) => (
                        <span key={r.id}>
                          {r.title}
                          {!r.is_active && <span className="text-gray-500 font-normal italic"> (Đã tắt)</span>}
                          {index < (violationToShow.rules?.length || 0) - 1 && ', '}
                        </span>
                      ))}
                    </p>
                    <p><strong>Mức độ:</strong> <StatusBadge status={violationToShow?.severity || 'low'} /></p>
                    <p><strong>Ngày vi phạm:</strong> {violationToShow ? new Date(violationToShow.created_at).toLocaleString('vi-VN') : 'N/A'}</p>
                    <p className="text-xs text-primary-600 font-semibold mt-1">
                      {appeal.status === 'accepted' ? 'Xem bản ghi vi phạm đã hủy' : 'Nhấn để xem chi tiết vi phạm'}
                    </p>
                </div>
            </InfoSection>

            {appeal.status !== 'pending' && (
              <InfoSection title="Kết quả xử lý">
                <div className={`${appeal.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-3 rounded-lg border`}>
                    <p className="flex items-center gap-2 font-semibold">
                        <StatusBadge status={appeal.status} /> 
                        <span>bởi {appeal.user?.name || 'Admin'} ({appeal.user?.role})</span>
                    </p>
                    {appeal.notes && <p className="text-sm mt-2 text-gray-700"><strong>Ghi chú:</strong> {appeal.notes}</p>}
                </div>
              </InfoSection>
            )}
          </>
        ) : (
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú xử lý *</label>
                 <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    placeholder={`Giải thích lý do ${view === 'accepted' ? 'chấp nhận' : 'từ chối'} khiếu nại...`}
                 />
                 <p className="text-xs text-gray-500 mt-1">Ghi chú này sẽ được gửi đến người dùng.</p>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default AppealDetailModal;
