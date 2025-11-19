
import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/appData/provider';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/users/UserManagement';
import CommunityManagement from './pages/community/CommunityManagement';
import ContentManagementPage from './pages/content/ContentManagementPage';
import SubscriptionManagement from './pages/monetization/SubscriptionManagement';
import AchievementManagement from './pages/settings/AchievementManagement';
import ModerationCenter from './pages/moderation/ReportManagement';
import TipsManagementPage from './pages/tips/TipsManagementPage';
import SystemManagement from './pages/system/SystemManagement';
import UserDetail from './pages/users/UserDetail';
import NotebookDetail from './pages/content/NotebookDetail';
import RuleManagementPage from './pages/rules/RuleManagementPage';
import MockTestManagementPage from './pages/tests/MockTestManagementPage';
import ExamCreatePage from './pages/tests/create/ExamCreatePage'; 
import ExamTypeDetailPage from './pages/tests/exam/ExamTypeDetailPage';
import AdminNotificationsPage from './pages/notifications/AdminNotificationsPage';
import NotificationPopup from './components/NotificationPopup';
import { setupForegroundListener } from './utils/notificationHelper';
import { useNavigate } from 'react-router-dom';
import { debugNotificationSetup, setupServiceWorkerMessageListener } from './utils/testNotification';

const ProtectedRoute: React.FC = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        return <Navigate to="/login" replace />;
    }
    const { isAuthenticated, initialized } = authContext as any;
    // While auth context is restoring from storage, don't redirect — wait
    if (!initialized) return null;
    return isAuthenticated ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

const NotificationPopupWrapper: React.FC<{ payload: any; onClose: () => void }> = ({ payload, onClose }) => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    return (
        <NotificationPopup 
            payload={payload} 
            onClose={onClose}
            onNavigate={handleNavigate}
        />
    );
};

const NotificationHandler: React.FC = () => {
    const authContext = useContext(AuthContext);
    const isAuthenticated = authContext?.isAuthenticated || false;
    const [notificationPayload, setNotificationPayload] = React.useState<any>(null);
    
    // Sử dụng useNotification hook
    const { incrementUnreadCount } = useNotification();

    useEffect(() => {
        console.log('🔧 NotificationHandler useEffect - isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('⚠️ User not authenticated, skipping listener setup');
            return;
        }

        console.log('✅ Setting up foreground listener...');
        console.log('✅ incrementUnreadCount function:', incrementUnreadCount);
        
        const callbackFunction = (payload: any) => {
            console.log('🎊🎊🎊 [NotificationHandler] ===== CALLBACK TRIGGERED! =====');
            console.log('📩 [NotificationHandler] Received notification payload:', payload);
            console.log('📩 [NotificationHandler] Payload type:', typeof payload);
            console.log('📩 [NotificationHandler] Payload keys:', Object.keys(payload));
            
            // Tăng unread count
            console.log('🔢 [NotificationHandler] Calling incrementUnreadCount...');
            incrementUnreadCount();
            console.log('✅ [NotificationHandler] Incremented unread count');
            
            // Hiển thị popup
            console.log('🎨 [NotificationHandler] Setting notification payload for popup...');
            setNotificationPayload(payload);
            console.log('✅ [NotificationHandler] Notification payload set!');
        };
        
        console.log('✅ Callback function created:', callbackFunction);
        const unsubscribe = setupForegroundListener(callbackFunction);

        if (unsubscribe) {
            console.log('✅ Foreground listener setup successfully');
            console.log('✅ Unsubscribe function:', unsubscribe);
        } else {
            console.log('❌ Failed to setup foreground listener');
        }

        return () => {
            console.log('🧹 Cleaning up foreground listener');
            if (unsubscribe) {
                console.log('🧹 Calling unsubscribe...');
                unsubscribe();
                console.log('✅ Unsubscribed successfully');
            }
        };
    }, [isAuthenticated, incrementUnreadCount]);

    // Test function
    const testNotification = React.useCallback(() => {
        console.log('🧪 Testing notification popup...');
        const testPayload = {
            notification: {
                title: 'Test Notification',
                body: 'Đây là test notification để kiểm tra popup'
            },
            data: {
                type: 'system',
                redirect_url: 'app://home'
            }
        };
        console.log('🧪 Test payload:', testPayload);
        setNotificationPayload(testPayload);
        incrementUnreadCount();
    }, [incrementUnreadCount]);

    React.useEffect(() => {
        (window as any).testNotification = testNotification;
        console.log('✅ Test function exposed: window.testNotification()');
        
        // Setup Service Worker message listener
        setupServiceWorkerMessageListener();
        
        // Debug notification setup
        debugNotificationSetup();
    }, [testNotification]);

    return (
        <NotificationPopupWrapper 
            payload={notificationPayload}
            onClose={() => {
                console.log('🔴 Closing notification popup');
                setNotificationPayload(null);
            }}
        />
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <AppDataProvider>
                    <MainApp />
                </AppDataProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

const MainApp: React.FC = () => {
    return (
        <HashRouter>
            <NotificationHandler />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/users/:userId" element={<UserDetail />} />
                    <Route path="/community" element={<CommunityManagement />} />
                    <Route path="/notebooks" element={<ContentManagementPage />} />
                    <Route path="/notebooks/:notebookId" element={<NotebookDetail />} />
                    <Route path="/reports" element={<ModerationCenter />} />
                    <Route path="/subscriptions" element={<SubscriptionManagement />} />
                    <Route path="/achievements" element={<AchievementManagement />} />
                    <Route path="/rules" element={<RuleManagementPage />} />
                    <Route path="/tips" element={<TipsManagementPage />} />
                    <Route path="/mock-tests" element={<MockTestManagementPage />} />
                    <Route path="/mock-tests/create" element={<ExamCreatePage />} />
                    <Route path="/mock-tests/edit/:examId" element={<ExamCreatePage />} />
                    <Route path="/mock-tests/type/:examTypeId" element={<ExamTypeDetailPage />} />
                    <Route path="/notifications" element={<AdminNotificationsPage />} />
                    <Route path="/system" element={<SystemManagement />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </HashRouter>
    );
}

export default App;