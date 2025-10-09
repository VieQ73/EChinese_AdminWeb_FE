import { DashboardIcon, SubscriptionIcon, CurrencyDollarIcon, RestoreIcon, UsersIcon, SystemIcon } from '../../constants';

export const MONETIZATION_TABS = [
    { id: 'dashboard', label: 'Tổng quan', icon: DashboardIcon },
    { id: 'subscriptions', label: 'Gói đăng ký', icon: SubscriptionIcon },
    { id: 'payments', label: 'Giao dịch', icon: CurrencyDollarIcon },
    { id: 'refunds', label: 'Hoàn tiền', icon: RestoreIcon },
    { id: 'user-subscriptions', label: 'Gói của người dùng', icon: UsersIcon },
] as const;

export type MonetizationTabId = typeof MONETIZATION_TABS[number]['id'];

// Hằng số cho bộ lọc Giao dịch
export const PAYMENT_STATUSES = {
    all: 'Tất cả trạng thái',
    pending: 'Chờ xử lý',
    successful: 'Thành công',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền',
    manual_confirmed: 'Xác nhận thủ công',
};

export const PAYMENT_METHODS = {
    all: 'Tất cả phương thức',
    'bank_transfer': 'Chuyển khoản',
    'momo': 'MoMo',
    'zalopay': 'ZaloPay',
    'visa/mastercard': 'Visa/Mastercard',
    'vnpay': 'VNPAY',
};

export const PAYMENT_CHANNELS = {
    all: 'Tất cả kênh',
    manual: 'Thủ công',
    auto: 'Tự động',
};