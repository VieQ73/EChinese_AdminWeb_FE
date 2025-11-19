DANH SÁCH ĐẦY ĐỦ CÁC LOẠI THÔNG BÁO
Tổng quan: 19 loại thông báo - 100% có Push Notification
1️⃣ TƯƠNG TÁC CỘNG ĐỒNG (3 loại)
1. ❤️ Like bài viết
Tác dụng: Thông báo khi có người like bài viết của bạn

Khi nào: Người khác (không phải bản thân) like bài viết

File: controllers/postController.js

Ví dụ:

{
  type: "community",
  title: "❤️ Có người thích bài viết của bạn",
  content: {
    message: "Nguyễn Văn A đã thích bài viết 'Học tiếng Trung cơ bản' của bạn.",
    action: "post_liked",
    liker_name: "Nguyễn Văn A"
  },
  redirect_type: "post",
  data: {
    post_id: "abc-123",
    post_title: "Học tiếng Trung cơ bản",
    post_preview: "Hôm nay mình chia sẻ kinh nghiệm học tiếng Trung...",
    liker_id: "user-456",
    liker_name: "Nguyễn Văn A",
    liker_avatar: "https://example.com/avatar.jpg",
    total_likes: 15,
    liked_at: "2025-11-19T10:30:00.000Z"
  }
}
2. 💬 Comment bài viết
Tác dụng: Thông báo khi có người comment vào bài viết của bạn

Khi nào: Người khác (không phải bản thân) comment vào bài viết

File: controllers/commentController.js

Ví dụ:

{
  type: "community",
  title: "💬 Có người bình luận bài viết của bạn",
  content: {
    message: "Trần Thị B đã bình luận vào bài viết 'Học tiếng Trung cơ bản' của bạn.",
    action: "post_commented",
    commenter_name: "Trần Thị B"
  },
  redirect_type: "post_comment",
  data: {
    post_id: "abc-123",
    post_title: "Học tiếng Trung cơ bản",
    comment_id: "comment-789",
    comment_preview: "Bài viết rất hay, cảm ơn bạn đã chia sẻ!",
    commenter_id: "user-789",
    commenter_name: "Trần Thị B",
    commenter_avatar: "https://example.com/avatar2.jpg",
    commented_at: "2025-11-19T11:00:00.000Z",
    is_reply: false
  }
}
3. ↩️ Reply comment
Tác dụng: Thông báo khi có người trả lời bình luận của bạn

Khi nào: Người khác (không phải bản thân) reply comment của bạn

File: controllers/commentController.js

Ví dụ:

{
  type: "community",
  title: "↩️ Có người trả lời bình luận của bạn",
  content: {
    message: "Lê Văn C đã trả lời bình luận của bạn.",
    action: "comment_replied",
    commenter_name: "Lê Văn C"
  },
  redirect_type: "post_comment",
  data: {
    post_id: "abc-123",
    comment_id: "comment-999",
    parent_comment_id: "comment-789",
    comment_preview: "Mình cũng nghĩ vậy, rất đồng ý với bạn!",
    commenter_id: "user-999",
    commenter_name: "Lê Văn C",
    commenter_avatar: "https://example.com/avatar3.jpg",
    replied_at: "2025-11-19T11:30:00.000Z"
  }
}
2️⃣ VI PHẠM & KIỂM DUYỆT (4 loại)
4. 🤖 AI gỡ bài viết
Tác dụng: Thông báo khi AI tự động phát hiện và gỡ bài viết vi phạm

Khi nào: AI phát hiện nội dung vi phạm (hate speech, violence, NSFW...)

File: services/autoModerationService.js

Ví dụ:

