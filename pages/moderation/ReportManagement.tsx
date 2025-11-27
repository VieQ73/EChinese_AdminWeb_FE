import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ReportsTab from './tabs/ReportsTab';
import ViolationsTab from './tabs/ViolationsTab';
import AppealsTab from './tabs/AppealsTab';
import NotificationsTab from './tabs/NotificationsTab';
import { ReportIcon, ShieldExclamationIcon, ChatAlt2Icon, BellIcon } from '../../constants';
import { Report, Violation, Appeal, Notification, PaginatedResponse } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as api from './api'; // Import API mới

// Import modals từ vị trí mới
import ReportDetailModal from './components/details/ReportDetailModal';
import ViolationDetailModal from './components/details/ViolationDetailModal';
import AppealDetailModal from './components/details/AppealDetailModal';
import { useAppData } from '../../contexts/appData/context';


type ActiveTab = 'reports' | 'violations' | 'appeals' | 'notifications';

const TabButton: React.FC<{
    tabName: ActiveTab;
    activeTab: ActiveTab;
    onClick: (tab: ActiveTab) => void;
    label: string;
    icon: React.FC<any>;
    count?: number;
}> = ({ tabName, activeTab, onClick, label, icon: Icon, count }) => {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => onClick(tabName)}
            className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors ${
                isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
            {count !== undefined && count > 0 && (
                 <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-700'}`}>
                    {count}
                </span>
            )}
        </button>
    );
};


const ModerationCenter: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext)!;
    const location = useLocation();
    const { refreshUnreadCount } = useNotification();
    // Lấy các hàm action từ context để đảm bảo đồng bộ
    const { communityRules, updatePost, updateComment, updateUser, removeViolationByTarget } = useAppData();
    
    // Đọc tab từ URL query params
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab') as ActiveTab;
    const notificationIdFromUrl = searchParams.get('notificationId'); // Lấy ID thông báo từ URL
    const reportIdFromUrl = searchParams.get('report'); // Lấy ID báo cáo từ URL
    const [activeTab, setActiveTab] = useState<ActiveTab>(tabFromUrl || 'reports');
    
    // State cục bộ cho dữ liệu của module
    const [reports, setReports] = useState<PaginatedResponse<Report> | null>(null);
    const [appeals, setAppeals] = useState<PaginatedResponse<Appeal> | null>(null);
    const [violations, setViolations] = useState<PaginatedResponse<Violation> | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
    const [loadingStates, setLoadingStates] = useState({
        reports: false,
        appeals: false,
        violations: false,
        notifications: false,
    });
    
    // Cập nhật activeTab khi URL thay đổi
    useEffect(() => {
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);
    
    // Tự động mở modal báo cáo khi có reportId trong URL
    useEffect(() => {
        const fetchAndOpenReport = async () => {
            if (!reportIdFromUrl) return;
            
            // Tìm trong danh sách hiện tại trước
            const existingReport = reports?.data.find(r => r.id === reportIdFromUrl);
            if (existingReport) {
                handleOpenReport(existingReport);
                return;
            }
            
            // Nếu không tìm thấy, fetch từ API
            try {
                const response = await api.fetchReportById(reportIdFromUrl);
                if (response.success && response.data) {
                    handleOpenReport(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch report:', error);
            }
        };
        
        fetchAndOpenReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportIdFromUrl, reports]);
    
    // Refresh unread count khi vào trang Kiểm duyệt
    useEffect(() => {
        refreshUnreadCount();
    }, [refreshUnreadCount]);

    // Load số lượng báo cáo pending khi component mount
    useEffect(() => {
        const loadPendingCount = async () => {
            try {
                const response = await api.fetchPendingReportsCount();
                if (response.success) {
                    setPendingReportsCount(response.data.count);
                }
            } catch (error) {
                console.error('Failed to load pending reports count:', error);
            }
        };
        loadPendingCount();
    }, []);

    // State quản lý tập trung cho các modal
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    
    // Hàm tải dữ liệu cho từng tab riêng biệt với phân trang API
    // Reports, Appeals, Violations: limit=12
    // Notifications: limit=15
    const loadReportsData = useCallback(async (
        page: number = 1, 
        limit: number = 12,
        filters?: { status?: string; target_type?: string; search?: string }
    ) => {
        setLoadingStates(prev => ({ ...prev, reports: true }));
        try {
            const reportsRes = await api.fetchReports({ 
                page, 
                limit,
                status: filters?.status as any,
                targetType: filters?.target_type as any,
                search: filters?.search
            });
            setReports(reportsRes.data);
        } catch (error) {
            console.error("Failed to load reports data", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, reports: false }));
        }
    }, []);

    const loadAppealsData = useCallback(async (
        page: number = 1, 
        limit: number = 12,
        filters?: { status?: string; search?: string }
    ) => {
        setLoadingStates(prev => ({ ...prev, appeals: true }));
        try {
            const appealsRes = await api.fetchAppeals({ 
                page, 
                limit,
                status: filters?.status as any,
                search: filters?.search
            });
            setAppeals(appealsRes.data);
        } catch (error) {
            console.error("Failed to load appeals data", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, appeals: false }));
        }
    }, []);

    const loadViolationsData = useCallback(async (
        page: number = 1, 
        limit: number = 12,
        filters?: { severity?: string; targetType?: string; search?: string }
    ) => {
        setLoadingStates(prev => ({ ...prev, violations: true }));
        try {
            const violationsRes = await api.fetchViolations({ 
                page, 
                limit,
                severity: filters?.severity as any,
                targetType: filters?.targetType as any,
                search: filters?.search
            });
            setViolations(violationsRes.data);
        } catch (error) {
            console.error("Failed to load violations data", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, violations: false }));
        }
    }, []);

    const loadNotificationsData = useCallback(async (
        page: number = 1, 
        limit: number = 15,
        filters?: { read_status?: string; type?: string; status?: string; audience?: string }
    ) => {
        setLoadingStates(prev => ({ ...prev, notifications: true }));
        try {
            const [receivedNotifs, sentNotifs] = await Promise.all([
                api.fetchReceivedNotifications({ 
                    page, 
                    limit,
                    read_status: filters?.read_status as any,
                    type: filters?.type
                }),
                api.fetchSentNotifications({ 
                    page, 
                    limit,
                    status: filters?.status as any,
                    audience: filters?.audience,
                    type: filters?.type
                }),
            ]);
            
            // Gộp thông báo nhận và gửi, đánh dấu nguồn và meta
            const allNotifications = [
                ...receivedNotifs.data.map(n => ({ ...n, _source: 'received' as const, _meta: receivedNotifs.meta })),
                ...sentNotifs.data.map(n => ({ ...n, _source: 'sent' as const, _meta: sentNotifs.meta }))
            ];
            setNotifications(allNotifications as any);
            console.log('Received notifications:', receivedNotifs.data, 'Meta:', receivedNotifs.meta);
            console.log('Sent notifications:', sentNotifs.data, 'Meta:', sentNotifs.meta);
        } catch (error) {
            console.error("Failed to load notifications data", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, notifications: false }));
        }
    }, []);

    // Load dữ liệu mỗi khi chuyển tab (luôn reload để có dữ liệu mới nhất)
    useEffect(() => {
        switch (activeTab) {
            case 'reports':
                loadReportsData();
                break;
            case 'violations':
                loadViolationsData();
                break;
            case 'appeals':
                loadAppealsData();
                break;
            case 'notifications':
                loadNotificationsData();
                break;
        }
    }, [activeTab, loadReportsData, loadViolationsData, loadAppealsData, loadNotificationsData]);


    // Handlers cho actions
    const handleUpdateReport = async (reportId: string, action: 'start_processing' | 'resolve' | 'dismiss', data: any) => {
        try {
            await api.updateReportStatus(reportId, {
                status: action === 'start_processing' ? 'in_progress' : action === 'resolve' ? 'resolved' : 'dismissed',
                resolution: data.resolution,
                severity: data.severity,
                adminId: currentUser.id,
            });
            // Tải lại dữ liệu của tab hiện tại
            await loadReportsData();
            // Cập nhật lại số lượng báo cáo pending
            const response = await api.fetchPendingReportsCount();
            if (response.success) {
                setPendingReportsCount(response.data.count);
            }
            if (action !== 'start_processing') {
                setSelectedReport(null); // Đóng modal sau khi xử lý
            }
        } catch (error) {
            alert('Cập nhật báo cáo thất bại');
        }
    };
    
    const handleProcessAppeal = async (appealId: string, action: 'accepted' | 'rejected', notes: string) => {
        try {
            const processedAppealRes = await api.processAppeal(appealId, { action, notes, adminId: currentUser.id });
            
            // Đồng bộ hóa trạng thái vào AppDataContext sau khi API thành công
            if (action === 'accepted') {
                const violation = processedAppealRes.data.violation_snapshot;
                if (violation) {
                    // Cập nhật trạng thái content trong context
                    if (violation.target_type === 'post') {
                        updatePost(violation.target_id, { status: 'published', deleted_at: null, deleted_by: null, deleted_reason: null });
                    } else if (violation.target_type === 'comment') {
                        updateComment(violation.target_id, { deleted_at: null, deleted_by: null, deleted_reason: null });
                    } else if (violation.target_type === 'user') {
                        updateUser(violation.target_id, { is_active: true });
                    }
                    // Xóa bản ghi vi phạm khỏi context
                    removeViolationByTarget(violation.target_type, violation.target_id);
                }
            }
            
            // Tải lại dữ liệu của tab appeals
            await loadAppealsData();
            setSelectedAppeal(null);
        } catch (error) {
            alert('Xử lý khiếu nại thất bại');
        }
    };

    // Hàm mở modal, đảm bảo chỉ một modal được mở tại một thời điểm
    const handleOpenReport = (report: Report) => {
        setSelectedViolation(null);
        setSelectedAppeal(null);
        setSelectedReport(report);
    };

    const handleOpenViolation = (violation: Violation) => {
        setSelectedReport(null);
        setSelectedAppeal(null);
        setSelectedViolation(violation);
    };

    const handleOpenAppeal = (appeal: Appeal) => {
        setSelectedReport(null);
        setSelectedViolation(null);
        setSelectedAppeal(appeal);
    };
    
    const handleNavigateFromNotification = (type?: string, id?: string) => {
        if (!type || !id) return;
        if (type === 'report' && reports) {
            const report = reports.data.find(r => r.id === id);
            if (report) handleOpenReport(report);
        } else if (type === 'appeal' && appeals) {
            const appeal = appeals.data.find(a => a.id === id);
            if (appeal) handleOpenAppeal(appeal);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'reports':
                return <ReportsTab reportsData={reports} onOpenReport={handleOpenReport} loading={loadingStates.reports} communityRules={communityRules} refreshData={loadReportsData} />;
            case 'violations':
                // Sử dụng violations từ API để có dữ liệu mới nhất
                return <ViolationsTab violationsData={violations} onOpenViolation={handleOpenViolation} loading={loadingStates.violations} refreshData={loadViolationsData} />;
            case 'appeals':
                return <AppealsTab appealsData={appeals} onOpenAppeal={handleOpenAppeal} loading={loadingStates.appeals} refreshData={loadAppealsData} />;
            case 'notifications':
                return <NotificationsTab notifications={notifications} onNavigateToAction={handleNavigateFromNotification} refreshData={loadNotificationsData} loading={loadingStates.notifications} notificationIdToOpen={notificationIdFromUrl} />;
            default:
                return null;
        }
    };

    const unreadAdminNotifs = notifications.filter(n => (n.audience === 'admin' || n.from_system) && !n.read_at).length;
    const pendingAppealsCount = appeals?.meta?.total || 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Trung tâm Kiểm duyệt & Thông báo</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabName="reports" activeTab={activeTab} onClick={setActiveTab} label="Báo cáo" icon={ReportIcon} count={pendingReportsCount} />
                    <TabButton tabName="violations" activeTab={activeTab} onClick={setActiveTab} label="Lịch sử vi phạm" icon={ShieldExclamationIcon} />
                    <TabButton tabName="appeals" activeTab={activeTab} onClick={setActiveTab} label="Khiếu nại" icon={ChatAlt2Icon} count={pendingAppealsCount}/>
                    <TabButton tabName="notifications" activeTab={activeTab} onClick={setActiveTab} label="Thông báo" icon={BellIcon} count={unreadAdminNotifs} />
                </nav>
            </div>
            
            <div>
                {renderTabContent()}
            </div>

            {/* Render tất cả các modal ở đây, được điều khiển bởi state tập trung */}
            <ReportDetailModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
                onAction={handleUpdateReport}
            />
             <ViolationDetailModal
                isOpen={!!selectedViolation}
                onClose={() => setSelectedViolation(null)}
                violation={selectedViolation}
                relatedAppeal={appeals?.data.find(a => a.violation_id === selectedViolation?.id)}
                onOpenAppeal={(appeal) => handleOpenAppeal(appeal)}
            />
            <AppealDetailModal
                isOpen={!!selectedAppeal}
                onClose={() => setSelectedAppeal(null)}
                appeal={selectedAppeal}
                onAction={handleProcessAppeal}
                onOpenViolation={(violation) => handleOpenViolation(violation)}
            />
        </div>
    );
};

export default ModerationCenter;