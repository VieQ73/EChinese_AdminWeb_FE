import React from 'react';
import { IconProps } from '../types';

// Icon dấu check đôi (đánh dấu đã đọc tất cả)
export const CheckDoubleIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5M12 18.75l6-9"
        />
    </svg>
);
