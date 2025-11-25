// React Query-like hooks cho System Admin Logs
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    fetchAdminLogs,
    fetchLogMetadata,
    FetchLogsParams,
    LogsResponse,
    LogMetadata,
    LogFilters,
    DateRange
} from '../api/logs';

// Cache TTL mặc định 30 giây
const DEFAULT_CACHE_TTL = 30000;

// Generic hook với caching
function useCachedQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    cacheTTL: number = DEFAULT_CACHE_TTL
) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        // Kiểm tra cache còn hiệu lực
        if (!forceRefresh && cacheRef.current) {
            const isExpired = Date.now() - cacheRef.current.timestamp > cacheTTL;
            if (!isExpired) {
                setData(cacheRef.current.data);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await queryFn();
            cacheRef.current = { data: result, timestamp: Date.now() };
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [queryFn, cacheTTL]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}

/**
 * Hook lấy admin logs với bộ lọc
 */
export function useAdminLogs(filters: LogFilters, dates: DateRange, page: number = 1, limit: number = 50) {
    const [data, setData] = useState<LogsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchAdminLogs({ filters, dates, page, limit });
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [filters, dates, page, limit]);

    const refetch = useCallback(() => fetchData(), [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}

/**
 * Hook lấy metadata cho bộ lọc
 */
export function useLogMetadata() {
    return useCachedQuery<LogMetadata>(
        fetchLogMetadata,
        'log-metadata',
        60000 // Cache lâu hơn vì metadata ít thay đổi
    );
}

// Export types cho components
export type { LogFilters, DateRange, LogsResponse, LogMetadata };
