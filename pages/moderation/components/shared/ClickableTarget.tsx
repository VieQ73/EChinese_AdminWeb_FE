import React from 'react';
import { Report } from '../../../../types';
import TargetContentDisplay from './TargetContentDisplay';

interface ClickableTargetProps {
    targetType: Report['target_type'];
    targetId: string;
    targetContent: Report['targetContent'];
    onNavigateRequest: () => void; 
    reason?: string;
    details?: string;
}

const ClickableTarget: React.FC<ClickableTargetProps> = ({ 
    targetType,
    targetId,
    targetContent,
    onNavigateRequest,
    reason,
    details
}) => {
    const isNavigable = ['user', 'post', 'comment'].includes(targetType);

    const handleClick = () => {
        if (!isNavigable) return;
        onNavigateRequest();
    };

    const wrapperClasses = isNavigable
        ? "cursor-pointer transition-colors hover:bg-gray-100"
        : "";

    return (
        <div onClick={handleClick} className={wrapperClasses}>
            <TargetContentDisplay 
                targetType={targetType} 
                targetContent={targetContent} 
                reason={reason}
                details={details}
            />
        </div>
    );
};

export default ClickableTarget;
