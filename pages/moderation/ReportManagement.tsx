import React, { useState, useEffect, useCallback, useContext } from 'react';
import ReportsTab from './tabs/ReportsTab';
import ViolationsTab from './tabs/ViolationsTab';
import AppealsTab from './tabs/AppealsTab';
import NotificationsTab from './tabs/NotificationsTab';
import { ReportIcon, ShieldExclamationIcon, ChatAlt2Icon, BellIcon } from '../../constants';
import { Report, Violation, Appeal, User, Notification, PaginatedResponse } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
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
    // Lấy dữ liệu vi phạm và các hàm action từ context để đảm bảo đồng bộ
    const { communityRules, violations: contextViolations, updatePost, updateComment, updateUser, removeViolationByTarget } = useAppData();
    const [activeTab, setActiveTab] = useState<ActiveTab>('reports');
    
    // State cục bộ cho dữ liệu của module
    const [reports, setReports] = useState<PaginatedResponse<Report> | null>(null);
    const [appeals, setAppeals] = useState<PaginatedResponse<Appeal> | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // State quản lý tập trung cho các modal
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    
    // Hàm tải tất cả dữ liệu trừ violations (đã lấy từ context)
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Tạm thời fetch tất cả mà không phân trang để lấy count.
            const [reportsData, appealsData, notificationsData] = await Promise.all([
                api.fetchReports({ limit: 999 }),
                api.fetchAppeals({ limit: 999 }),
                api.fetchNotifications(),
            ]);
            setReports(reportsData);
            setAppeals(appealsData);
            setNotifications(notificationsData);
        } catch (error) {
            console.error("Failed to load moderation data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Handlers cho actions
    const handleUpdateReport = async (reportId: string, action: 'start_processing' | 'resolve' | 'dismiss', data: any) => {
        try {
            const updatedReport = await api.updateReportStatus(reportId, {
                status: action === 'start_processing' ? 'in_progress' : action === 'resolve' ? 'resolved' : 'dismissed',
                resolution: data.resolution,
                severity: data.severity,
                adminId: currentUser.id,
            });
            // Tải lại toàn bộ dữ liệu để đảm bảo đồng bộ, bao gồm cả violation mới (nếu có)
            loadData();
            if (action !== 'start_processing') {
                setSelectedReport(null); // Đóng modal sau khi xử lý
            }
        } catch (error) {
            alert('Cập nhật báo cáo thất bại');
        }
    };
    
    const handleProcessAppeal = async (appealId: string, action: 'accepted' | 'rejected', notes: string) => {
        try {
            const processedAppeal = await api.processAppeal(appealId, { action, notes, adminId: currentUser.id });
            
            // Đồng bộ hóa trạng thái vào AppDataContext sau khi API thành công
            if (action === 'accepted') {
                const violation = processedAppeal.violation_snapshot;
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
            
            loadData(); // Tải lại dữ liệu cục bộ cho trang kiểm duyệt
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
                return <ReportsTab reportsData={reports} onOpenReport={handleOpenReport} loading={loading} communityRules={communityRules}/>;
            case 'violations':
                // Sử dụng violations từ context
                return <ViolationsTab violations={contextViolations} onOpenViolation={handleOpenViolation} loading={loading && contextViolations.length === 0} />;
            case 'appeals':
                return <AppealsTab appealsData={appeals} onOpenAppeal={handleOpenAppeal} loading={loading} />;
            case 'notifications':
                return <NotificationsTab notifications={notifications} onNavigateToAction={handleNavigateFromNotification} refreshData={loadData} />;
            default:
                return null;
        }
    };

    const unreadAdminNotifs = notifications.filter(n => (n.audience === 'admin' || n.from_system) && !n.read_at).length;
    const pendingReportsCount = reports?.data.filter(r => r.status === 'pending').length || 0;
    const pendingAppealsCount = appeals?.data.filter(a => a.status === 'pending').length || 0;

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