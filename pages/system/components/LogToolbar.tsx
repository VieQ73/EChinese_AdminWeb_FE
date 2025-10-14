// pages/system/components/LogToolbar.tsx
import React from 'react';
import type { User } from '../../../types';
import { Search } from 'lucide-react';
// Import new component
import DateRangePicker from '../../moderation/components/shared/DateRangePicker';

// Add DateRange type
interface DateRange {
    start: string | null;
    end: string | null;
}

interface LogToolbarProps {
    filters: { search: string; adminId: string; actionType: string; };
    onFiltersChange: (filters: { search: string; adminId: string; actionType: string; }) => void;
    dates: DateRange;
    onDatesChange: (dates: DateRange) => void;
    admins: User[];
    actionTypes: string[];
}

const LogToolbar: React.FC<LogToolbarProps> = ({ filters, onFiltersChange, dates, onDatesChange, admins, actionTypes }) => {
    
    const handleFilterChange = (field: keyof typeof filters, value: string) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
                {/* Search input */}
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm theo mô tả, admin, hoặc ID..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg bg-white"
                    />
                </div>
                
                {/* Filter selects */}
                <div className="flex items-center gap-3 flex-wrap">
                     <DateRangePicker dates={dates} onDatesChange={onDatesChange} />
                    <select
                        value={filters.adminId}
                        onChange={(e) => handleFilterChange('adminId', e.target.value)}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả Admin</option>
                        {admins.map(admin => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                    </select>
                    
                    <select
                        value={filters.actionType}
                        onChange={(e) => handleFilterChange('actionType', e.target.value)}
                        className="p-2.5 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="all">Tất cả hành động</option>
                        {actionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default LogToolbar;
