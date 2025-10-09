import React from 'react';
import { IconProps } from '../types';

export const ShieldExclamationIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.944c0 1.064-.124 2.09-.356 3.04z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v4m0 4h.01" />
    </svg>
);
