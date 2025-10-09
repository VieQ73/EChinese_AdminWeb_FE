/**
 * File này chứa các hàm tiện ích dùng chung trong module monetization.
 * 
 * Ví dụ:
 * - formatCurrency(amount, currency)
 * - formatDate(dateString)
 * - calculateRevenue(payments)
 */

/**
 * Định dạng số thành chuỗi tiền tệ VND.
 * @param amount - Số tiền cần định dạng.
 * @returns Chuỗi đã định dạng, ví dụ: "239.000₫".
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Định dạng chuỗi ngày ISO thành ngày giờ địa phương.
 * @param dateString - Chuỗi ngày tháng (ISO format).
 * @returns Chuỗi đã định dạng, ví dụ: "10/06/2025, 18:00:00".
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
};