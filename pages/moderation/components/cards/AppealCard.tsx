import React from 'react';
import { Appeal } from '../../../../types';
import StatusBadge from '../ui/StatusBadge';
import { UsersIcon, ClockIcon } from '../../../../constants';

interface AppealCardProps {
    appeal: Appeal & { daysLeft?: number };
    onViewDetails: (appeal: Appeal) => void;
}

// Icon tam giác cảnh báo
const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const AppealCard: React.FC<AppealCardProps> = ({ appeal, onViewDetails }) => {
    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer max-w-sm"
            onClick={() => onViewDetails(appeal)}
        >
            {/* Header với user info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <UsersIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {appeal.user?.name || 'Người dùng ẩn danh'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            ID: {appeal.user_id?.substring(0, 8)}...
                        </p>
                    </div>
                </div>
                <StatusBadge status={appeal.status} />
            </div>

            {/* Nội dung vi phạm */}
            <div className="mb-3">
                <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">{appeal.violation?.target_type}</span>
                            {appeal.violation?.rules && appeal.violation.rules.length > 0 && (
                                <>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {appeal.violation.rules.map(r => r.title).join(', ')}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer với thời gian */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{new Date(appeal.created_at).toLocaleDateString()}</span>
                </div>
                
                {appeal.status === 'pending' && appeal.daysLeft !== undefined && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        appeal.daysLeft <= 1 
                            ? 'bg-red-100 text-red-600' 
                            : appeal.daysLeft <= 3
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-green-100 text-green-600'
                    }`}>
                        <ClockIcon className="w-3 h-3" />
                        <span>{appeal.daysLeft} ngày</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppealCard;