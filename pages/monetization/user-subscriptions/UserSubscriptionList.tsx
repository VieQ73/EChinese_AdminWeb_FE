import React, { useState, useEffect, useCallback, useContext } from 'react';
import { EnrichedUserSubscription, UserSubscriptionHistoryItem } from '../../../types';
import { AuthContext } from '../../../contexts/AuthContext';
import { useAppData } from '../../../contexts/appData/context';
import { fetchEnrichedUserSubscriptions, fetchUserSubscriptionHistory, updateUserSubscriptionDetails, UpdateUserSubscriptionDetailsPayload } from '../api';
import { resetUserQuota } from '../../users/userApi'; // Import API reset quota

import { Pagination } from '../../../components/ui/pagination';
import UserSubscriptionToolbar from './components/UserSubscriptionToolbar';
import UserSubscriptionCardList from './components/UserSubscriptionCardList';
import ManageUserSubscriptionModal from './components/ManageUserSubscriptionModal';

const UserSubscriptionList: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext)!;
    const { updateUserUsage } = useAppData();

    // State dữ liệu
    const [userSubs, setUserSubs] = useState<EnrichedUserSubscription[]>([]);
    const [history, setHistory] = useState<UserSubscriptionHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State điều khiển UI
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State cho Modal
    const [selectedUserSub, setSelectedUserSub] = useState<EnrichedUserSubscription | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Hàm tải dữ liệu chính
    const loadUserSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchEnrichedUserSubscriptions({ page, limit: 12, search: searchTerm });
            setUserSubs(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            setError('Không thể tải danh sách gói của người dùng.');
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        loadUserSubscriptions();
    }, [loadUserSubscriptions]);

    useEffect(() => { setPage(1); }, [searchTerm]);

    // Handler mở modal và tải lịch sử
    const handleManage = async (userSub: EnrichedUserSubscription) => {
        setSelectedUserSub(userSub);
        setIsProcessing(true); // Dùng isProcessing để thể hiện đang tải history
        try {
            const historyData = await fetchUserSubscriptionHistory(userSub.user.id);
            setHistory(historyData);
        } catch (err) {
            alert('Không thể tải lịch sử gói.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCloseModal = () => {
        setSelectedUserSub(null);
        setHistory([]);
    };

    // Handler cho các action trong modal
    const handleAction = async (userSubId: string, payload: UpdateUserSubscriptionDetailsPayload) => {
        setIsProcessing(true);
        try {
            await updateUserSubscriptionDetails(userSubId, payload);
            handleCloseModal();
            loadUserSubscriptions(); // Tải lại danh sách
        } catch(err: any) {
             alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handler cho việc reset quota
    const handleResetQuota = async (userId: string, feature: 'ai_lesson' | 'ai_translate') => {
        setIsProcessing(true);
        try {
            await resetUserQuota(userId, feature);
            // Cập nhật context để đồng bộ với trang User Detail
            updateUserUsage(userId, feature, { daily_count: 0, last_reset: new Date().toISOString() });
            // Tải lại dữ liệu để cập nhật quota trên bảng
            await loadUserSubscriptions();
        } catch(err: any) {
             alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <UserSubscriptionToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            {error ? (
                <div className="p-4 text-red-600">{error}</div>
            ) : (
                <>
                    <UserSubscriptionCardList
                        userSubscriptions={userSubs}
                        loading={loading}
                        onManage={handleManage}
                    />
                    {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
                </>
            )}

            <ManageUserSubscriptionModal
                isOpen={!!selectedUserSub}
                onClose={handleCloseModal}
                userSub={selectedUserSub}
                history={history}
                onAction={handleAction}
                onResetQuota={handleResetQuota}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default UserSubscriptionList;