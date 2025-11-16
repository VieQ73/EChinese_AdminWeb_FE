import React from 'react';
import { PAYMENT_STATUSES, PAYMENT_METHODS, PAYMENT_CHANNELS } from '../../constants';
import { DownloadIcon } from '../../../../constants';
import DateRangePicker, { DateRange } from '../../../moderation/components/shared/DateRangePicker';

interface PaymentToolbarProps {
    filters: {
        search: string;
        status: string;
        method: string;
        channel: string;
    };
    onFilterChange: (name: keyof PaymentToolbarProps['filters'], value: string) => void;
    dates: DateRange;
    onDatesChange: (dates: DateRange) => void;
    onExportCSV: () => void;
}

const PaymentToolbar: React.FC<PaymentToolbarProps> = ({ filters, onFilterChange, dates, onDatesChange, onExportCSV }) => {
    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Tìm theo mã giao dịch, email..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full sm:w-auto md:w-64 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
                    />
                    <DateRangePicker dates={dates} onDatesChange={onDatesChange} />
                    <select value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full sm:w-auto p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500">
                        {Object.entries(PAYMENT_STATUSES).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                    <select value={filters.method} onChange={(e) => onFilterChange('method', e.target.value)} className="w-full sm:w-auto p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500">
                        {Object.entries(PAYMENT_METHODS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                    <select value={filters.channel} onChange={(e) => onFilterChange('channel', e.target.value)} className="w-full sm:w-auto p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500">
                        {Object.entries(PAYMENT_CHANNELS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                </div>
                {/* Export Button */}
                <div className="flex-shrink-0">
                    <button 
                        onClick={onExportCSV}
                        className="flex items-center w-full sm:w-auto justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Xuất CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentToolbar;