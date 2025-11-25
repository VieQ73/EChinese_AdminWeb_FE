/**
 * React Query-like hooks cho User Activity
 * Lightweight implementation - có thể thay bằng @tanstack/react-query sau này
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, CommentWithUser } from '../../../types';
import * as api from '../api/userActivity';

// Cache đơn giản
const cache = new Map<string, { data: unknown; time: number }>();
const CACHE_TTL = 30000; // 30s

// Generic hook factory
function useQuery<T>(key: string, fetcher: () => Promise<T>, enabled = true) {
    const [data, setData] = useState<T | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const mounted = useRef(true);

    const fetchData = useCallback(async (force = false) => {
        // Check cache
        const cached = cache.get(key);
        if (!force && cached && Date.now() - cached.time < CACHE_TTL) {
            setData(cached.data as T);
            return;
        }

        setIsLoading(true);
        try {
            const result = await fetcher();
            if (mounted.current) {
                setData(result);
                cache.set(key, { data: result, time: Date.now() });
            }
        } catch (err) {
            if (mounted.current) setError(err as Error);
        } finally {
            if (mounted.current) setIsLoading(false);
        }
    }, [key, fetcher]);

    useEffect(() => {
        mounted.current = true;
        if (enabled) fetchData();
        return () => { mounted.current = false; };
    }, [enabled, fetchData]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return { data, isLoading, error, refetch };
}

// Invalidate cache theo userId
export const invalidateUserCache = (userId: string) => {
    for (const key of cache.keys()) {
        if (key.includes(userId)) cache.delete(key);
    }
};

// Hooks cho từng loại data
export const useUserPosts = (userId: string, enabled = true) =>
    useQuery(`posts-${userId}`, () => api.fetchUserPosts(userId), enabled && !!userId);

// Hook lấy tất cả counts cho tabs (luôn fetch khi modal mở)
export const useActivityCounts = (userId: string, enabled = true) => {
    const posts = useQuery(`posts-${userId}`, () => api.fetchUserPosts(userId), enabled && !!userId);
    const liked = useQuery(`liked-${userId}`, () => api.fetchUserLikedPosts(userId), enabled && !!userId);
    const commented = useQuery(`commented-${userId}`, () => api.fetchUserCommentedPosts(userId), enabled && !!userId);
    const viewed = useQuery(`viewed-${userId}`, () => api.fetchUserViewedPosts(userId), enabled && !!userId);
    const removedPosts = useQuery(`removed-posts-${userId}`, () => api.fetchUserRemovedPosts(userId), enabled && !!userId);
    const removedComments = useQuery(`removed-comments-${userId}`, () => api.fetchUserRemovedComments(userId), enabled && !!userId);

    return {
        posts: posts.data?.length ?? 0,
        likes: liked.data?.length ?? 0,
        comments: commented.data?.length ?? 0,
        views: viewed.data?.length ?? 0,
        removed: (removedPosts.data?.length ?? 0) + (removedComments.data?.length ?? 0),
        isLoading: posts.isLoading || liked.isLoading || commented.isLoading || viewed.isLoading,
    };
};

export const useUserLikedPosts = (userId: string, enabled = true) =>
    useQuery(`liked-${userId}`, () => api.fetchUserLikedPosts(userId), enabled && !!userId);

export const useUserCommentedPosts = (userId: string, enabled = true) =>
    useQuery(`commented-${userId}`, () => api.fetchUserCommentedPosts(userId), enabled && !!userId);

export const useUserViewedPosts = (userId: string, enabled = true) =>
    useQuery(`viewed-${userId}`, () => api.fetchUserViewedPosts(userId), enabled && !!userId);

export const useUserRemovedPosts = (userId: string, enabled = true) =>
    useQuery(`removed-posts-${userId}`, () => api.fetchUserRemovedPosts(userId), enabled && !!userId);

export const useUserRemovedComments = (userId: string, enabled = true) =>
    useQuery(`removed-comments-${userId}`, () => api.fetchUserRemovedComments(userId), enabled && !!userId);
