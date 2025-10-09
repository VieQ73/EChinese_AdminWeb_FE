import React from 'react';
import { Payment } from '../../../../types';
import Modal from '../../../../components/Modal';
import { formatCurrency, formatDateTime } from '../../utils';
import StatusBadge from '../../components/StatusBadge';
import ImageProofViewer from './ImageProofViewer';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode, className?: string }> = ({ label, children, className = '' }) => (
    <div className={`py-2 ${className}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="text-sm text-gray-900 mt-1 break-words">{children}</div>
    </div>
);

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ isOpen, onClose, payment }) => {
    if (!payment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết Giao dịch #${payment.id}`} className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Cột thông tin chính */}
                <div className="space-y-2">
                    <InfoRow label="Trạng thái">
                        <StatusBadge status={payment.status} />
                    </InfoRow>
                     <InfoRow label="Người dùng">
                        <p className="font-semibold">{payment.userName}</p>
                        <p className="text-gray-600">{payment.userEmail}</p>
                    </InfoRow>
                    <InfoRow label="Gói đăng ký & Số tiền">
                        <p className="font-semibold">{payment.subscriptionName}</p>
                        <p className="font-bold text-primary-700">{formatCurrency(payment.amount)}</p>
                    </InfoRow>
                     <InfoRow label="Thời gian Giao dịch">
                        {formatDateTime(payment.transaction_date)}
                    </InfoRow>
                     <InfoRow label="Phương thức & Kênh thanh toán">
                        <p className="capitalize">{payment.payment_method} ({payment.payment_channel})</p>
                    </InfoRow>
                     <InfoRow label="Admin xử lý">
                        {payment.processedByAdminName || <span className="italic text-gray-500">Chưa có</span>}
                    </InfoRow>
                </div>

                 {/* Cột bằng chứng và thông tin gateway */}
                <div className="space-y-4">
                     {payment.payment_channel === 'manual' && (
                        <InfoRow label="Bằng chứng thanh toán">
                            <ImageProofViewer url={payment.manual_proof_url} />
                        </InfoRow>
                    )}
                     <InfoRow label="Mã giao dịch Gateway">
                        <p className="font-mono bg-gray-100 p-2 rounded">{payment.gateway_transaction_id}</p>
                    </InfoRow>
                     {payment.gateway_response && (
                         <InfoRow label="Phản hồi từ Gateway">
                            <pre className="text-xs bg-gray-800 text-white p-3 rounded-lg max-h-40 overflow-auto">
                                {JSON.stringify(payment.gateway_response, null, 2)}
                            </pre>
                        </InfoRow>
                     )}
                </div>
            </div>
        </Modal>
    );
};

export default PaymentDetailModal;
