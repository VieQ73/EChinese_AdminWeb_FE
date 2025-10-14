import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Refund } from '../../../types';
import { AuthContext } from '../../../contexts/AuthContext';
import { fetchRefunds, processRefund, ProcessRefundPayload } from '../api';
import { Pagination } from '../../../components/ui/pagination';
import RefundToolbar from './components/RefundToolbar';
import RefundCardList from './components/RefundCardList';
import RefundDetailModal from './components/RefundDetailModal';
import { DateRange } from '../../moderation/components/shared/DateRangePicker';

const RefundList: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext)!;

    // State dữ liệu
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State điều khiển UI
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<{ search: string; status: 'all' | 'pending' | 'completed' | 'rejected' }>({ search: '', status: 'all' });
    const [dates, setDates] = useState<DateRange>({ start: null, end: null });
    
    // State cho Modal
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Hàm tải dữ liệu
    const loadRefunds = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchRefunds({ ...filters, page, limit: 12, startDate: dates.start, endDate: dates.end });
            setRefunds(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            setError('Không thể tải danh sách yêu cầu hoàn tiền.');
        } finally {
            setLoading(false);
        }
    }, [page, filters, dates]);

    useEffect(() => {
        loadRefunds();
    }, [loadRefunds]);

    useEffect(() => { setPage(1); }, [filters, dates]);
    
    // Handler cho việc xử lý hoàn tiền
    const handleProcessRefund = async (payload: Omit<ProcessRefundPayload, 'adminId'>) => {
        if (!selectedRefund || !currentUser) return;
        
        setIsProcessing(true);
        try {
            await processRefund(selectedRefund.id, { ...payload, adminId: currentUser.id });
            setSelectedRefund(null); // Đóng modal
            loadRefunds(); // Tải lại danh sách
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };
    

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <RefundToolbar 
                filters={filters} 
                onSearchChange={(search) => setFilters(f => ({ ...f, search }))}
                onStatusChange={(status) => setFilters(f => ({ ...f, status }))}
                dates={dates}
                onDatesChange={setDates}
            />
            {error ? (
                <div className="p-4 text-red-600">{error}</div>
            ) : (
                <>
                    <RefundCardList
                        refunds={refunds}
                        loading={loading}
                        onViewDetails={setSelectedRefund}
                    />
                    {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
                </>
            )}

            <RefundDetailModal
                isOpen={!!selectedRefund}
                onClose={() => setSelectedRefund(null)}
                refund={selectedRefund}
                onProcess={handleProcessRefund}
                isProcessing={isProcessing}
                currentUserRole={currentUser?.role}
            />
        </div>
    );
};

export default RefundList;