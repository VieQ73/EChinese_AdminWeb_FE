import { useState, useEffect } from 'react';

/**
 * Hook tính toán số items per page dựa trên responsive grid layout
 * @param targetRowsPerPage - Số hàng mong muốn trên mỗi trang (mặc định 4)
 * @returns số items per page phù hợp với breakpoint hiện tại
 */
export const useDynamicPagination = (targetRowsPerPage: number = 4) => {
    const [itemsPerPage, setItemsPerPage] = useState(12); // Default fallback

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth;
            let columnsPerRow: number;

            // Tính số cột dựa trên Tailwind breakpoints
            if (width < 768) {
                // Mobile: grid-cols-1
                columnsPerRow = 1;
            } else if (width < 1024) {
                // Tablet: grid-cols-2 hoặc grid-cols-3 tùy component
                columnsPerRow = 2;
            } else if (width < 1280) {
                // Desktop: grid-cols-3 hoặc grid-cols-4
                columnsPerRow = 3;
            } else {
                // Large desktop: grid-cols-4 hoặc grid-cols-5
                columnsPerRow = 4;
            }

            // Tính số rows dựa trên số cột
            let targetRows: number;
            if (columnsPerRow <= 2) {
                // Ít cột thì nhiều hàng hơn để hiển thị đủ content
                targetRows = Math.max(4, targetRowsPerPage);
            } else if (columnsPerRow === 3) {
                // 3 cột thì 4 hàng
                targetRows = 4;
            } else {
                // 4+ cột thì 3 hàng để không quá đông
                targetRows = 3;
            }

            return columnsPerRow * targetRows;
        };

        // Tính toán ban đầu
        setItemsPerPage(calculateItemsPerPage());

        // Lắng nghe resize để cập nhật
        const handleResize = () => {
            setItemsPerPage(calculateItemsPerPage());
        };

        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [targetRowsPerPage]);

    return itemsPerPage;
};

/**
 * Hook chuyên biệt cho các loại card khác nhau
 */
export const useCardPagination = (cardType: 'report' | 'violation' | 'appeal' | 'notification' = 'report') => {
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth;
            let columnsPerRow: number;
            let targetRows: number;

            // Tính số cột dựa trên loại card và breakpoint
            if (cardType === 'notification') {
                // Notification cards nhỏ hơn, có thể có nhiều cột hơn
                if (width < 768) columnsPerRow = 1;
                else if (width < 1024) columnsPerRow = 3;
                else if (width < 1280) columnsPerRow = 4;
                else columnsPerRow = 5;
                
                targetRows = columnsPerRow >= 4 ? 3 : 4;
            } else {
                // Report, Violation, Appeal cards - kích thước tiêu chuẩn
                if (width < 768) columnsPerRow = 1;
                else if (width < 1024) columnsPerRow = 2;
                else if (width < 1280) columnsPerRow = 3;
                else columnsPerRow = 4;
                
                targetRows = columnsPerRow >= 3 ? (columnsPerRow === 3 ? 4 : 3) : 4;
            }

            return columnsPerRow * targetRows;
        };

        setItemsPerPage(calculateItemsPerPage());

        const handleResize = () => {
            setItemsPerPage(calculateItemsPerPage());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [cardType]);

    return itemsPerPage;
};