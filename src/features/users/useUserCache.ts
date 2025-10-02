import { useEffect, useState } from 'react';

// Simple module-level cache for users to avoid refetching by id
const _userCache: Map<string, any> = new Map();

export function clearUserCache() { _userCache.clear(); }

export function useUser(userId?: string) {
  const [user, setUser] = useState<any>(() => userId ? _userCache.get(userId) : undefined);
  const [loading, setLoading] = useState<boolean>(!!userId && !_userCache.has(userId));

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setUser(undefined);
      setLoading(false);
      return;
    }
    const cached = _userCache.get(userId);
    if (cached) {
      setUser(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const userApi = await import('../users/userApi');
        const u = await userApi.fetchUserById(userId);
        if (!mounted) return;
        _userCache.set(userId, u);
        setUser(u);
      } catch (e) {
        console.error('useUser failed to load user', e);
        if (mounted) { setUser(undefined); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [userId]);

  return { user, loading } as { user?: any; loading: boolean };
}
