import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils'; 

/**
 * @fileoverview Button component - Nút bấm chung với các biến thể
 * @description Component nút bấm dùng chung, hỗ trợ các biến thể (variants) về màu sắc, kích thước, và trạng thái.
 * Sử dụng `class-variance-authority` để quản lý các lớp CSS một cách linh hoạt.
 */

// Định nghĩa các biến thể cho button
const buttonVariants = cva(
  // Thêm shadow mặc định cho hiệu ứng 3D nhẹ
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ' +
  'ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg active:shadow-sm',
  {
    variants: {
      variant: {
        // Màu chính: Xanh Dương
        default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800', 
        // Màu tiêu cực: Đỏ
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        // Viền: Gọn gàng hơn
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
        // Phụ: Nền xám nhạt
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
        // Trong suốt
        ghost: 'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 shadow-none',
        // Liên kết: Xanh Dương
        link: 'text-blue-600 underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-xl px-8', // Lớn hơn và bo góc nhiều hơn
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Định nghĩa props cho Button component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // Nếu là true, render asChild (Radix UI)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'; // Chọn component để render
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))} // Gộp các lớp CSS
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
