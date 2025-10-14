import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ModerationLog, User } from '../../../../types';
import { mockUsers } from '../../../../mock';
import { useAppData } from '../../../../contexts/appData/context';
import { RestoreIcon, TrashIcon } from '../../../../constants';
import { Loader2 } from 'lucide-react';

interface ModerationLogListProps {
    logs: ModerationLog[];
}

const LOGS_PER_PAGE = 20;

const LogItem: React.FC<{ log: ModerationLog }> = ({ log }) => {
    const { posts, comments } = useAppData();
    const admin = mockUsers.find(u => u.id === log.performed_by);
    
    const actionColor = log.action === 'remove' ? 'text-red-500' : 'text-green-600';
    const ActionIcon = log.action === 'remove' ? TrashIcon : RestoreIcon;

    const isUserAction = log.target_type === 'user';
    const actionText = isUserAction 
        ? (log.action === 'remove' ? 'đã cấm' : 'đã bỏ cấm')
        : (log.action === 'remove' ? 'đã gỡ' : 'đã khôi phục');
    
    const targetTypeText = isUserAction 
        ? 'người dùng' 
        : (log.target_type === 'post' ? 'bài viết' : 'bình luận');

    let targetOwner: User | undefined;
    if (log.target_type === 'post') {
        const post = posts.find(p => p.id === log.target_id);
        if (post) targetOwner = mockUsers.find(u => u.id === post.user_id);
    } else if (log.target_type === 'comment') {
        const comment = comments.find(c => c.id === log.target_id);
        if (comment) targetOwner = mockUsers.find(u => u.id === comment.user_id);
    } else if (log.target_type === 'user') {
        targetOwner = mockUsers.find(u => u.id === log.target_id);
    }

    return (
        <div className="flex items-start space-x-3 py-2 text-sm">
            <div><ActionIcon className={`w-4 h-4 mt-0.5 ${actionColor}`} /></div>
            <div className="flex-1">
                <p className="text-gray-800">
                    <span className="font-semibold">{admin?.name || 'Admin'}</span>
                    <span className={`font-medium ${actionColor}`}> {actionText} </span>
                    <span>{targetTypeText}</span>
                    {targetOwner && <span className="font-semibold text-primary-700"> {targetOwner.name} </span>}
                    (<span className="font-mono text-xs text-gray-600">{log.target_id}</span>)
                </p>
                {log.reason && <p className="text-xs text-gray-500 italic mt-0.5">"{log.reason}"</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString('vi-VN')}</p>
            </div>
        </div>
    );
};


const ModerationLogList: React.FC<ModerationLogListProps> = ({ logs }) => {
    const [page, setPage] = useState(1);
    const [displayedLogs, setDisplayedLogs] = useState<ModerationLog[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const initialLogs = logs.slice(0, LOGS_PER_PAGE);
        setDisplayedLogs(initialLogs);
        setPage(1);
        setHasMore(logs.length > LOGS_PER_PAGE);
    }, [logs]);

    const loadMoreLogs = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        setTimeout(() => { // Giả lập độ trễ mạng
            const nextPage = page + 1;
            const newLogs = logs.slice(0, nextPage * LOGS_PER_PAGE);
            setDisplayedLogs(newLogs);
            setPage(nextPage);
            setHasMore(newLogs.length < logs.length);
            setIsLoading(false);
        }, 300);
    }, [isLoading, hasMore, page, logs]);
    
    const lastLogElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreLogs();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadMoreLogs]);

    return (
        <div className="max-h-60 overflow-y-auto pr-2">
            <div className="divide-y divide-gray-100">
                {displayedLogs.map((log, index) => {
                    if (displayedLogs.length === index + 1) {
                        return <div ref={lastLogElementRef} key={log.id}><LogItem log={log} /></div>;
                    }
                    return <LogItem key={log.id} log={log} />;
                })}
            </div>
            {isLoading && (
                <div className="flex justify-center items-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
            )}
            {!isLoading && displayedLogs.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">Không có hoạt động kiểm duyệt nào.</p>
            )}
            {!isLoading && !hasMore && displayedLogs.length > 0 && (
                 <p className="text-center text-xs text-gray-400 py-2">Đã tải hết log.</p>
            )}
        </div>
    );
};

export default ModerationLogList;