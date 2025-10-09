import { Subscription, UserSubscription, Payment, Refund } from '../types';

// Helper để tạo ngày trong quá khứ
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const mockSubscriptions: Subscription[] = [
    { 
        id: 'sub_free', 
        name: 'Gói Miễn phí', 
        description: { html: '<ul><li>1 bài học AI/ngày</li><li>5 lượt dịch/ngày</li></ul>' }, 
        price: 0, 
        duration_months: null, 
        daily_quota_ai_lesson: 1, 
        daily_quota_translate: 5, 
        is_active: true, 
        created_at: '2023-01-01T00:00:00Z', 
        updated_at: '2023-01-01T00:00:00Z' 
    },
    { 
        id: 'sub_premium', 
        name: 'Premium Tháng', 
        description: { html: '<ul><li>10 bài học AI/ngày</li><li>100 lượt dịch/ngày</li><li>Tất cả sổ tay premium</li></ul>' }, 
        price: 239000, 
        duration_months: 1, 
        daily_quota_ai_lesson: 10, 
        daily_quota_translate: 100, 
        is_active: true, 
        created_at: '2023-01-01T00:00:00Z', 
        updated_at: '2024-02-28T15:00:00Z' 
    },
    { 
        id: 'sub_premium_year', 
        name: 'Premium Năm', 
        description: { html: '<ul><li>15 bài học AI/ngày</li><li>200 lượt dịch/ngày</li><li>Tất cả sổ tay premium</li><li>Tiết kiệm 20%</li></ul>' }, 
        price: 2399000, 
        duration_months: 12, 
        daily_quota_ai_lesson: 15, 
        daily_quota_translate: 200, 
        is_active: true, 
        created_at: '2023-01-01T00:00:00Z', 
        updated_at: '2023-01-01T00:00:00Z' 
    },
    { 
        id: 'sub_lifetime', 
        name: 'Premium Vĩnh viễn', 
        description: { html: '<ul><li>Không giới hạn bài học AI</li><li>Không giới hạn lượt dịch</li><li>Tất cả sổ tay premium</li><li>Thanh toán một lần</li></ul>' }, 
        price: 5999000, 
        duration_months: null, 
        daily_quota_ai_lesson: 999, 
        daily_quota_translate: 9999, 
        is_active: true, 
        created_at: '2024-01-01T00:00:00Z', 
        updated_at: '2024-01-01T00:00:00Z' 
    },
    { 
        id: 'sub_inactive_test', 
        name: 'Gói Test (Không hoạt động)', 
        description: { html: '<p>Gói này dùng để test chức năng.</p>' }, 
        price: 10000, 
        duration_months: 1, 
        daily_quota_ai_lesson: 1, 
        daily_quota_translate: 1, 
        is_active: false, 
        created_at: '2024-03-01T00:00:00Z', 
        updated_at: '2024-03-01T00:00:00Z' 
    }
];

