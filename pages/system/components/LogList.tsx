// pages/system/components/LogList.tsx
import React from 'react';
import type { AdminLog } from '../../../types';
import LogCard from './LogCard';

interface LogListProps {
    logs: AdminLog[];
}

const LogList: React.FC<LogListProps> = ({ logs }) => {
    if (logs.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500">
                <p>Không tìm thấy nhật ký nào phù hợp.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map(log => (
                <LogCard key={log.id} log={log} />
            ))}
        </div>
    );
};

export default LogList;
