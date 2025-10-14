import { Payment, Report, Violation, User } from '../../types';

interface ChartDataPoint {
    date: string;
    value: number;
}

/**
 * Hàm chung để tạo dữ liệu hàng ngày cho biểu đồ từ một mảng dữ liệu.
 * @param items - Mảng dữ liệu (Payments, Reports, etc.).
 * @param days - Số ngày gần nhất để lấy dữ liệu.
 * @param dateField - Tên trường chứa ngày tháng trong mỗi item.
 * @param valueFn - Hàm để trích xuất giá trị số từ mỗi item (ví dụ: cộng dồn số tiền hoặc đếm 1).
 * @param filterFn - Hàm tùy chọn để lọc các item trước khi xử lý.
 * @returns - Một mảng các đối tượng ChartDataPoint.
 */
const generateDailyData = <T extends { [key: string]: any }>(
    items: T[],
    days: number,
    dateField: keyof T,
    valueFn: (item: T) => number,
    filterFn?: (item: T) => boolean
): ChartDataPoint[] => {
    const dailyCounts: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = `${date.getDate()}/${date.getMonth() + 1}`;
        dailyCounts[dateString] = 0;
    }

    const startDate = new Date();
    startDate.setDate(today.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const relevantItems = items.filter(item => {
        const itemDate = new Date(item[dateField] as string);
        const passesDateFilter = itemDate >= startDate;
        const passesCustomFilter = filterFn ? filterFn(item) : true;
        return passesDateFilter && passesCustomFilter;
    });

    for (const item of relevantItems) {
        const date = new Date(item[dateField] as string);
        const dateString = `${date.getDate()}/${date.getMonth() + 1}`;
        if (dailyCounts[dateString] !== undefined) {
            dailyCounts[dateString] += valueFn(item);
        }
    }

    return Object.entries(dailyCounts)
        .map(([date, value]) => ({ date, value }))
        .reverse();
};

export const generateDailyRevenue = (payments: Payment[], days: number): ChartDataPoint[] => {
    return generateDailyData(payments, days, 'transaction_date', p => p.amount, p => p.status === 'successful');
};

export const generateDailyReports = (reports: Report[], days: number): ChartDataPoint[] => {
    return generateDailyData(reports, days, 'created_at', () => 1);
};

export const generateDailyViolations = (violations: Violation[], days: number): ChartDataPoint[] => {
    return generateDailyData(violations, days, 'created_at', () => 1);
};

export const generateDailyNewUsers = (users: User[], days: number): ChartDataPoint[] => {
    return generateDailyData(users, days, 'created_at', () => 1);
};
