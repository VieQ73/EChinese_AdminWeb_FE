Mô Tả Giao Diện Quản Trị Cộng Đồng (Admin Community Page)
Giao diện này được thiết kế để cung cấp cho quản trị viên một cái nhìn tổng quan và các công cụ cần thiết để kiểm duyệt và quản lý nội dung cộng đồng một cách hiệu quả.

I. Phong cách Giao diện người dùng (UI Style)
Giao diện sử dụng phong cách hiện đại, tối giản (Minimalist), tập trung vào sự rõ ràng và dễ sử dụng (Clarity and Usability).

|

| Thuộc tính | Chi tiết |
| Màu sắc Chủ đạo | Xanh dương (Blue/Teal): Dùng cho các nút hành động chính, tiêu đề, và các icon chức năng. |
| Bố cục | Sử dụng Grid Layout 3 cột trên desktop (2/3 nội dung, 1/3 sidebar). |
| Thẩm mỹ | Bo tròn góc (Rounded corners) cho tất cả các thẻ (card), nút bấm, và input. |
| Nền | Nền trang là màu trắng hoặc xám nhạt (bg-gray-50) để làm nổi bật các thẻ nội dung (bg-white). |
| Hiệu ứng | Sử dụng Shadows (bóng đổ nhẹ) cho các card (shadow-lg) để tạo cảm giác chiều sâu, giúp các bài viết và công cụ quản lý trông chuyên nghiệp hơn. |
| Tương tác | Các nút có hiệu ứng chuyển đổi mượt mà (transition-colors, hover:scale-[1.02]) khi di chuột hoặc nhấn. |

II. Cấu trúc Khung Chính (AdminCommunityPage)
Component này là khung chứa, chia trang thành hai khu vực chính:

1. Khu vực Nội dung Chính (Main Content Area)
Khu vực này chứa các luồng nội dung và tương tác chính của Admin.

| Phần | Mô tả |
| Header | Tiêu đề trang "Nội dung Cộng đồng" và mô tả ngắn. |
| Widget Tạo Bài viết | Một thẻ đơn giản (giả lập ô nhập liệu) cho phép Admin nhanh chóng tạo bài viết mới. Khi nhấn vào sẽ mở Modal Tạo Bài viết Mới. |
| Danh sách Bài viết | Nơi chứa các component PostCard được lọc và sắp xếp. |

2. Thanh Công cụ Bên Phải (Sidebar)
Component này (tách biệt về mặt logic) chứa các công cụ điều khiển và thông tin tổng hợp.

| Thẻ | Icon | Chức năng |
| Tìm kiếm Nhanh | Search | Input cho phép Admin tìm kiếm theo Tiêu đề và Nội dung của bài viết. |
| Lọc theo Chủ đề | Filter | Dropdown liệt kê các chủ đề có sẵn. Admin chọn một chủ đề để lọc danh sách bài viết. |
| Thống kê Cộng đồng | Chart/Bar | Hiển thị các chỉ số: Tổng Bài viết, Đã được Ghim, Bài viết Đã Gỡ. |

III. Component PostCard (PostCard.tsx - Chi tiết)
Đây là thẻ hiển thị tóm tắt của một bài viết, tập trung vào các công cụ quản trị và tương tác cơ bản.

1. Khu vực Nội dung (Tính năng "Xem thêm")
Giới hạn Chiều cao: Nội dung được giới hạn hiển thị ban đầu với chiều cao khoảng 150 pixel.

Hiệu ứng Mờ dần: Nếu nội dung dài hơn, phần bị tràn sẽ được làm mờ dần (bg-gradient-to-t) ở dưới cùng.

Nút Toggle:

"Xem thêm...": Xuất hiện khi nội dung bị tràn. Nhấn vào để mở rộng toàn bộ nội dung.

"Thu gọn": Thay thế "Xem thêm" khi nội dung đã được mở rộng. Nhấn vào để quay về trạng thái giới hạn.

2. Thanh Tương tác Nhanh (Community  SideBar)
Các nút này hoạt động theo cơ chế Bật/Tắt (Toggle), đồng thời cập nhật số liệu ở phần thống kê (như post.likes, post.views):

| Nút | Icon | Mô tả Chức năng | Hành động Khi Nhấn |
| Thích / Bỏ thích | Heart | Chuyển đổi trạng thái "Thích" của người dùng hiện tại. | Tăng/Giảm số lượng Lượt thích. |
| Bình luận | MessageCircle | Hành động chính để xem chi tiết bài viết. | Mở Giao diện Chi tiết Bài viết (chưa triển khai). |
| Xem / Đã xem | Eye | Đánh dấu bài viết đã được đọc (Viewed). | Tăng/Giảm số lượng Lượt xem. |

3. Menu Tùy chọn (Menu Hành động)
Ghim / Bỏ ghim: Chỉ dành cho Admin.

Chỉnh sửa: Cho phép sửa nội dung bài viết (mở Modal Chỉnh sửa).

Gỡ bài viết: Mở Modal Xác nhận Gỡ bài (yêu cầu lý do gỡ chuyên nghiệp, có hỗ trợ gợi ý từ AI - Gemini).