{
  type: "violation",
  title: "🤖 Bài viết của bạn đã bị gỡ tự động",
  content: {
    message: "Bài viết của bạn vi phạm quy tắc cộng đồng: Vi phạm tiêu đề: Hate Speech và nội dung: Violence. Nội dung đã được hệ thống AI tự động phát hiện và gỡ bỏ.",
    violation_severity: "high",
    violation_type: "post",
    detected_by: "AI",
    violations_detail: [
      { type: "title", label: "Hate Speech", confidence: 0.95 },
      { type: "content", label: "Violence", confidence: 0.87 }
    ]
  },
  redirect_type: "post",
  data: {
    post_id: "abc-123",
    post_title: "Tiêu đề bài viết",
    post_preview: "Nội dung bài viết...",
    violation_reason: "Vi phạm tiêu đề: Hate Speech và nội dung: Violence",
    severity: "high",
    violated_rules: [
      {
        id: "rule-001",
        title: "Hate Speech",
        description: "Nội dung vi phạm được phát hiện tự động bởi AI",
        severity: "high"
      }
    ],
    violations: [
      { type: "title", label: "Hate Speech", confidence: 0.95, ruleId: "rule-001" }
    ],
    auto_detected: true,
    removed_at: "2025-11-19T12:00:00.000Z"
  }
}
5. 🤖 AI gỡ comment
Tác dụng: Thông báo khi AI tự động phát hiện và gỡ comment vi phạm

Khi nào: AI phát hiện comment có nội dung vi phạm

File: services/autoModerationService.js

Ví dụ:

{
  type: "violation",
  title: "🤖 Bình luận của bạn đã bị gỡ tự động",
  content: {
    message: "Bình luận của bạn vi phạm quy tắc cộng đồng: Vi phạm nội dung: Spam. Nội dung đã được hệ thống AI tự động phát hiện và gỡ bỏ.",
    violation_severity: "medium",
    violation_type: "comment",
    detected_by: "AI",
    violations_detail: [
      { type: "text", label: "Spam", confidence: 0.82 }
    ]
  },
  redirect_type: "post_comment",
  data: {
    post_id: "abc-123",
    comment_id: "comment-789",
    comment_preview: "Nội dung comment...",
    violation_reason: "Vi phạm nội dung: Spam",
    severity: "medium",
    violated_rules: [
      {
        id: "rule-002",
        title: "Spam",
        description: "Nội dung spam được phát hiện tự động",
        severity: "medium"
      }
    ],
    auto_detected: true,
    removed_at: "2025-11-19T12:15:00.000Z"
  }
}
6. ⚠️ Admin gỡ bài viết
Tác dụng: Thông báo khi admin gỡ bài viết do vi phạm

Khi nào: Admin xác nhận vi phạm và gỡ bài (không phải tự gỡ)

File: controllers/postController.js

Ví dụ:

{
  type: "violation",
  title: "⚠️ Bài viết của bạn đã bị gỡ do vi phạm",
  content: {
    message: "Nội dung không phù hợp với cộng đồng",
    violation_severity: "high",
    violation_type: "post",
    detected_by: "admin",
    violated_rules_count: 2
  },
  redirect_type: "post",
  data: {
    post_id: "abc-123",
    post_title: "Tiêu đề bài viết",
    post_preview: "Nội dung bài viết...",
    violation_reason: "Nội dung không phù hợp với cộng đồng",
    severity: "high",
    violated_rules: [
      {
        id: "rule-003",
        title: "Nội dung không phù hợp",
        description: "Bài viết chứa nội dung không phù hợp với quy định cộng đồng",
        severity: "high"
      },
      {
        id: "rule-004",
        title: "Spam quảng cáo",
        description: "Bài viết có mục đích quảng cáo thương mại",
        severity: "medium"
      }
    ],
    removed_by: "admin-001",
    removed_at: "2025-11-19T13:00:00.000Z",
    resolution: "Gỡ bài và cảnh cáo"
  }
}
7. ⚠️ Admin gỡ comment
Tác dụng: Thông báo khi admin gỡ comment do vi phạm

Khi nào: Admin xác nhận comment vi phạm và gỡ

File: controllers/commentController.js

Ví dụ:

{
  type: "violation",
  title: "⚠️ Bình luận của bạn đã bị gỡ do vi phạm",
  content: {
    message: "Ngôn từ không phù hợp",
    violation_severity: "medium",
    violation_type: "comment",
    detected_by: "admin",
    violated_rules_count: 1
  },
  redirect_type: "post_comment",
  data: {
    post_id: "abc-123",
    comment_id: "comment-789",
    comment_preview: "Nội dung comment...",
    violation_reason: "Ngôn từ không phù hợp",
    severity: "medium",
    violated_rules: [
      {
        id: "rule-005",
        title: "Ngôn từ thô tục",
        description: "Comment chứa ngôn từ không phù hợp",
        severity: "medium"
      }
    ],
    removed_by: "admin-001",
    removed_at: "2025-11-19T13:30:00.000Z",
    resolution: "Gỡ comment và cảnh cáo"
  }
}
3️⃣ KHÔI PHỤC (2 loại)
8. ✅ Khôi phục bài viết
Tác dụng: Thông báo khi admin khôi phục bài viết đã bị gỡ

