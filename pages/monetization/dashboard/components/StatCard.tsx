import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.FC<{ className?: string }>;
    loading: boolean;
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, loading, description }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {loading ? (
                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    )}
                    {description && !loading && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    )}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
