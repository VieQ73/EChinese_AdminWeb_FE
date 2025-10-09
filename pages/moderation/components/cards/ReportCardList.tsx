import React from 'react';
import { Report } from '../../../../types';
import ReportCard from './ReportCard';

interface ReportCardListProps {
    reports: Report[];
    loading: boolean;
    onViewDetails: (report: Report) => void;
}

const ReportCardList: React.FC<ReportCardListProps> = ({
    reports,
    loading,
    onViewDetails
}) => {
    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy báo cáo nào.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.map(report => (
                <ReportCard
                    key={report.id}
                    report={report}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};

export default ReportCardList;