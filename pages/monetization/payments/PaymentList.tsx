import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Payment } from '../../../types';
import { AuthContext } from '../../../contexts/AuthContext';
import { fetchPayments, updatePaymentStatus, bulkUpdatePaymentStatus } from '../api';
import { Pagination } from '../../../components/ui/pagination';
import FloatingBulkActionsBar from '../../../components/FloatingBulkActionsBar';
import ConfirmationModal from '../components/ConfirmationModal';
import { CheckCircleIcon, TrashIcon } from '../../../constants';
import { DateRange } from '../../moderation/components/shared/DateRangePicker';
import { convertToCSV, downloadCSV, formatCurrency, formatDateTime } from '../../../utils/csvExport';
import { PAYMENT_STATUSES, PAYMENT_METHODS, PAYMENT_CHANNELS } from '../constants';

import PaymentToolbar from './components/PaymentToolbar';
import PaymentCardList from './components/PaymentCardList';
import PaymentDetailModal from './components/PaymentDetailModal';

const PaymentList: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext)!;

    // State dữ liệu
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State điều khiển UI
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', status: 'all', method: 'all', channel: 'all' });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // State cho Modals
    const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'confirm' | 'fail'; payment: Payment } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Hàm tải dữ liệu
    const loadPayments = useCallback(async () => {
        setLoading(true);
        setSelectedIds(new Set());
        try {
            const response = await fetchPayments({ ...filters, page, limit: 12, startDate: dates.start, endDate: dates.end });
            setPayments(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            setError('Không thể tải danh sách giao dịch.');
        } finally {
            setLoading(false);
        }
    }, [page, filters, dates]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    useEffect(() => { setPage(1); }, [filters, dates]);
    
    const handleFilterChange = (name: keyof typeof filters, value: string) => {
        setFilters(f => ({ ...f, [name]: value }));
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Nếu chưa chọn hết thì chọn tất cả, nếu đã chọn hết thì bỏ chọn tất cả
        if (selectedIds.size === payments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(payments.map(p => p.id)));
        }
    };

    // Handlers cho các hành động
    const handleConfirmAction = async () => {
        if (!confirmAction || !currentUser) return;
        setIsProcessing(true);
        try {
            const newStatus = confirmAction.type === 'confirm' ? 'manual_confirmed' : 'failed';
            await updatePaymentStatus(confirmAction.payment.id, newStatus, currentUser.id);
            loadPayments();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
            setConfirmAction(null);
        }
    };
    
    const handleBulkConfirm = async () => {
        if (!currentUser) return;
        setIsProcessing(true);
        try {
            const idsToConfirm = Array.from(selectedIds) as string[];
            await bulkUpdatePaymentStatus(idsToConfirm, 'manual_confirmed', currentUser.id);
            loadPayments();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const canBulkConfirm = useMemo(() => {
        if (selectedIds.size === 0) return false;
        // Chỉ bật khi tất cả các item được chọn đều là pending manual
        return Array.from(selectedIds).every(id => {
            const p = payments.find(pay => pay.id === id);
            return p?.status === 'pending' && p?.payment_channel === 'manual';
        });
    }, [selectedIds, payments]);

    // Handler xuất CSV
    const handleExportCSV = useCallback(() => {
        if (payments.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        // Chuẩn bị dữ liệu để xuất
        const exportData = payments.map(payment => ({
            id: payment.id,
            user_email: payment.userEmail || 'N/A',
            user_name: payment.userName || 'N/A',
            subscription_name: payment.subscriptionName || 'N/A',
            amount: formatCurrency(payment.amount),
            currency: payment.currency,
            status: PAYMENT_STATUSES[payment.status as keyof typeof PAYMENT_STATUSES] || payment.status,
            payment_method: PAYMENT_METHODS[payment.payment_method as keyof typeof PAYMENT_METHODS] || payment.payment_method,
            payment_channel: PAYMENT_CHANNELS[payment.payment_channel as keyof typeof PAYMENT_CHANNELS] || payment.payment_channel,
            gateway_transaction_id: payment.gateway_transaction_id || '',
            transaction_date: formatDateTime(payment.transaction_date),
            processed_by_admin_name: payment.processedByAdminName || '',
            notes: payment.notes || '',
        }));

        // Định nghĩa headers
        const headers = {
            id: 'Mã giao dịch',
            user_email: 'Email người dùng',
            user_name: 'Tên người dùng',
            subscription_name: 'Gói đăng ký',
            amount: 'Số tiền',
            currency: 'Đơn vị tiền tệ',
            status: 'Trạng thái',
            payment_method: 'Phương thức',
            payment_channel: 'Kênh thanh toán',
            gateway_transaction_id: 'Mã giao dịch gateway',
            transaction_date: 'Ngày giao dịch',
            processed_by_admin_name: 'Người xử lý',
            notes: 'Ghi chú',
        };

        // Chuyển đổi sang CSV
        const csvContent = convertToCSV(exportData, headers);

        // Tạo tên file với timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `giao-dich-${timestamp}`;

        // Download file
        downloadCSV(csvContent, filename);
    }, [payments]);


    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <PaymentToolbar 
                filters={filters} 
                onFilterChange={handleFilterChange}
                dates={dates}
                onDatesChange={setDates}
                onExportCSV={handleExportCSV}
            />
            {error ? (
                <div className="p-4 text-red-600">{error}</div>
            ) : (
                <>
                    <PaymentCardList
                        payments={payments}
                        loading={loading}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onSelectAll={handleSelectAll}
                        onViewDetails={setViewingPayment}
                        onConfirm={(p) => setConfirmAction({ type: 'confirm', payment: p })}
                        onFail={(p) => setConfirmAction({ type: 'fail', payment: p })}
                    />
                    {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
                </>
            )}

            <PaymentDetailModal 
                isOpen={!!viewingPayment}
                onClose={() => setViewingPayment(null)}
                payment={viewingPayment}
            />
            
            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title="Xác nhận hành động"
                isConfirming={isProcessing}
                confirmButtonClass={confirmAction?.type === 'confirm' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
                {confirmAction?.type === 'confirm' && <p>Bạn có chắc muốn xác nhận thanh toán thành công cho giao dịch <strong>{confirmAction.payment.id}</strong>?</p>}
                {confirmAction?.type === 'fail' && <p>Bạn có chắc muốn đánh dấu giao dịch <strong>{confirmAction.payment.id}</strong> là thất bại?</p>}
            </ConfirmationModal>

             <FloatingBulkActionsBar
                isVisible={selectedIds.size > 0}
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
            >
                <button
                    onClick={handleBulkConfirm}
                    disabled={!canBulkConfirm || isProcessing}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircleIcon className="w-4 h-4 mr-1.5"/>
                    Xác nhận hàng loạt
                </button>
                {!canBulkConfirm && selectedIds.size > 0 && 
                    <p className="text-xs text-yellow-300 italic">Chỉ có thể xác nhận hàng loạt các giao dịch thủ công đang chờ xử lý.</p>
                }
            </FloatingBulkActionsBar>
        </div>
    );
};

export default PaymentList;