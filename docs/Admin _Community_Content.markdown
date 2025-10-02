# Đặc Tả Trang Quản Lý Nội Dung Cộng Đồng (Admin)

## 1 — Tóm tắt mục tiêu

Trang Nội dung Cộng đồng (Admin) là một bảng tin (feed) tương tự bảng tin người dùng (Instagram,…). Admin / Super Admin có thể:

- Đăng bài, thích (like), bình luận (comment), chia sẻ (share) (giống như người dùng thông thường) để thử nghiệm trải nghiệm.
- Cho phép lọc bài viết theo chủ đề (danh sách chủ đã có trong file database-shema.dbml)
- Quản lý bài viết và bình luận của người dùng theo quyền hạn (gỡ bài viết, khôi phục, xóa vĩnh viễn).
- Xem hồ sơ cộng đồng của một người dùng bất kỳ (với 3 thẻ: Đã đăng / Bị gỡ / Bị xóa).
- Mọi thay đổi do admin thực hiện sẽ được ghi log và (khi cần) tạo thông báo (notification) cho người dùng/admin khác.
- Đồng bộ hóa thời gian thực (real-time sync) với ứng dụng di động (thông qua push notification / websocket).

**Hạn chế nội dung:** Chỉ cho phép văn bản đa dạng thức (rich text) và hình ảnh. Không cho phép tải lên video.

**Thông tin liên quan tới database:** Xem trong `docs/database-schema.dbml` và `src/types.entities.ts`.

## 2 — Quy tắc phân quyền (Chi tiết, bắt buộc implement)

### Hệ thống gồm 3 loại đối tượng (actor):

- **Người dùng thường (Regular User):** Không có quyền đăng nhập vào admin web, các bài viết của họ được đăng trên mobile app và được backend kéo tới trang “Nội dung Cộng đồng” này của admin.
- **Admin**
- **SuperAdmin**

### Đăng / Chỉnh sửa

- Admin và SuperAdmin có thể tạo bài viết trên trang, tương tự như một trang cộng đồng bình thường. Người dùng trên mobile app cũng có thể thấy bài viết của admin.
- **Chỉnh sửa bài viết:**
  - Chỉ được chỉnh sửa bài viết do chính mình tạo ra (người dùng chỉ sửa bài của họ; admin chỉ sửa bài admin đó đăng; superadmin chỉ sửa bài superadmin đó đăng).
  - Không ai được sửa bài của người khác.

### Xóa / Gỡ / Khôi phục

| Hành động | Người dùng thường (thực chất trên mobile) | Admin | Super Admin |
| --- | --- | --- | --- |
| **Tự xóa bài của mình (Self-delete)** | Xóa mềm (Gỡ) hoặc Xóa vĩnh viễn | Xóa mềm (Gỡ) hoặc Xóa vĩnh viễn | Xóa mềm (Gỡ) hoặc Xóa vĩnh viễn |
| **Gỡ (Soft-delete) bài của người khác** | Không | Bài của Người dùng thường (User) | Bài của mọi người (User, Admin, SuperAdmin) |
| **Khôi phục bài đã bị Gỡ** | Không | Bài đã gỡ của Người dùng thường và bài của chính admin đó | Bài đã gỡ của mọi người (trừ trường hợp tự xóa) |
| **Xóa vĩnh viễn (Hard-delete) bài của người khác** | Không | Không | Bài của Admin và Người dùng thường |

#### Ghi chú rõ:

- **Tự xóa (Self-deleted):** Khi người dùng/admin/superadmin tự xóa bài của chính mình, bài viết được đánh dấu là `self_deleted` và **KHÔNG THỂ** khôi phục bởi Admin/SuperAdmin.
- **Phạm vi khôi phục Admin:** Admin chỉ có thể khôi phục những bài viết không phải `self_deleted` và thuộc về người dùng thường hoặc chính họ.
- **Bình luận (Comments):** Mô hình phân quyền tương tự như bài viết.

### Menu 3 chấm (⋮)

