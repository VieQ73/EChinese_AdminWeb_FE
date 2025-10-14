import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from '../../../../../constants';

interface CollapsibleContainerProps {
    title: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({ title, children, actions, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 rounded-lg bg-white">
            {/* Header */}
            <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center flex-1 min-w-0">
                    <ChevronDownIcon 
                        className={`w-5 h-5 text-slate-500 mr-2 transform transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} 
                    />
                    <div className="font-semibold text-gray-700 truncate">{title}</div>
                </div>
                <div className="flex items-center gap-2 ml-4" onClick={e => e.stopPropagation()}>
                    {actions}
                </div>
            </div>
            {/* Content */}
            {isOpen && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleContainer;