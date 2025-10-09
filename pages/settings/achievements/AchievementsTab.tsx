import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Achievement } from '../../../types';
import { AuthContext } from '../../../contexts/AuthContext';
import { useAppData } from '../../../contexts/AppDataContext';
import { Pagination } from '../../../components/ui/pagination';
import ConfirmationModal from '../../monetization/components/ConfirmationModal';
import AchievementsToolbar from './components/AchievementsToolbar';
import AchievementTable from './components/AchievementTable';
import AddEditAchievementModal from './components/AddEditAchievementModal';
import ViewAchievementUsersModal from './components/ViewAchievementUsersModal';
import { AchievementPayload } from '../api';

const AchievementsTab: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext)!;
    const { achievements: allAchievements, createAchievement, updateAchievement, deleteAchievement } = useAppData();

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ search: '', status: 'all' as 'all' | 'active' | 'inactive' });
    
    // Modals state
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
    const [viewingUsersFor, setViewingUsersFor] = useState<Achievement | null>(null);
    const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null);

    const displayedAchievements = useMemo(() => {
        let filtered = [...allAchievements];
        if (filters.search) {
            filtered = filtered.filter(a => a.name.toLowerCase().includes(filters.search.toLowerCase()));
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(a => a.is_active === (filters.status === 'active'));
        }
        filtered.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return filtered;
    }, [allAchievements, filters]);

    const { paginatedAchievements, totalPages } = useMemo(() => {
        const limit = 10;
        const totalPages = Math.ceil(displayedAchievements.length / limit);
        const start = (page - 1) * limit;
        const data = displayedAchievements.slice(start, start + limit);
        return { paginatedAchievements: data, totalPages };
    }, [displayedAchievements, page]);
    
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // Handlers
    const handleSave = async (payload: AchievementPayload) => {
        setLoading(true);
        try {
            if (editingAchievement) {
                await updateAchievement(editingAchievement.id, payload);
            } else {
                await createAchievement(payload);
            }
            setAddEditModalOpen(false);
        } catch (error) {
            console.error("Failed to save achievement", error);
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!deletingAchievement) return;
        setLoading(true);
        try {
            await deleteAchievement(deletingAchievement.id);
            setDeletingAchievement(null);
        } catch (error) {
            console.error("Failed to delete achievement", error);
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleToggleActive = async (achievement: Achievement, isActive: boolean) => {
        setLoading(true);
        try {
            await updateAchievement(achievement.id, { is_active: isActive });
        } catch (error) {
            console.error("Failed to toggle achievement status", error);
            alert('Cập nhật trạng thái thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <AchievementsToolbar
                    filters={filters}
                    onFiltersChange={setFilters}
                    onCreate={() => { setEditingAchievement(null); setAddEditModalOpen(true); }}
                />
                <AchievementTable
                    achievements={paginatedAchievements}
                    loading={loading}
                    onEdit={(ach) => { setEditingAchievement(ach); setAddEditModalOpen(true); }}
                    onDelete={setDeletingAchievement}
                    onViewUsers={setViewingUsersFor}
                    onToggleActive={handleToggleActive}
                />
                {totalPages > 1 && !loading && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </div>

            {isAddEditModalOpen && (
                <AddEditAchievementModal
                    isOpen={isAddEditModalOpen}
                    onClose={() => setAddEditModalOpen(false)}
                    onSave={handleSave}
                    achievement={editingAchievement}
                />
            )}

            {viewingUsersFor && (
                <ViewAchievementUsersModal
                    isOpen={!!viewingUsersFor}
                    onClose={() => setViewingUsersFor(null)}
                    achievement={viewingUsersFor}
                    isSuperAdmin={currentUser?.role === 'super admin'}
                />
            )}
            
            {deletingAchievement && (
                <ConfirmationModal
                    isOpen={!!deletingAchievement}
                    onClose={() => setDeletingAchievement(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa thành tích"
                >
                    <p>Bạn có chắc chắn muốn xóa thành tích <strong>"{deletingAchievement.name}"</strong>? Hành động này không thể hoàn tác.</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AchievementsTab;