| Tình trạng Bài viết | Chủ sở hữu | Vai trò Người xem | Tùy chọn hiển thị |
| --- | --- | --- | --- |
| Bình thường | Chính mình | Mọi vai trò | Chỉnh sửa, Xóa vĩnh viễn, Gỡ (Tùy chọn) |
| Bình thường | Người dùng thường | Admin | Gỡ (Soft-delete) |
| Bình thường | Người dùng thường | SuperAdmin | Gỡ, Xóa vĩnh viễn |
| Bị Gỡ | Người dùng thường | Admin | Khôi phục (Nếu admin đó hoặc admin khác gỡ) |
| Bị Gỡ | Bất kỳ (trừ self_deleted) | SuperAdmin | Khôi phục |
| Bình thường/Bị gỡ | Admin khác | Admin | Không có hành động quản trị |

### Các trường hợp đặc biệt

- **Lý do:** Khi admin/superadmin thực hiện hành động gỡ hoặc xóa vĩnh viễn, một cửa sổ pop-up (modal) phải yêu cầu nhập **LÝ DO** (bắt buộc phải lưu trữ), ngoại trừ trường hợp chính bản thân họ tự xóa (self-delete) thì không cần lý do.
- **Kiểm toán (Audit):** Mọi hành động quản trị (gỡ/xóa/khôi phục) phải tạo một mục nhập trong bảng `AdminLogs`.

## 3 — UI / UX chi tiết (Component + Behaviors)

### A. Bố cục Trang (Nội dung Cộng đồng)

- **Tiêu đề (Header):** Tiêu đề trang, Bộ lọc (Filters), Tìm kiếm (Search), Nút Tạo Bài viết (chỉ cho Admin & SuperAdmin).
- **Cột chính (Trái - Feed):** Bảng tin cuộn vô hạn (infinite-scroll) gồm các `PostCard` (trên desktop: cột căn giữa, thiết kế đáp ứng - responsive).
- **Cột phải (Tùy chọn):** Các chủ đề thịnh hành, thống kê nhanh kiểm duyệt (báo cáo chờ xử lý, số lượng mục đã gỡ), các phím tắt bộ lọc.

#### PostCard (Thẻ Bài viết)

- **Header:** Ảnh đại diện, Tên hiển thị (kèm huy hiệu), thời gian đăng, menu (⋮). (click vào tên hoặc ảnh đại diện→ mở modal Hồ sơ Cộng đồng của Người dùng)
- **Body:** Trình kết xuất nội dung Rich Text + Khung hình ảnh.
- **Footer:** Thanh hành động → Thích (số lượng), Bình luận (số lượng), Chia sẻ (số lượng), Số lượng báo cáo (nếu có).

#### Trạng thái hình ảnh (Visual states):

| Trạng thái | Mô tả |
| --- | --- |
| Bình thường | Hiển thị đầy đủ màu sắc |
| Gỡ (Soft-deleted) | Lớp phủ màu xám (opacity 60%), huy hiệu cảnh báo màu đỏ ở góc trên bên phải: Gỡ — Lý do: ... (hiển thị lý do khi di chuột) |
| Xóa vĩnh viễn | Hiển thị phần giữ chỗ (placeholder) "Đã bị xóa vĩnh viễn" với biểu tượng X đỏ, không hiển thị nội dung |
| Tự xóa (Self_deleted) | Hiển thị "Người dùng đã xóa bài" — chỉ đọc, admin/superadmin không thể khôi phục |

### B. Cửa sổ Pop-up (Modal) Tạo / Chỉnh sửa Bài viết

- **Các trường:**
  - Trình soạn thảo văn bản đa dạng thức (Rich text editor): hỗ trợ in đậm, in nghiêng, gạch chân, màu chữ, màu nền, căn chỉnh, danh sách có thứ tự, danh sách gạch đầu dòng, chèn liên kết (URL + văn bản hiển thị).
  - Khu vực tải lên hình ảnh: cho phép chọn 1 trong 3 kiểu khung hình hạn chế (xem dưới).
  - Hiển thị (Visibility): Công khai (feed).
- **Nút:** Đăng / Hủy. Khi cập nhật, cập nhật lại dấu thời gian (timestamp) và thông báo thời gian thực đến ứng dụng di động.

### C. Khung hình ảnh (Tập hợp hạn chế)

Chỉ cho phép 3 loại khung (chọn 1 khi đăng bài):

