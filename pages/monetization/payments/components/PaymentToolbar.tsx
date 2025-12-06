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
    autoConfirm?: boolean;
    onAutoConfirmChange?: (enabled: boolean) => void;
    autoConfirmLoading?: boolean;
}

const PaymentToolbar: React.FC<PaymentToolbarProps> = ({ filters, onFilterChange, dates, onDatesChange, onExportCSV, autoConfirm, onAutoConfirmChange, autoConfirmLoading }) => {
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
                {/* Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Auto Confirm Toggle */}
                    {onAutoConfirmChange && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                            <span className="text-sm text-gray-700 whitespace-nowrap">Tự động xác nhận</span>
                            <button
                                onClick={() => onAutoConfirmChange(!autoConfirm)}
                                disabled={autoConfirmLoading}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
                                    autoConfirm ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                                title={autoConfirm ? 'Tắt tự động xác nhận' : 'Bật tự động xác nhận'}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        autoConfirm ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    )}
                    {/* Export Button */}
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