export let mockUserSubscriptions: UserSubscription[] = [
    // u1 (Linh Lê) - Gói tháng cũ -> inactive, giờ là gói năm
    { id: 'us1_old', user_id: 'u1', subscription_id: 'sub_premium', start_date: d(40), expiry_date: d(10), is_active: false, auto_renew: false, last_payment_id: 'pay1', created_at: d(40), updated_at: d(10) },
    { id: 'us1_new', user_id: 'u1', subscription_id: 'sub_premium_year', start_date: d(9), expiry_date: new Date(Date.now() + 356 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, auto_renew: true, last_payment_id: 'pay12', created_at: d(9), updated_at: d(9) },
    // u2 (chen_wei_cool) - User free
    // u3 (Mei Zhang) - User free
    // u4 (Hoàng Văn Việt) - Gói tháng đang hoạt động
    { id: 'us7', user_id: 'u4', subscription_id: 'sub_premium', start_date: d(25), expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, auto_renew: true, last_payment_id: 'pay7', created_at: d(25), updated_at: d(25) },
    // u5 (Nguyễn An Nhiên) - Đang có gói năm
    { id: 'us2', user_id: 'u5', subscription_id: 'sub_premium_year', start_date: d(150), expiry_date: new Date(Date.now() + 215 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, auto_renew: false, last_payment_id: 'pay2', created_at: d(150), updated_at: d(150) },
    // u6 (banned_user_01) - Có gói tháng đã hết hạn
    { id: 'us8', user_id: 'u6', subscription_id: 'sub_premium', start_date: '2024-01-01T12:00:00Z', expiry_date: '2024-02-01T12:00:00Z', is_active: false, auto_renew: false, last_payment_id: null, created_at: '2024-01-01T12:00:00Z', updated_at: '2024-02-01T12:00:00Z'},
    // u7 (Trần Thị Thảo) - Có gói tháng đã hết hạn
    { id: 'us3', user_id: 'u7', subscription_id: 'sub_premium', start_date: '2024-08-20T16:00:00Z', expiry_date: '2024-09-20T16:00:00Z', is_active: false, auto_renew: false, last_payment_id: 'pay3', created_at: '2024-08-20T16:00:00Z', updated_at: '2024-09-20T16:00:00Z' },
    // superadmin - Gói vĩnh viễn
    { id: 'us4', user_id: 'superadmin-user-id', subscription_id: 'sub_lifetime', start_date: '2023-01-01T12:00:00Z', expiry_date: null, is_active: true, auto_renew: false, last_payment_id: 'pay4', created_at: '2023-01-01T12:00:00Z', updated_at: '2023-01-01T12:00:00Z' },
    // admin - Gói năm
    { id: 'us5', user_id: 'admin-user-id', subscription_id: 'sub_premium_year', start_date: '2024-02-10T11:00:00Z', expiry_date: '2025-02-10T11:00:00Z', is_active: true, auto_renew: true, last_payment_id: 'pay5', created_at: '2024-02-10T11:00:00Z', updated_at: '2024-02-10T11:00:00Z' },
    // u8 (Lê Minh Anh) - Gói đã bị refund -> inactive
    { id: 'us6', user_id: 'u8', subscription_id: 'sub_premium', start_date: d(70), expiry_date: d(40), is_active: false, auto_renew: false, last_payment_id: 'pay6', created_at: d(70), updated_at: d(65) },
    // u9 (Hoàn Tiền Nhanh) - Mua gói tháng, sau đó refund toàn phần -> inactive
    { id: 'us9', user_id: 'u9', subscription_id: 'sub_premium', start_date: d(15), expiry_date: d(12), is_active: false, auto_renew: false, last_payment_id: 'pay10', created_at: d(15), updated_at: d(12) },
    // u10 (Văn An) - Mua gói năm, refund một phần -> vẫn active
    { id: 'us10', user_id: 'u10', subscription_id: 'sub_premium_year', start_date: d(20), expiry_date: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, auto_renew: true, last_payment_id: 'pay11', created_at: d(20), updated_at: d(18) },
];

export let mockPayments: Payment[] = [
    // Giao dịch từ tháng trước để có dữ liệu cho biểu đồ
    { id: 'pay_chart1', user_id: 'u7', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'successful', payment_method: 'momo', payment_channel: 'auto', gateway_transaction_id: 'MOMO_CHART1', transaction_date: d(28) },
    { id: 'pay_chart2', user_id: 'u4', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'successful', payment_method: 'visa/mastercard', payment_channel: 'auto', gateway_transaction_id: 'VNPAY_CHART2', transaction_date: d(22) },
    { id: 'pay_chart3', user_id: 'u2', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'successful', payment_method: 'zalopay', payment_channel: 'auto', gateway_transaction_id: 'ZALO_CHART3', transaction_date: d(14) },
    { id: 'pay_chart4', user_id: 'u5', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'manual_confirmed', payment_method: 'bank_transfer', payment_channel: 'manual', gateway_transaction_id: 'BANK_CHART4', transaction_date: d(5), processed_by_admin: 'admin-user-id' },
    { id: 'pay_chart5', user_id: 'u1', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'successful', payment_method: 'momo', payment_channel: 'auto', gateway_transaction_id: 'MOMO_CHART5', transaction_date: d(3) },

    // Giao dịch cho các kịch bản mới
    { id: 'pay10', user_id: 'u9', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'refunded', payment_method: 'momo', payment_channel: 'auto', gateway_transaction_id: 'MOMO_REFUND1', transaction_date: d(15) },
    { id: 'pay11', user_id: 'u10', subscription_id: 'sub_premium_year', amount: 2399000, currency: 'VND', status: 'partially-refunded', payment_method: 'visa/mastercard', payment_channel: 'auto', gateway_transaction_id: 'VNPAY_PARTIAL', transaction_date: d(20) },
    { id: 'pay12', user_id: 'u1', subscription_id: 'sub_premium_year', amount: 2399000, currency: 'VND', status: 'successful', payment_method: 'bank_transfer', payment_channel: 'auto', gateway_transaction_id: 'BANK_UPGRADE', transaction_date: d(9) },
    
    // Giao dịch cũ
    { id: 'pay1', user_id: 'u1', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'successful', payment_method: 'momo', payment_channel: 'auto', gateway_transaction_id: 'MOMO12345', transaction_date: d(40) },
    { id: 'pay2', user_id: 'u5', subscription_id: 'sub_premium_year', amount: 2399000, currency: 'VND', status: 'successful', payment_method: 'visa/mastercard', payment_channel: 'auto', gateway_transaction_id: 'VNPAY67890', transaction_date: d(150) },
    { id: 'pay3', user_id: 'u7', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'successful', payment_method: 'zalopay', payment_channel: 'auto', gateway_transaction_id: 'ZALO001122', transaction_date: '2024-08-20T15:55:00Z' },
    { id: 'pay4', user_id: 'superadmin-user-id', subscription_id: 'sub_lifetime', amount: 5999000, currency: 'VND', status: 'manual_confirmed', payment_method: 'bank_transfer', payment_channel: 'manual', manual_proof_url: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a', gateway_transaction_id: 'BANK445566', transaction_date: '2023-01-01T11:50:00Z', processed_by_admin: 'admin-user-id', notes: 'Xác nhận thanh toán cho Sếp.' },
    { id: 'pay5', user_id: 'admin-user-id', subscription_id: 'sub_premium_year', amount: 2399000, currency: 'VND', status: 'successful', payment_method: 'momo', payment_channel: 'auto', gateway_transaction_id: 'MOMO778899', transaction_date: '2024-02-10T10:58:00Z' },
    { id: 'pay6', user_id: 'u8', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'refunded', payment_method: 'visa/mastercard', payment_channel: 'auto', gateway_transaction_id: 'VNPAY334455', transaction_date: d(70) },
    { id: 'pay7', user_id: 'u4', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'pending', payment_method: 'bank_transfer', payment_channel: 'manual', manual_proof_url: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a', gateway_transaction_id: 'BANKPENDING1', transaction_date: d(1) },
    { id: 'pay8', user_id: 'u2', subscription_id: 'sub_premium', amount: 239000, currency: 'VND', status: 'failed', payment_method: 'momo', payment_channel: 'auto', gateway_transaction_id: 'MOMOFAILED1', transaction_date: d(0) },
];

export let mockRefunds: Refund[] = [
    { 
        id: 'ref1', 
        payment_id: 'pay6', 
        user_id: 'u8', 
        processed_by_admin: 'admin-user-id', 
        refund_amount: 239000, 
        refund_method: 'gateway', 
        reason: 'Người dùng yêu cầu hoàn tiền trong 7 ngày.', 
        status: 'completed', 
        created_at: d(65), 
        processed_at: d(65),
        notes: "Đã hoàn tiền thành công qua cổng VNPAY.",
        gateway_response: { success: true, refund_id: "VNPAY_REF_123" }
    },
    { 
        id: 'ref2', 
        payment_id: 'pay1', 
        user_id: 'u1', 
        processed_by_admin: null, 
        refund_amount: 239000, 
        refund_method: 'manual_transfer', 
        reason: 'Hệ thống gia hạn tự động bị lỗi.', 
        status: 'pending', 
        created_at: d(1), 
        processed_at: null 
    },
     { 
        id: 'ref3', 
        payment_id: 'pay9', 
        user_id: 'u1', 
        processed_by_admin: 'superadmin-user-id',
        refund_amount: 2399000, 
        refund_method: 'gateway', 
        reason: 'Khách hàng không hài lòng.', 
        status: 'rejected', 
        created_at: d(2), 
        processed_at: d(1),
        notes: "Yêu cầu hoàn tiền đã quá 7 ngày theo chính sách.",
    },
    // Thêm refund cho kịch bản mới
    { 
        id: 'ref4', 
        payment_id: 'pay10', 
        user_id: 'u9', 
        processed_by_admin: 'admin-user-id', 
        refund_amount: 239000, // Hoàn toàn phần
        refund_method: 'gateway', 
        reason: 'Người dùng yêu cầu hoàn tiền trong 7 ngày.', 
        status: 'completed', 
        created_at: d(13), 
        processed_at: d(12),
        notes: "Hoàn tiền tự động qua cổng Momo.",
        gateway_response: { success: true, refund_id: "MOMO_REF_456" }
    },
    { 
        id: 'ref5', 
        payment_id: 'pay11', 
        user_id: 'u10', 
        processed_by_admin: 'superadmin-user-id',
        refund_amount: 500000, // Hoàn một phần
        refund_method: 'manual_transfer', 
        reason: 'Đền bù do sự cố kỹ thuật.', 
        status: 'completed', 
        created_at: d(19), 
        processed_at: d(18),
        notes: "Đã chuyển khoản 500k cho khách hàng.",
    },
];