1. **Đơn (Single):** 1 ảnh lớn (tỷ lệ khung hình 16:9 hoặc 4:3).
2. **Hai cột (Two-column):** 2 ảnh đặt cạnh nhau (chiều rộng bằng nhau, hình vuông hoặc gần vuông).
3. **Thư viện (Gallery - 3 grid):** Tối đa 3 ảnh trong lưới (1 ảnh lớn + 2 ảnh nhỏ hoặc 3 ảnh vuông bằng nhau).

**Ràng buộc:**

- Tối đa 3 ảnh mỗi bài.
- Định dạng cho phép: jpg/jpeg, png, webp.
- Kích thước tối đa mỗi ảnh: 5 MB.
- Không cho phép video.
- **UI:** Thành phần tải lên hiển thị bản xem trước, cho phép sắp xếp lại thứ tự và khóa tỷ lệ khung hình (crop-ish aspect ratio locking).

### D. Giao diện Bình luận (Comment UI)

- Hiển thị nội tuyến (inline) bên dưới bài viết (có thể mở rộng).
- Mỗi bình luận có header (avatar, tên, thời gian), nội dung, biểu tượng hành động (thích, trả lời), menu (⋮) với các tùy chọn theo quyền hạn.
- Hỗ trợ trả lời lồng nhau (một cấp độ hoặc nhiều cấp độ).

### E. Cửa sổ Pop-up Hồ sơ Cộng đồng Người dùng (User Community Profile modal)

(Mở khi click vào ảnh đại diện)

- **Header:** Ảnh đại diện, tên, huy hiệu vai trò, nút hành động (khóa tài khoản).
- **Các thẻ (Tabs):**
  - **Đã đăng:** Bảng tin gồm tất cả bài viết + bình luận của họ. (Bình luận hiển thị liên kết ngữ cảnh đến bài viết gốc. Nhấp vào bình luận sẽ mở bài viết đó và cuộn đến bình luận).
  - **Bị gỡ:** Các bài viết/bình luận đã bị gỡ (soft-deleted). Hiển thị tương tự như feed nhưng mờ + biểu tượng cảnh báo đỏ. Mỗi mục hiển thị Lý do gỡ và nút Khôi phục cho các vai trò được phép.
  - **Bị xóa:** Các mục đã bị xóa vĩnh viễn (không thể khôi phục). Hiển thị lý do và ai đã xóa.
  - Phân trang/cuộn vô hạn bên trong mỗi thẻ.

### F. Luồng Cửa sổ Pop-up Kiểm duyệt (Moderation Modal flows)

**Gỡ / Xóa:**

- Cửa sổ pop-up yêu cầu lý do (bắt buộc), ngoại trừ khi hành động là tự xóa bởi tác giả (bỏ qua lý do).
- **Ghi log Hành động:** Tạo mục nhập `AdminLogs` (với `user_id`, `action_type`, `target_id`, `reason`).
- **Hành động Gỡ (soft-delete):** Đặt `deleted_at`, chèn bản ghi `RemovedContents` (xem DB).
- **Hành động Khôi phục:** Xóa `deleted_at`, đánh dấu bản ghi `RemovedContents` là đã khôi phục (lưu `restored_by`, `restored_at`).
- **Xem mục đã gỡ:** Hiển thị ai đã gỡ và lý do.

### G. Đồng bộ hóa Thời gian thực / Thông báo (Real-time / Notifications)

Khi một bài viết được tạo/cập nhật/xóa/gỡ/khôi phục:

- Phát sự kiện (broadcast event) qua WebSocket / SSE đến các bảng điều khiển admin và ứng dụng di động đang kết nối.
- Tùy chọn tạo Thông báo (Notifications) cho người dùng bị ảnh hưởng (ví dụ: người dùng nhận được thông báo "Bài viết của bạn đã bị gỡ — Lý do ...").
- Hành động của Admin nên tùy chọn tạo Thông báo cho người báo cáo (reporter) nếu có liên quan.

## 4 — API Endpoints (REST) — Danh sách đề xuất & Quy tắc

Tất cả các endpoint admin đều yêu cầu xác thực (auth) + kiểm tra vai trò (role check).

### Bài viết (Posts - admin)

| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/admin/posts` | Liệt kê các bài viết kèm bộ lọc (chủ đề, trạng thái) |
| GET | `/admin/posts/:id` | Xem chi tiết bài viết (bao gồm bình luận) |
| POST | `/admin/posts` | Tạo một bài viết (admin đăng bài) |
| PUT | `/admin/posts/:id` | Chỉnh sửa bài viết (chỉ khi người dùng hiện tại là tác giả) |
| POST | `/admin/posts/:id/remove` | Xóa bài viết (soft-delete). Payload: `{ reason?: string }` |
| POST | `/admin/posts/:id/restore` | Khôi phục bài viết. Payload: `{ }` |
| DELETE | `/admin/posts/:id` | Xóa vĩnh viễn bài viết (chỉ cho SuperAdmin HOẶC tác giả tự xóa) |

#### Quy tắc:

- **POST /admin/posts/:id/remove:**
  - Nếu tác nhân (actor) là tác giả của bài viết: thực hiện tự xóa (self-delete): đánh dấu `posts.deleted_at` và `RemovedContents.removal_kind='self'` (không cần lý do).
  - Ngược lại, nếu vai trò của tác nhân là 'admin' và tác giả mục tiêu là người dùng thường HOẶC là admin khác: cho phép gỡ mềm (cần lý do).
  - Ngược lại, nếu vai trò của tác nhân là 'superadmin': cho phép gỡ mềm (cần lý do).
- **POST /admin/posts/:id/restore:**
  - Chỉ được phép nếu `RemovedContents.removal_kind != 'self'` và tác nhân có quyền (admin: có thể khôi phục các bài viết xóa mềm không phải tự xóa, và được gỡ bởi admin; superadmin: khôi phục bất kỳ bài xóa mềm nào trừ tự xóa).
- **DELETE /admin/posts/:id (xóa vĩnh viễn):**
  - Nếu tác nhân là tác giả: được phép (tự xóa vĩnh viễn không cần lý do).
  - Ngược lại, nếu vai trò của tác nhân là 'superadmin': được phép xóa bài của admin hoặc người dùng thường.
  - Trong các trường hợp khác: bị cấm.

### Bình luận (Comments - Tương tự)

| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| POST | `/admin/comments/:id/remove` | Xóa bình luận (soft-delete) |
| POST | `/admin/comments/:id/restore` | Khôi phục bình luận |
| DELETE | `/admin/comments/:id` | Xóa vĩnh viễn bình luận |
| PUT | `/admin/comments/:id` | Chỉnh sửa bình luận (chỉ khi là tác giả) |

### Modal Hồ sơ người dùng

- `GET /admin/users/:id/content?tab=posted|removed|deleted`

### Logs Kiểm toán (Audit logs)

- `GET /admin/logs?user_id=&action_type=&from=&to=`

## 5 — Luồng / Ví dụ Trình tự

### A. Admin gỡ bài người dùng

1. Admin click ⋮ → chọn Gỡ bài.
2. Cửa sổ pop-up yêu cầu lý do → Admin gửi.
3. **Backend:**
   - Đặt `posts.deleted_at = now()`.
   - Chèn bản ghi `RemovedContents` với `removal_kind='soft'`, `removed_by=admin_id`, `reason`.
   - Chèn mục nhập `AdminLogs`.
   - Tạo Notification cho chủ sở hữu bài viết (với `recipient_id = owner`) kèm theo chi tiết về việc gỡ.
   - Phát sự kiện websocket đến máy khách để cập nhật bảng tin (bài viết chuyển sang màu xám/mờ).
4. **Frontend:** Cập nhật UI (bài viết mờ + huy hiệu).

### B. Người dùng tự xóa (User self-delete)

1. Người dùng click xóa trên bài viết của họ (không cần lý do).
2. **Backend:**
   - Đặt `posts.deleted_at = now()`.
   - Chèn bản ghi `RemovedContents` với `removal_kind='self'`.
   - Chèn mục nhập `AdminLogs` (ghi nhận tác nhân nhưng đánh dấu loại là 'self-delete').
3. Admin nhìn thấy bài viết trong UI dưới dạng "Người dùng đã xóa" nhưng không thể khôi phục.

### C. SuperAdmin xóa vĩnh viễn bài viết của admin/người dùng

1. SuperAdmin chọn Xóa vĩnh viễn trên bài viết.
2. **Backend:**
   - Xóa bản ghi khỏi bảng `Posts`.
   - Chèn mục nhập `RemovedContents` với `removal_kind='hard'`, ghi lại người thực hiện hành động và lý do.
   - Chèn mục nhập `AdminLogs`.
   - Tạo Notification cho chủ sở hữu (nếu chủ sở hữu != superadmin) rằng nội dung đã bị xóa vĩnh viễn.
3. **Frontend:** Xóa bài viết khỏi bảng tin hoặc thay thế bằng "Bài viết đã bị xóa vĩnh viễn".

## 6 — Ghi chú triển khai Frontend (Cấp độ component)

- **Components:** `PostCard`, `CommentItem`, `UserCommunityModal`, `RemoveModal`, `RestoreModal`, `CreateEditPostModal`, `ImageUploader` (có bộ chọn khung hình).
- **Quản lý trạng thái (State):** Sử dụng kho dữ liệu trung tâm (ví dụ: React Query hoặc Redux) để lưu trữ cache bảng tin và làm mất hiệu lực (invalidate) khi có sự kiện.
- **Thời gian thực (Real-time):** Sử dụng WebSocket (socket.io) hoặc SSE. Đăng ký các sự kiện: `post.created`, `post.updated`, `post.removed`, `post.restored`, `comment.created`.
- **Chế độ giả lập (Mock mode):** Nếu `USE_MOCK_API` được bật, mô phỏng các sự kiện bằng `setTimeout` và kho dữ liệu giả lập cục bộ. Đảm bảo dữ liệu giả lập bao gồm siêu dữ liệu `removed_kind` để thực thi quy tắc không khôi phục đối với các bài viết tự xóa.

## 7 — Xác thực / Quy tắc & Ràng buộc UX

- **Quy tắc hình ảnh:** Định dạng (jpg/png/webp), tối đa 3 ảnh, tối đa 5MB mỗi ảnh.
- **Rich text editor:** Cho phép định dạng: in đậm, in nghiêng, gạch chân, màu chữ, màu nền, căn chỉnh, danh sách có thứ tự/gạch đầu dòng, chèn liên kết (URL + văn bản).
- **Bảo vệ Khôi phục:** Nỗ lực khôi phục một mục đã `self_deleted` phải trả về mã lỗi 403 với thông báo "Không thể khôi phục bài viết do tác giả tự xóa."
- **Ghi log:** Mọi hành động kiểm duyệt phải tạo một bản ghi `AdminLogs` với `user_id` (tác nhân), `action_type`, `target_id`, `description` (lý do).
- **Thời gian lưu giữ (Retention):** Các mục đã xóa mềm (soft-deleted) sẽ tự động bị xóa vĩnh viễn sau X ngày (có thể cấu hình, ví dụ: 7 hoặc 30 ngày). Cần thêm công việc định kỳ (cron job) để thực hiện xóa vĩnh viễn sau thời gian lưu giữ.

## 8 — Các trường hợp đặc biệt & Đề xuất

- Nếu một bài viết đã bị báo cáo và sau đó bị người dùng tự xóa, admin vẫn có thể xem báo cáo nhưng không thể khôi phục bài viết. Báo cáo tham chiếu đến bài viết tự xóa nên hiển thị trạng thái và ghi chú rằng bài viết đã bị người dùng tự gỡ.
- Nếu admin gỡ một bài viết và sau đó muốn khôi phục nhưng tác giả gốc đã xóa tài khoản của họ — việc khôi phục nên đặt bài viết đó thuộc về một tài khoản "hệ thống" hoặc đánh dấu là mồ côi (quyết định chính sách). **Đề xuất:** Ngăn chặn khôi phục nếu chủ sở hữu gốc bị thiếu; yêu cầu SuperAdmin ghi đè.
- Các trường hợp tài khoản người dùng đã bị khóa thì bài viết và comment của họ đã đăng vẫn hiển thị bình thường, nhưng sẽ có thêm ký hiệu hoặc chú thích (như dấu chấm than, khi di chuột vào dấu chấm than trên bài viết hoặc comment của người đã bị khóa tài khoản thì sẽ hiển thị chữ “Tài khoản bị khóa”).
- Để phục vụ kiểm toán (audit), nên lưu trữ ảnh chụp nhanh (snapshots): khi gỡ/xóa một bài viết, sao chép nội dung vào `RemovedContents` hoặc lưu ảnh chụp nhanh trong log để bảo toàn nội dung ngay cả sau khi xóa vĩnh viễn.