import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button'; // Sử dụng Button component vừa tạo
import { cn } from '../../lib/utils';

/**
 * @fileoverview Pagination component - Thanh phân trang chung
 * @description Component phân trang với các nút điều hướng (đầu, cuối, trước, sau)
 * và hiển thị số trang hiện tại. Hỗ trợ cho các bảng dữ liệu.
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPageButtons = 5; // Số nút trang hiển thị tối đa (ví dụ: 1 2 ... 5 6 7 ... 9 10)

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage === 1) { // Đảm bảo luôn có 1,2,3...
        startPage = 1;
        endPage = Math.min(totalPages, maxPageButtons);
        for (let i = startPage + 1; i <= endPage; i++) {
            pages.push(i);
        }
        if (endPage < totalPages) {
            pages.push('...');
        }
      } else if (currentPage === totalPages) { // Đảm bảo luôn có ...totalPages-2, totalPages-1, totalPages
        startPage = Math.max(1, totalPages - maxPageButtons + 1);
        endPage = totalPages;
        if (startPage > 1) {
            pages.push('...');
        }
        for (let i = startPage; i < endPage; i++) { // Bỏ qua 1 nếu startPage là 1
            if (i !== 1) pages.push(i);
        }
      } else { // Trường hợp chung
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        if (endPage < totalPages -1 ) {
            pages.push('...');
        }
      }
      
      if (!pages.includes(totalPages)) { // Đảm bảo trang cuối luôn hiển thị
        pages.push(totalPages);
      }
    }

    return pages.map((pageNumber, index) =>
      typeof pageNumber === 'number' ? (
        <Button
          key={index}
          variant={pageNumber === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageClick(pageNumber)}
          disabled={pageNumber === currentPage}
          className={cn(pageNumber === currentPage ? 'bg-teal-600 text-white hover:bg-teal-700' : 'text-gray-700 hover:bg-gray-50')}
        >
          {pageNumber}
        </Button>
      ) : (
        <span key={index} className="px-2 text-gray-500">
          {pageNumber}
        </span>
      )
    );
  };

  return (
    <div className={cn('flex items-center justify-end space-x-2 py-4', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageClick(1)}
        disabled={isFirstPage}
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex space-x-1">{renderPageNumbers()}</div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={isLastPage}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageClick(totalPages)}
        disabled={isLastPage}
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { Pagination };