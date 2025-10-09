import React from 'react';
import { IconProps } from '../types';

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 4.293 4.293a1 1 0 010 1.414L13 21m0 0h-2m2 0v-2m0 2l2-2m-2 2v2m0-2h2m-2-2l2-2m-2 2h2m0 0l2-2m-2 2v2m-2-2h2" />
    </svg>
);
