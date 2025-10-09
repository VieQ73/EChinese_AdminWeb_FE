import { useEffect } from 'react';
// FIX: Changed imports of `useLocation` and `useNavigate` from `react-router-dom` to `react-router` to resolve module export errors.
import { useLocation, useNavigate } from 'react-router';
import { mockUsers } from '../../../mock';
import { Post } from '../../../types';
import { fetchPostById } from '../api'; // Import new function

interface UseCommunityEffectsProps {
    state: any;
    setters: any;
    context: {
        posts: Post[];
    };
}

export const useCommunityEffects = ({ state, setters, context }: UseCommunityEffectsProps) => {
    const location = useLocation();
    const navigate = useNavigate();

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
            // Clean up URL immediately
            navigate('/community', { replace: true });

            const user = mockUsers.find(u => u.id === userIdToOpen);
            if (user) {
                setters.setInitialActivityTab(params.get('tab') || undefined);
                setters.setInitialActivitySubTab(params.get('subTab') || undefined);
                setters.setSelectedUser(user);
                setters.setUserActivityModalOpen(true);
            }
        }
    }, [location.search, navigate, setters]);

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
