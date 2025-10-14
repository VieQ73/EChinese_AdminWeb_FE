import React from 'react';
import DateRangePicker, { DateRange } from '../shared/DateRangePicker';

interface AppealsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters: { status: string };
    onFilterChange: (filters: { status: string }) => void;
    dates: DateRange;
    onDatesChange: (dates: DateRange) => void;
}

const AppealsToolbar: React.FC<AppealsToolbarProps> = ({ searchTerm, onSearchChange, filters, onFilterChange, dates, onDatesChange }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Tìm theo tên người khiếu nại..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-auto md:flex-1 p-2.5 border border-gray-300 rounded-lg bg-white min-w-[250px]"
                />
                <div className="flex items-center gap-3 flex-wrap">
                    <DateRangePicker dates={dates} onDatesChange={onDatesChange} />
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="accepted">Chấp nhận</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AppealsToolbar;