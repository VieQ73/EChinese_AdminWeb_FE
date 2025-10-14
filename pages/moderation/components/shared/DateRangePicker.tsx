import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

export interface DateRange {
    start: string | null;
    end: string | null;
}

interface DateRangePickerProps {
    dates: DateRange;
    onDatesChange: (dates: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dates, onDatesChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localDates, setLocalDates] = useState<DateRange>(dates);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalDates(dates);
    }, [dates]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleApply = () => {
        onDatesChange(localDates);
        setIsOpen(false);
    };

    const handleClear = () => {
        const clearedDates = { start: null, end: null };
        setLocalDates(clearedDates);
        onDatesChange(clearedDates);
        setIsOpen(false);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const displayValue = dates.start || dates.end 
        ? `${formatDate(dates.start) || '...'} - ${formatDate(dates.end) || '...'}`
        : 'Tất cả các ngày';

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full sm:w-auto p-2.5 border border-gray-300 rounded-lg bg-white text-sm"
            >
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="flex-1 text-left">{displayValue}</span>
                {(dates.start || dates.end) && (
                     <X className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); handleClear(); }}/>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-20 p-4">
                    <p className="text-sm font-medium mb-2">Chọn khoảng ngày</p>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500">Từ ngày</label>
                            <input
                                type="date"
                                value={localDates.start || ''}
                                onChange={e => setLocalDates(prev => ({ ...prev, start: e.target.value || null }))}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Đến ngày</label>
                            <input
                                type="date"
                                value={localDates.end || ''}
                                onChange={e => setLocalDates(prev => ({ ...prev, end: e.target.value || null }))}
                                max={new Date().toISOString().split("T")[0]} // Prevent selecting future dates
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={handleClear} className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-gray-100">Xóa</button>
                        <button onClick={handleApply} className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Áp dụng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