Khi nào: Admin xem xét lại và khôi phục bài viết (không phải tự khôi phục)

File: controllers/postController.js

Ví dụ:

{
  type: "community",
  title: "✅ Bài viết của bạn đã được khôi phục",
  content: {
    message: "Sau khi xem xét lại, nội dung không vi phạm quy định cộng đồng",
    action: "post_restored",
    violations_removed: 2,
    restore_reason: "Sau khi xem xét lại, nội dung không vi phạm quy định cộng đồng"
  },
  redirect_type: "post",
  data: {
    post_id: "abc-123",
    post_title: "Tiêu đề bài viết",
    post_preview: "Nội dung bài viết...",
    restored_by: "admin-002",
    restored_at: "2025-11-19T14:00:00.000Z",
    violations_cleared: 2,
    restore_reason: "Sau khi xem xét lại, nội dung không vi phạm quy định cộng đồng"
  }
}
9. ✅ Khôi phục comment
Tác dụng: Thông báo khi admin khôi phục comment đã bị gỡ

Khi nào: Admin xem xét lại và khôi phục comment

File: controllers/commentController.js

Ví dụ:

{
  type: "community",
  title: "✅ Bình luận của bạn đã được khôi phục",
  content: {
    message: "Bình luận đã được xem xét lại và không vi phạm",
    action: "comment_restored",
    violations_removed: 1,
    restore_reason: "Bình luận đã được xem xét lại và không vi phạm"
  },
  redirect_type: "post_comment",
  data: {
    post_id: "abc-123",
    comment_id: "comment-789",
    comment_preview: "Nội dung comment...",
    restored_at: "2025-11-19T14:30:00.000Z",
    violations_cleared: 1,
    restore_reason: "Bình luận đã được xem xét lại và không vi phạm"
  }
}
4️⃣ THANH TOÁN (3 loại)
10. 💳 Hướng dẫn thanh toán
Tác dụng: Hướng dẫn người dùng cách thanh toán sau khi tạo yêu cầu

Khi nào: User tạo yêu cầu thanh toán cho gói đăng ký

File: services/paymentService.js

Ví dụ:

{
  type: "system",
  title: "💳 Hướng dẫn thanh toán",
  content: {
    message: "Vui lòng chuyển khoản 299,000đ để kích hoạt gói 'Premium'. Sau khi chuyển khoản, vui lòng chờ xác nhận từ hệ thống.",
    action: "payment_instruction",
    subscription_name: "Premium",
    amount: "299000"
  },
  redirect_type: "subscription",
  data: {
    subscription_id: "sub-123",
    subscription_name: "Premium",
    amount: "299000",
    payment_method: "bank_transfer",
    bank_info: {
      bankName: "Vietcombank",
      accountNumber: "0123456789",
      accountName: "NGUYEN VAN A",
      branch: "Chi nhánh Hà Nội"
    },
    created_at: "2025-11-19T15:00:00.000Z"
  }
}
11. ✅ Thanh toán xác nhận
Tác dụng: Thông báo khi admin xác nhận thanh toán thành công

Khi nào: Admin xác nhận đã nhận được tiền, gói được kích hoạt

File: services/paymentService.js

Ví dụ:

{
  type: "system",
  title: "✅ Thanh toán đã được xác nhận",
  content: {
    message: "Thanh toán của bạn đã được xác nhận thành công. Gói 'Premium' đã được kích hoạt.",
    action: "payment_confirmed",
    payment_amount: "299000",
    subscription_name: "Premium"
  },
  redirect_type: "subscription",
  data: {
    payment_id: "pay-456",
    subscription_id: "sub-123",
    subscription_name: "Premium",
    amount: "299000",
    payment_method: "bank_transfer",
    confirmed_at: "2025-11-19T16:00:00.000Z",
    confirmed_by: "admin-001"
  }
}
12. ❌ Thanh toán từ chối
Tác dụng: Thông báo khi admin từ chối thanh toán

