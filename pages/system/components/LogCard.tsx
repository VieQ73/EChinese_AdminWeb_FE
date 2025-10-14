// pages/system/components/LogCard.tsx
import React from 'react';
import type { AdminLog } from '../../../types';
import { getLogActionInfo } from '../utils';

interface LogCardProps {
    log: AdminLog;
}

const LogCard: React.FC<LogCardProps> = ({ log }) => {
    const { icon: Icon, color } = getLogActionInfo(log.action_type);

    return (
        <div className="flex items-start space-x-4 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg">
            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color.replace('text', 'bg')}/10`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <span className="font-semibold text-gray-800">{log.adminName}</span>
                    <span className="text-gray-600"> đã thực hiện hành động </span>
                    <span className={`font-semibold ${color}`}>{log.action_type}</span>
                </p>
                <p className="text-sm text-gray-700 mt-0.5 break-words">
                    {log.description}
                </p>
                {log.target_id && (
                    <p className="text-xs text-gray-500 mt-1">
                        ID Đối tượng: <span className="font-mono bg-gray-100 px-1 rounded">{log.target_id}</span>
                    </p>
                )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-400 text-right flex-shrink-0">
                {new Date(log.created_at).toLocaleString('vi-VN')}
            </div>
        </div>
    );
};

export default LogCard;
