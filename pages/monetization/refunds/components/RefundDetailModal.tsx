import React from 'react';
import { Refund, User } from '../../../../types';
import Modal from '../../../../components/Modal';
import { formatCurrency, formatDateTime } from '../../utils';
import StatusBadge from '../../components/StatusBadge';
import ProcessRefundForm from './ProcessRefundForm';
import { ProcessRefundPayload } from '../../api';

interface RefundDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    refund: Refund | null;
    onProcess: (payload: Omit<ProcessRefundPayload, 'adminId'>) => void;
    isProcessing: boolean;
    currentUserRole?: User['role'];
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="space-y-0.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="text-sm text-gray-800 break-words">{children}</div>
    </div>
);

const RefundDetailModal: React.FC<RefundDetailModalProps> = ({
    isOpen,
    onClose,
    refund,
    onProcess,
    isProcessing,
    currentUserRole
}) => {
    if (!refund) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Yêu cầu hoàn tiền #${refund.id}`}
            className="max-w-3xl md:max-w-4xl text-sm overflow-y-auto max-h-[90vh]"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái: Thông tin hoàn tiền */}
                <div className="space-y-3">
                    <InfoRow label="Trạng thái"><StatusBadge status={refund.status} /></InfoRow>
                    <InfoRow label="Người yêu cầu">
                        <p className="font-semibold">{refund.userName}</p>
                    </InfoRow>
                    <InfoRow label="Số tiền & Phương thức">
                        <p className="font-bold text-red-600">{formatCurrency(refund.refund_amount)}</p>
                        <p className="capitalize">{refund.refund_method}</p>
                    </InfoRow>
                    <InfoRow label="Lý do yêu cầu">
                        <p className="italic bg-gray-50 p-2 rounded border">{refund.reason || 'Không có'}</p>
                    </InfoRow>
                    <InfoRow label="Ngày yêu cầu">{formatDateTime(refund.created_at)}</InfoRow>

                    {refund.status !== 'pending' && (
                        <div className="p-3 rounded-md bg-blue-50 border border-blue-200 space-y-2">
                            <InfoRow label="Xử lý bởi">
                                <p className="font-semibold">{refund.processedByAdminName}</p>
                            </InfoRow>
                            <InfoRow label="Ngày xử lý">{formatDateTime(refund.processed_at)}</InfoRow>
                            <InfoRow label="Ghi chú xử lý">
                                <p>{refund.notes || 'Không có'}</p>
                            </InfoRow>
                        </div>
                    )}
                </div>

                {/* Cột phải: Thông tin thanh toán & Hành động */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Thông tin giao dịch gốc</h4>
                        <div className="p-3 rounded-md border border-gray-200 space-y-2">
                            <InfoRow label="Mã giao dịch">{refund.payment?.id}</InfoRow>
                            <InfoRow label="Gói đăng ký">{refund.payment?.subscriptionName}</InfoRow>
                            <InfoRow label="Số tiền gốc">{formatCurrency(refund.payment?.amount || 0)}</InfoRow>
                            <InfoRow label="Ngày thanh toán">{formatDateTime(refund.payment?.transaction_date)}</InfoRow>
                        </div>
                    </div>

                    {refund.status === 'pending' && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Xử lý yêu cầu</h4>
                            <div className="p-3 rounded-md border border-amber-300 bg-amber-50">
                                <ProcessRefundForm
                                    refund={refund}
                                    onSubmit={onProcess}
                                    onCancel={() => {}}
                                    isProcessing={isProcessing}
                                    currentUserRole={currentUserRole}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default RefundDetailModal;
