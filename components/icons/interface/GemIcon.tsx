import React from 'react';
import { IconProps } from '../types';

// Icon đá quý (subscription/premium)
export const GemIcon: React.FC<IconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 2L2 8l10 14 10-14-10-6zM2 8h20M7 8l5 14 5-14M7 8l5-6 5 6" 
    />
  </svg>
);
