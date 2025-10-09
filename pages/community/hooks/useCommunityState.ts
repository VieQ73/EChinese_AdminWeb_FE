import { useState } from 'react';
import { Post, User, CommentWithUser } from '../../../types';

export type ModerationAction = {
    action: 'remove' | 'restore';
    type: 'post' | 'comment';
    item: Post | CommentWithUser;
    isSelfAction: boolean;
};

export const useCommunityState = () => {
    // Modals state
    const [isCreateEditModalOpen, setCreateEditModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isUserActivityModalOpen, setUserActivityModalOpen] = useState(false);
    const [isModerationModalOpen, setModerationModalOpen] = useState(false);

    // Data state
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [moderationAction, setModerationAction] = useState<ModerationAction | null>(null);

    // State for URL-driven actions
    const [initialActivityTab, setInitialActivityTab] = useState<string | undefined>();
    const [initialActivitySubTab, setInitialActivitySubTab] = useState<string | undefined>();

    // Filters state - Đã được đơn giản hóa
    const [searchTerm, setSearchTerm] = useState(''); // Search term này hiện không dùng cho post, có thể dùng cho user sau này
    const [filters, setFilters] = useState({ topic: 'all' });
    
    return {
        state: {
            isCreateEditModalOpen,
            isDetailModalOpen,
            isUserActivityModalOpen,
            isModerationModalOpen,
            editingPost,
            viewingPost,
            selectedUser,
            moderationAction,
            initialActivityTab,
            initialActivitySubTab,
            searchTerm,
            filters,
        },
        setters: {
            setCreateEditModalOpen,
            setDetailModalOpen,
            setUserActivityModalOpen,
            setModerationModalOpen,
            setEditingPost,
            setViewingPost,
            setSelectedUser,
            setModerationAction,
            setInitialActivityTab,
            setInitialActivitySubTab,
            setSearchTerm,
            setFilters,
        },
    };
};