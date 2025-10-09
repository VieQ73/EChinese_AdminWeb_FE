import type { SVGProps } from 'react';

// FIX: Extend SVGProps to allow any valid SVG attribute (like title, onClick, etc.)
// to be passed to the icon components. This is a more robust and type-safe approach.
export interface IconProps extends SVGProps<SVGSVGElement> {}