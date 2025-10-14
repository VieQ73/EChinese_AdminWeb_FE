import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import type { User } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchUserDetailData, UserDetailData } from './userApi';
import { useUserActions } from './hooks/useUserActions';
import { useAppData } from '../../contexts/appData/context'; // 

import UserHeader from './components/UserHeader';
import UserTabs from './components/UserTabs';
import UserActionModal from './components/UserActionModal';
import UserSummaryTab from './components/tabs/UserSummaryTab';
import UserActivityTab from './components/tabs/UserActivityTab';
import UserAchievementsTab from './components/tabs/UserAchievementsTab';
import UserQuotaTab from './components/tabs/UserQuotaTab';
import SuperAdminActionsTab from './components/tabs/SuperAdminActionsTab';

// Component Notification để hiển thị thông báo ngắn gọn.
const Notification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-6 bg-primary-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
            {message}
        </div>
    );
};

/**
 * Trang chi tiết người dùng.
 * Component này đóng vai trò là container:
 * - Quản lý state chính (dữ liệu người dùng, loading, modal).
 * - Fetch dữ liệu từ API.
 * - Sử dụng custom hook `useUserActions` để xử lý logic các hành động.
 * - Render các component con cho từng phần của UI (header, tabs, content, modal).
 */
const UserDetail: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const { violations } = useAppData(); // Lấy dữ liệu vi phạm từ context

    // State chính của trang
    const [data, setData] = useState<UserDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    
    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{type: string | null, title: string, data?: any}>({ type: null, title: '' });
    const [editableUser, setEditableUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('summary');
    
    const currentUser = authContext?.user;
    
    // Hàm tải dữ liệu
    const loadData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchUserDetailData(userId);
            setData(result);
            setEditableUser(result.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu người dùng.");
        } finally {
            setLoading(false);
        }
    }, [userId]);
    
    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const user = data?.user;
    const isSuperAdmin = currentUser?.role === 'super admin';
    const isViewingSelf = currentUser?.id === user?.id;

    // Handlers cho modal và actions
    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleAction = useUserActions({
        user, currentUser, editableUser, setData, loadData,
        setNotification: (msg: string) => setNotification(msg),
        closeModal: handleCloseModal,
    });

    const handleOpenModal = (type: string, title: string, modalData?: any) => {
        const isAdminOrSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';
        
        setModalContent({ 
            type, 
            title, 
            data: { ...modalData, isViewingSelf, isAdminOrSuperAdmin } 
        });
        setEditableUser(user);
        setIsModalOpen(true);
    };

    // Tính toán số vi phạm của người dùng từ context
    const violationCount = useMemo(() => {
        if (!userId) return 0;
        return violations.filter(v => v.user_id === userId).length;
    }, [violations, userId]);
    
    // Logic render nội dung cho các tab
    const renderTabContent = () => {
        if (!data) return null;
        const { user, usage, subscription, streak, dailyActivities, sessions } = data;
        const usageLesson = usage.find(u => u.feature === 'ai_lesson');
        const usageTranslate = usage.find(u => u.feature === 'ai_translate');

        switch (activeTab) {
            case 'summary':
                return <UserSummaryTab user={user} subscription={subscription} onOpenModal={handleOpenModal} isViewingSelf={isViewingSelf} />;
            case 'activity':
                return <UserActivityTab streak={streak} dailyActivities={dailyActivities} sessions={sessions} />;
            case 'achievements':
                return <UserAchievementsTab userId={user.id} />;
            case 'quota':
                return <UserQuotaTab usageLesson={usageLesson} usageTranslate={usageTranslate} subscription={subscription} isSuperAdmin={isSuperAdmin} onOpenModal={handleOpenModal} />;
            case 'actions':
                return isSuperAdmin ? <SuperAdminActionsTab isViewingSelf={isViewingSelf} onOpenModal={handleOpenModal} /> : <p>Bạn không có quyền xem tab này.</p>;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
    }

    if (error || !data) {
        return <div className="p-6">{error || 'Không tìm thấy người dùng.'} <button onClick={() => navigate('/users')} className="text-primary-600">Quay lại</button></div>;
    }

    return (
        <div className="space-y-6">
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
            
            <UserActionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                modalContent={modalContent}
                user={data.user}
                editableUser={editableUser}
                setEditableUser={setEditableUser}
                onConfirm={handleAction}
            />

            <UserHeader user={data.user} onBack={() => navigate('/users')} violationCount={violationCount} />

            <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} isSuperAdmin={isSuperAdmin} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default UserDetail;