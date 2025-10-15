
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/appData/provider';
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

const ProtectedRoute: React.FC = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        return <Navigate to="/login" replace />;
    }
    const { isAuthenticated } = authContext;
    return isAuthenticated ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppDataProvider>
                <MainApp />
            </AppDataProvider>
        </AuthProvider>
    );
};

const MainApp: React.FC = () => {
    return (
        <HashRouter>
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
                    <Route path="/system" element={<SystemManagement />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </HashRouter>
    );
}

export default App;