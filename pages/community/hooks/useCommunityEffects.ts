import { useEffect, useRef } from 'react';
//  Changed imports of `useLocation` and `useNavigate` from `react-router-dom` to `react-router` to resolve module export errors.
import { useLocation, useNavigate } from 'react-router';
import { Post, User } from '../../../types';
import { fetchPostById } from '../api'; // Import new function
import { fetchUserCommunityActivity } from '../api/activity';

interface UseCommunityEffectsProps {
    state: any;
    setters: any;
    context: {
        posts: Post[];
        users?: User[];
    };
}

export const useCommunityEffects = ({ state, setters, context }: UseCommunityEffectsProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const processedUserActivityRef = useRef<string | null>(null);

    // Effect to handle opening modals from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const postIdToOpen = params.get('openPostId');
        const userIdToOpen = params.get('openUserActivity');

        // This effect should only run once when the params are present.
        // It's crucial to clean up the URL to prevent re-triggering.
        if (postIdToOpen) {
            // Clean up URL immediately to prevent re-triggering
            navigate('/community', { replace: true });
            
            // Fetch post directly to ensure it's available, even if not on the current feed page
            fetchPostById(postIdToOpen).then(post => {
                if (post) {
                    setters.setViewingPost(post);
                    setters.setDetailModalOpen(true);
                } else {
                    console.error(`Post with ID ${postIdToOpen} not found.`);
                }
            });
        } else if (userIdToOpen) {
            // Avoid handling the same userId repeatedly due to re-renders
            if (processedUserActivityRef.current === userIdToOpen) return;
            processedUserActivityRef.current = userIdToOpen;
            // Clean up URL immediately
            navigate('/community', { replace: true });
            // Prefer real users from context; fallback to a minimal placeholder if not present
            const userFromContext = (context as any).users?.find((u: User) => u.id === userIdToOpen);
            const user: User | undefined = userFromContext || (undefined);
            if (user) {
                // Guard: if already loading or loaded for this user, skip new fetch
                if (state.selectedUser?.id === user.id && state.selectedUserActivity !== null && state.selectedUserActivity !== undefined) {
                    setters.setUserActivityModalOpen(true);
                    return;
                }
                setters.setInitialActivityTab(params.get('tab') || undefined);
                setters.setInitialActivitySubTab(params.get('subTab') || undefined);
                setters.setSelectedUser(user);
                // Set loading state for activity data
                setters.setSelectedUserActivity(undefined);
                setters.setUserActivityModalOpen(true);
                // Force a fresh fetch for activity when coming from moderation/notification navigation
                fetchUserCommunityActivity(user.id, { force: true })
                    .then(activity => setters.setSelectedUserActivity(activity))
                    .catch(err => {
                        console.error('Failed to load user activity from URL param', err);
                        setters.setSelectedUserActivity(null);
                    });
            } else {
                // If we cannot find the user object, still open the modal after fetching activity
                const placeholder: User = {
                    id: userIdToOpen,
                    username: userIdToOpen,
                    name: 'Người dùng',
                    avatar_url: '',
                    email: null,
                    provider: 'local',
                    role: 'user',
                    is_active: true,
                    isVerify: false,
                    community_points: 0,
                    level: '1',
                    badge_level: 0,
                    language: 'Tiếng Việt',
                    created_at: new Date().toISOString(),
                    last_login: null,
                } as any;

                setters.setInitialActivityTab(params.get('tab') || undefined);
                setters.setInitialActivitySubTab(params.get('subTab') || undefined);
                setters.setSelectedUser(placeholder);
                setters.setSelectedUserActivity(undefined);
                setters.setUserActivityModalOpen(true);
                fetchUserCommunityActivity(userIdToOpen, { force: true })
                    .then(activity => setters.setSelectedUserActivity(activity))
                    .catch(err => {
                        console.error('Failed to load user activity (no user in context)', err);
                        setters.setSelectedUserActivity(null);
                    });
            }
        }
    }, [location.search, navigate]);

    // Effect to keep modal data in sync with the main list if it's updated
    useEffect(() => {
        if (state.viewingPost && context.posts.length > 0) {
            const updatedPostInList = context.posts.find(p => p.id === state.viewingPost.id);
            if (updatedPostInList && JSON.stringify(updatedPostInList) !== JSON.stringify(state.viewingPost)) {
                setters.setViewingPost(updatedPostInList);
            }
        }
    }, [context.posts, state.viewingPost, setters]);
};
