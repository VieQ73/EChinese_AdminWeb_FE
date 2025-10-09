import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { EnrichedUserSubscription, UserSubscriptionHistoryItem, Subscription } from '../../../../types';
import { formatCurrency, formatDateTime } from '../../utils';
import { UpdateUserSubscriptionDetailsPayload, fetchSubscriptions } from '../../api';
import { Loader2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

interface ManageUserSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userSub: EnrichedUserSubscription | null;
    history: UserSubscriptionHistoryItem[];
    onAction: (userSubId: string, payload: UpdateUserSubscriptionDetailsPayload) => Promise<void>;
    onResetQuota: (userId: string, feature: 'ai_lesson' | 'ai_translate') => Promise<void>;
    isProcessing: boolean;
}

type View = 'main' | 'change_plan' | 'change_expiry';

const ManageUserSubscriptionModal: React.FC<ManageUserSubscriptionModalProps> = ({ isOpen, onClose, userSub, history, onAction, onResetQuota, isProcessing }) => {
    const [view, setView] = useState<View>('main');
    
    // State cho form
    const [newPlanId, setNewPlanId] = useState('');
    const [newExpiry, setNewExpiry] = useState('');
    const [allPlans, setAllPlans] = useState<Subscription[]>([]);

    // State cho modal xác nhận con
    const [confirmPayload, setConfirmPayload] = useState<UpdateUserSubscriptionDetailsPayload | null>(null);
    const [confirmResetPayload, setConfirmResetPayload] = useState<{ feature: 'ai_lesson' | 'ai_translate' } | null>(null);
    
    useEffect(() => {
        if(isOpen) {
            setView('main'); // Reset view khi mở lại
            if(userSub?.userSubscription) {
                setNewExpiry(userSub.userSubscription.expiry_date?.split('T')[0] || '');
            }
            // Tải danh sách các gói có thể chuyển đổi
            fetchSubscriptions({ status: 'active' }).then(res => setAllPlans(res.data));
        }
    }, [isOpen, userSub]);

    if (!userSub) return null;

    const currentSub = userSub.subscription;
    const userSubscription = userSub.userSubscription;

    const handleAction = (payload: UpdateUserSubscriptionDetailsPayload) => {
        if (!userSubscription) {
            alert("Người dùng không có gói nào để thực hiện hành động.");
            return;
        }
        setConfirmPayload(payload);
    };

    const executeAction = () => {
        if (confirmPayload && userSubscription) {
            onAction(userSubscription.id, confirmPayload).finally(() => setConfirmPayload(null));
        }
    };
    
    const executeResetQuota = () => {
        if (confirmResetPayload) {
            onResetQuota(userSub.user.id, confirmResetPayload.feature).finally(() => {
                setConfirmResetPayload(null);
                onClose(); // Đóng modal chính sau khi reset
            });
        }
    };

    const renderMainView = () => (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold">Gói hiện tại: {currentSub?.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <p><strong>Ngày bắt đầu:</strong> {formatDateTime(userSubscription?.start_date)}</p>
                    <p><strong>Ngày hết hạn:</strong> {formatDateTime(userSubscription?.expiry_date)}</p>
                    <p><strong>Tự động gia hạn:</strong> {userSubscription?.auto_renew ? 'Bật' : 'Tắt'}</p>
                    <p><strong>Thanh toán cuối:</strong> {userSubscription?.last_payment_id || 'N/A'}</p>
                </div>
            </div>
            <div>
                 <h4 className="font-semibold text-sm mb-2">Hành động quản lý</h4>
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <button onClick={() => setView('change_plan')} className="btn-secondary">Thay đổi gói</button>
                    <button onClick={() => setView('change_expiry')} className="btn-secondary">Sửa ngày hết hạn</button>
                    <button onClick={() => handleAction({action: 'toggle_renew', auto_renew: !userSubscription?.auto_renew})} className="btn-secondary">
                        {userSubscription?.auto_renew ? 'Tắt' : 'Bật'} tự gia hạn
                    </button>
                    <button onClick={() => handleAction({ action: 'cancel_now' })} className="btn-danger">Hủy gói ngay</button>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-sm mb-2">Hành động khác</h4>
                 <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <button onClick={() => setConfirmResetPayload({ feature: 'ai_lesson' })} className="btn-secondary">Reset Quota Bài học</button>
                    <button onClick={() => setConfirmResetPayload({ feature: 'ai_translate' })} className="btn-secondary">Reset Quota Dịch</button>
                </div>
            </div>
        </div>
    );

    const renderChangePlanView = () => {
        const selectedNewPlan = allPlans.find(p => p.id === newPlanId);
        const priceDiff = selectedNewPlan && currentSub ? selectedNewPlan.price - currentSub.price : 0;
        return (
            <div className="space-y-4">
                <h4 className="font-semibold">Thay đổi gói đăng ký</h4>
                <div>
                    <label>Chọn gói mới</label>
                    <select value={newPlanId} onChange={e => setNewPlanId(e.target.value)} className="w-full p-2 border rounded mt-1">
                        <option value="">-- Chọn gói --</option>
                        {allPlans.filter(p => p.id !== currentSub?.id).map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                        ))}
                    </select>
                </div>
                 {selectedNewPlan && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <strong>Chênh lệch chi phí: </strong> {formatCurrency(priceDiff)}. Cần thông báo cho người dùng về việc thanh toán bù trừ.
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <button onClick={() => setView('main')} className="btn-secondary">Hủy</button>
                    <button onClick={() => handleAction({action: 'change_plan', new_subscription_id: newPlanId, change_type: 'immediate'})} disabled={!newPlanId} className="btn-primary">Lưu thay đổi</button>
                </div>
            </div>
        );
    };
    
     const renderChangeExpiryView = () => (
        <div className="space-y-4">
            <h4 className="font-semibold">Thay đổi ngày hết hạn</h4>
            <div>
                <label>Ngày hết hạn mới</label>
                <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setView('main')} className="btn-secondary">Hủy</button>
                <button onClick={() => handleAction({action: 'change_expiry', new_expiry_date: new Date(newExpiry).toISOString()})} disabled={!newExpiry} className="btn-primary">Lưu thay đổi</button>
            </div>
        </div>
    );

    const renderHistory = () => (
         <div className="mt-6">
            <h4 className="font-semibold mb-2">Lịch sử gói</h4>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Tên gói</th>
                            <th className="p-2 text-left">Thời gian</th>
                            <th className="p-2 text-left">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(h => (
                            <tr key={h.id} className="border-t">
                                <td className="p-2">{h.subscriptionName}</td>
                                <td className="p-2">{formatDateTime(h.start_date)} - {formatDateTime(h.expiry_date)}</td>
                                <td className="p-2">{h.is_active ? 'Hoạt động' : 'Không hoạt động'}</td>
                            </tr>
                        ))}
                         {history.length === 0 && (
                            <tr><td colSpan={3} className="text-center p-4 text-gray-500">Chưa có lịch sử.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} title={`Quản lý gói cho ${userSub.user.name}`} className="max-w-3xl">
            {isProcessing && !confirmPayload && !confirmResetPayload && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
            {view === 'main' && renderMainView()}
            {view === 'change_plan' && renderChangePlanView()}
            {view === 'change_expiry' && renderChangeExpiryView()}
            {renderHistory()}
        </Modal>
        
        <ConfirmationModal
            isOpen={!!confirmPayload}
            onClose={() => setConfirmPayload(null)}
            onConfirm={executeAction}
            title="Xác nhận hành động"
            isConfirming={isProcessing}
        >
            <p>Bạn có chắc chắn muốn thực hiện hành động này không? Hành động có thể ảnh hưởng đến quyền lợi của người dùng.</p>
        </ConfirmationModal>

        <ConfirmationModal
            isOpen={!!confirmResetPayload}
            onClose={() => setConfirmResetPayload(null)}
            onConfirm={executeResetQuota}
            title="Xác nhận Reset Quota"
            isConfirming={isProcessing}
        >
            <p>Bạn có chắc muốn reset quota <strong>{confirmResetPayload?.feature === 'ai_lesson' ? 'Bài học AI' : 'Dịch AI'}</strong> cho người dùng này không? Lượt sử dụng trong ngày sẽ được đặt về 0.</p>
        </ConfirmationModal>
        </>
    );
};

// Simple styling for buttons inside modal
const style = `
.btn-primary { padding: 8px 12px; background-color: #2563eb; color: white; border-radius: 6px; font-size: 14px; transition: background-color 0.2s; }
.btn-primary:hover { background-color: #1d4ed8; }
.btn-primary:disabled { background-color: #93c5fd; cursor: not-allowed; }
.btn-secondary { padding: 8px 12px; background-color: #e5e7eb; color: #374151; border-radius: 6px; font-size: 14px; transition: background-color 0.2s; }
.btn-secondary:hover { background-color: #d1d5db; }
.btn-danger { padding: 8px 12px; background-color: #dc2626; color: white; border-radius: 6px; font-size: 14px; transition: background-color 0.2s; }
.btn-danger:hover { background-color: #b91c1c; }
`;
const styleElement = document.createElement('style');
styleElement.innerHTML = style;
document.head.appendChild(styleElement);


export default ManageUserSubscriptionModal;