Khi nào: Admin kiểm tra và không thấy giao dịch hoặc thông tin không khớp

File: services/paymentService.js

Ví dụ:

{
  type: "system",
  title: "❌ Thanh toán bị từ chối",
  content: {
    message: "Thanh toán của bạn cho gói 'Premium' đã bị từ chối. Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ hỗ trợ.",
    action: "payment_failed",
    payment_amount: "299000",
    subscription_name: "Premium"
  },
  redirect_type: "subscription",
  data: {
    payment_id: "pay-456",
    subscription_id: "sub-123",
    subscription_name: "Premium",
    amount: "299000",
    payment_method: "bank_transfer",
    failed_at: "2025-11-19T16:30:00.000Z",
    rejected_by: "admin-001"
  }
}
5️⃣ HOÀN TIỀN (3 loại)
13. 📝 Yêu cầu hoàn tiền
Tác dụng: Xác nhận đã nhận yêu cầu hoàn tiền

Khi nào: User tạo yêu cầu hoàn tiền

File: services/refundService.js

Ví dụ:

{
  type: "system",
  title: "📝 Yêu cầu hoàn tiền đã được gửi",
  content: {
    message: "Yêu cầu hoàn tiền cho gói 'Premium' đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.",
    action: "refund_requested",
    subscription_name: "Premium",
    amount: "299000"
  },
  redirect_type: "refund",
  data: {
    refund_id: "refund-789",
    payment_id: "pay-456",
    subscription_id: "sub-123",
    subscription_name: "Premium",
    amount: "299000",
    currency: "VND",
    reason: "Không sử dụng được tính năng",
    requested_at: "2025-11-19T17:00:00.000Z",
    estimated_response_time: "24-48 giờ"
  }
}
14. ✅ Hoàn tiền chấp nhận
Tác dụng: Thông báo khi admin chấp nhận hoàn tiền

Khi nào: Admin xem xét và chấp nhận yêu cầu hoàn tiền

File: services/refundService.js

Ví dụ:

{
  type: "system",
  title: "✅ Yêu cầu hoàn tiền đã được chấp nhận",
  content: {
    message: "Yêu cầu hoàn tiền cho gói 'Premium' đã được chấp nhận. Số tiền 299,000đ sẽ được hoàn về trong 3-5 ngày làm việc.",
    action: "refund_approved",
    refund_amount: 299000,
    subscription_name: "Premium",
    refund_method: "bank_transfer"
  },
  redirect_type: "refund",
  data: {
    refund_id: "refund-789",
    payment_id: "pay-456",
    subscription_id: "sub-123",
    subscription_name: "Premium",
    refund_amount: 299000,
    original_amount: 299000,
    currency: "VND",
    refund_method: "bank_transfer",
    approved_by: "admin-002",
    approved_at: "2025-11-19T18:00:00.000Z",
    estimated_refund_date: "2025-11-24T18:00:00.000Z",
    admin_notes: "Yêu cầu hợp lệ"
  }
}
15. ❌ Hoàn tiền từ chối
Tác dụng: Thông báo khi admin từ chối hoàn tiền

Khi nào: Admin xem xét và không chấp nhận yêu cầu hoàn tiền

File: services/refundService.js

Ví dụ:

{
  type: "system",
  title: "❌ Yêu cầu hoàn tiền đã bị từ chối",
  content: {
    message: "Yêu cầu hoàn tiền cho gói 'Premium' không được chấp nhận. Lý do: Đã sử dụng quá 50% thời gian gói",
    action: "refund_rejected",
    subscription_name: "Premium",
    rejection_reason: "Đã sử dụng quá 50% thời gian gói"
  },
  redirect_type: "refund",
  data: {
    refund_id: "refund-789",
    payment_id: "pay-456",
    subscription_id: "sub-123",
    subscription_name: "Premium",
    requested_amount: 299000,
    currency: "VND",
    rejection_reason: "Đã sử dụng quá 50% thời gian gói",
    rejected_by: "admin-002",
    rejected_at: "2025-11-19T18:30:00.000Z",
    user_reason: "Không sử dụng được tính năng"
  }
}
6️⃣ GÓI ĐĂNG KÝ (2 loại)
16. ⏰ Gói sắp hết hạn
Tác dụng: Nhắc nhở người dùng gia hạn gói trước khi hết hạn

