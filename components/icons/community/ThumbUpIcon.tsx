import React from 'react';
import { IconProps } from '../types';

export const ThumbUpIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-1.9 4.5M7 20h2.886a1 1 0 00.951-.69l1.07-3.292a1 1 0 00-.95-1.318H8.514a1 1 0 00-.951 1.318l1.07 3.292A1 1 0 009.886 20H7" />
  </svg>
);
