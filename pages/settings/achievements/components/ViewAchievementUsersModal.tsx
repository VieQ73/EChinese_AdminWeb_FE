import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../../../components/Modal';
import { Achievement, UserAchievement, User } from '../../../../types';
import * as api from '../api';
import { Pagination } from '../../../../components/ui/pagination';
import { Loader2, UserPlus } from 'lucide-react';
import { useAppData } from '../../../../contexts/appData/context';

interface ViewAchievementUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievement: Achievement;
    isSuperAdmin: boolean;
}

const ViewAchievementUsersModal: React.FC<ViewAchievementUsersModalProps> = ({ isOpen, onClose, achievement, isSuperAdmin }) => {
    const { grantAchievementToUser: grantAchievementViaContext } = useAppData();
    const [users, setUsers] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // State cho việc cấp thủ công
    const [isGranting, setIsGranting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [grantError, setGrantError] = useState('');
    const [showResults, setShowResults] = useState(false);
    
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.fetchAchievementUsers(achievement.id, { page, limit: 5 });
            setUsers(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error("Failed to load users for achievement", error);
        } finally {
            setLoading(false);
        }
    }, [achievement.id, page]);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
            // Reset grant state
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUser(null);
            setGrantError('');
            setShowResults(false);
        }
    }, [isOpen, loadUsers]);

    useEffect(() => {
        if (!searchQuery.trim() || selectedUser) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const handler = setTimeout(async () => {
            setIsSearching(true);
            const results = await api.searchUsersForGranting(searchQuery, achievement.id);
            setSearchResults(results);
            setShowResults(true);
            setIsSearching(false);
        }, 300); // Debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, achievement.id, selectedUser]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setSearchQuery(user.name); // Hiển thị tên người dùng đã chọn trong input
        setShowResults(false);
    };

    const handleGrant = async () => {
        if (!selectedUser) return;
        setGrantError('');
        setIsGranting(true);
        try {
            await grantAchievementViaContext(selectedUser.id, achievement.id);
            // Reset state sau khi cấp thành công
            setSearchQuery('');
            setSelectedUser(null);
            loadUsers(); // Làm mới danh sách người dùng trong modal
        } catch (error) {
            setGrantError((error as Error).message);
        } finally {
            setIsGranting(false);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Người dùng đã đạt "${achievement.name}"`} className="max-w-2xl">
            <div className="space-y-4">
                {isSuperAdmin && (
                    <div className="p-4 bg-gray-50 border rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm">Cấp thủ công</h4>
                        <div className="relative flex gap-2">
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (selectedUser) setSelectedUser(null); // Xóa lựa chọn nếu người dùng gõ lại
                                }}
                                onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                                onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay để cho phép click
                                placeholder="Tìm theo ID, Email, Username, Tên..."
                                className="flex-grow p-2 border rounded-md"
                                autoComplete="off"
                            />
                            <button onClick={handleGrant} disabled={!selectedUser || isGranting} className="px-4 bg-primary-600 text-white rounded-md font-medium text-sm flex items-center disabled:opacity-50">
                                {isGranting ? <Loader2 size={16} className="animate-spin mr-2"/> : <UserPlus size={16} className="mr-2"/>}
                                Cấp
                            </button>
                            { (isSearching || (showResults && searchResults.length > 0)) && (
                                <div className="absolute top-full mt-1 w-[calc(100%-80px)] bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {isSearching ? <div className="p-2 text-center text-gray-500 text-sm">Đang tìm...</div> : 
                                        searchResults.map(user => (
                                            <div key={user.id} onMouseDown={() => handleSelectUser(user)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                                <p className="font-semibold text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        ))
                                    }
                                    {searchResults.length === 0 && !isSearching && <div className="p-2 text-center text-gray-500 text-sm">Không tìm thấy.</div>}
                                </div>
                            )}
                        </div>
                        {grantError && <p className="text-xs text-red-500 mt-1">{grantError}</p>}
                    </div>
                )}
                <div className="min-h-[200px]">
                    {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div> :
                     users.length === 0 ? <p className="text-center text-gray-500 py-8">Chưa có ai đạt được thành tích này.</p> :
                     (
                        <div className="space-y-3">
                            {users.map(ua => (
                                <div key={ua.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <img src={ua.user_avatar || ''} alt={ua.user_name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold">{ua.user_name}</p>
                                            <p className="text-xs text-gray-500">ID: {ua.user_id}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Đạt lúc: {new Date(ua.achieved_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                     )
                    }
                </div>
                {totalPages > 1 && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </div>
        </Modal>
    );
};

export default ViewAchievementUsersModal;