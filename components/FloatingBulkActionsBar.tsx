import React, { ReactNode } from 'react';
import { XIcon } from '../constants';

interface FloatingBulkActionsBarProps {
    isVisible: boolean;
    selectedCount: number;
    onClearSelection: () => void;
    children: ReactNode;
}

const FloatingBulkActionsBar: React.FC<FloatingBulkActionsBarProps> = ({
    isVisible,
    selectedCount,
    onClearSelection,
    children,
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-4xl z-40">
            <div className="bg-gray-800 text-white rounded-xl shadow-2xl flex items-center gap-4 px-4 py-3 animate-fade-in-up">
                <div className="flex-shrink-0">
                    <button 
                        onClick={onClearSelection} 
                        className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                        aria-label="Bỏ chọn tất cả"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="font-medium text-sm border-r border-gray-600 pr-4">
                    Đã chọn <span className="font-bold">{selectedCount}</span> mục
                </div>
                <div className="flex items-center gap-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FloatingBulkActionsBar;