Khi nào: Cron job chạy hàng ngày, gói còn 1-3 ngày

File: services/userSubscriptionService.js

Ví dụ:

{
  type: "system",
  title: "⏰ Gói đăng ký sắp hết hạn trong 2 ngày",
  content: {
    message: "Gói 'Premium' của bạn sẽ hết hạn vào 21/11/2025. Gia hạn ngay để không bị gián đoạn dịch vụ.",
    action: "subscription_expiring_soon",
    subscription_name: "Premium",
    days_remaining: 2,
    expiry_date: "2025-11-21T00:00:00.000Z"
  },
  redirect_type: "subscription",
  data: {
    subscription_id: "sub-123",
    subscription_name: "Premium",
    expiry_date: "2025-11-21T00:00:00.000Z",
    days_remaining: 2,
    auto_renew: false,
    price: "299000",
    duration_months: 1
  }
}
17. ⏰ Gói đã hết hạn
Tác dụng: Thông báo gói đã hết hạn và chuyển về Free

Khi nào: Cron job chạy hàng ngày, gói đã hết hạn

File: services/userSubscriptionService.js

Ví dụ:

{
  type: "system",
  title: "⏰ Gói đăng ký của bạn đã hết hạn",
  content: {
    message: "Gói 'Premium' của bạn đã hết hạn. Bạn đã được chuyển về gói Miễn phí. Gia hạn ngay để tiếp tục sử dụng các tính năng cao cấp.",
    action: "subscription_expired",
    subscription_name: "Premium",
    expired_date: "2025-11-19T00:00:00.000Z"
  },
  redirect_type: "subscription",
  data: {
    subscription_id: "sub-123",
    subscription_name: "Premium",
    expired_date: "2025-11-19T00:00:00.000Z",
    was_auto_renew: false,
    price: "299000",
    duration_months: 1
  }
}
7️⃣ THÀNH TÍCH & HUY HIỆU (2 loại)
18. 🏆 Đạt thành tích mới
Tác dụng: Chúc mừng người dùng đạt thành tích

Khi nào: Khi gán achievement cho user (admin hoặc tự động)

File: models/userModel.js

Ví dụ:

{
  type: "system",
  title: "🏆 Bạn đã đạt thành tích mới!",
  content: {
    message: "Chúc mừng! Bạn đã đạt thành tích 'Người mới'. Hoàn thành đăng ký tài khoản thành công",
    action: "achievement_unlocked",
    achievement_name: "Người mới",
    points_earned: 10
  },
  redirect_type: "achievement",
  data: {
    achievement_id: "ach-001",
    achievement_name: "Người mới",
    achievement_description: "Hoàn thành đăng ký tài khoản thành công",
    achievement_icon: "🎉",
    points_earned: 10,
    progress: 100,
    unlocked_at: "2025-11-19T19:00:00.000Z"
  }
}
19. 🎖️ Nhận huy hiệu mới
Tác dụng: Chúc mừng người dùng lên huy hiệu mới

Khi nào: Khi điểm cộng đồng đủ để lên badge level mới

File: models/userModel.js

Ví dụ:


{
  type: "system",
  title: "🎖️ Bạn đã nhận huy hiệu mới!",
  content: {
    message: "Chúc mừng! Bạn đã đạt huy hiệu 'Đồng'. Đạt 100 điểm cộng đồng",
    action: "badge_unlocked",
    badge_name: "Đồng",
    badge_level: 1,
    min_points: 100
  },
  redirect_type: "profile",
  data: {
    badge_id: "badge-001",
    badge_level: 1,
    badge_name: "Đồng",
    badge_icon: "🥉",
    badge_description: "Đạt 100 điểm cộng đồng",
    min_points: 100,
    current_points: 150,
    unlocked_at: "2025-11-19T19:30:00.000Z"
  }
}
