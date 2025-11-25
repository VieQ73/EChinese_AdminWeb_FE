# Triển khai Chức năng Xuất CSV cho Giao dịch

## Tổng quan
Đã thêm chức năng xuất CSV cho danh sách giao dịch thanh toán trong trang "Gói đăng ký và Thanh toán" > Tab "Giao dịch".

## Các file đã tạo/cập nhật

### 1. `utils/csvExport.ts` (MỚI)
**Mục đích:** Utility functions để xuất dữ liệu ra file CSV

**Các hàm chính:**

#### `convertToCSV<T>(data: T[], headers: Record<keyof T, string>): string`
- Chuyển đổi mảng object thành chuỗi CSV
- Xử lý các trường hợp đặc biệt:
  - Giá trị null/undefined → chuỗi rỗng
  - String có dấu phẩy/ngoặc kép/xuống dòng → wrap trong dấu ngoặc kép
  - Escape dấu ngoặc kép trong string

**Ví dụ:**
```typescript
const data = [
  { id: '1', name: 'Nguyễn Văn A', amount: 100000 },
  { id: '2', name: 'Trần, Thị B', amount: 200000 }
];

const headers = {
  id: 'Mã',
  name: 'Tên',
  amount: 'Số tiền'
};

const csv = convertToCSV(data, headers);
// Output:
// Mã,Tên,Số tiền
// 1,Nguyễn Văn A,100000
// 2,"Trần, Thị B",200000
```

#### `downloadCSV(csvContent: string, filename: string): void`
- Tải xuống file CSV
- Thêm BOM (Byte Order Mark) để Excel hiển thị đúng tiếng Việt
- Tự động thêm extension `.csv`
- Cleanup URL sau khi download

#### `formatCurrency(amount: number): string`
- Format số tiền theo định dạng VND
- Ví dụ: `100000` → `100.000 ₫`

#### `formatDateTime(dateString: string): string`
- Format ngày giờ theo định dạng Việt Nam
- Ví dụ: `2024-01-15T10:30:00Z` → `15/01/2024, 10:30:00`

---

### 2. `pages/monetization/payments/PaymentList.tsx` (CẬP NHẬT)

#### Thêm imports:
```typescript
import { convertToCSV, downloadCSV, formatCurrency, formatDateTime } from '../../../utils/csvExport';
import { PAYMENT_STATUSES, PAYMENT_METHODS, PAYMENT_CHANNELS } from '../constants';
```

#### Thêm handler `handleExportCSV`:
```typescript
const handleExportCSV = useCallback(() => {
    if (payments.length === 0) {
        alert('Không có dữ liệu để xuất');
        return;
    }

    // Chuẩn bị dữ liệu để xuất
    const exportData = payments.map(payment => ({
        id: payment.id,
        user_email: payment.userEmail || 'N/A',
        user_name: payment.userName || 'N/A',
        subscription_name: payment.subscriptionName || 'N/A',
        amount: formatCurrency(payment.amount),
        currency: payment.currency,
        status: PAYMENT_STATUSES[payment.status] || payment.status,
        payment_method: PAYMENT_METHODS[payment.payment_method] || payment.payment_method,
        payment_channel: PAYMENT_CHANNELS[payment.payment_channel] || payment.payment_channel,
        gateway_transaction_id: payment.gateway_transaction_id || '',
        transaction_date: formatDateTime(payment.transaction_date),
        processed_by_admin_name: payment.processedByAdminName || '',
        notes: payment.notes || '',
    }));

    // Định nghĩa headers
    const headers = {
        id: 'Mã giao dịch',
        user_email: 'Email người dùng',
        user_name: 'Tên người dùng',
        subscription_name: 'Gói đăng ký',
        amount: 'Số tiền',
        currency: 'Đơn vị tiền tệ',
        status: 'Trạng thái',
        payment_method: 'Phương thức',
        payment_channel: 'Kênh thanh toán',
        gateway_transaction_id: 'Mã giao dịch gateway',
        transaction_date: 'Ngày giao dịch',
        processed_by_admin_name: 'Người xử lý',
        notes: 'Ghi chú',
    };

    // Chuyển đổi và download
    const csvContent = convertToCSV(exportData, headers);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `giao-dich-${timestamp}`;
    downloadCSV(csvContent, filename);
}, [payments]);
```

#### Truyền handler xuống PaymentToolbar:
```typescript
<PaymentToolbar 
    filters={filters} 
    onFilterChange={handleFilterChange}
    dates={dates}
    onDatesChange={setDates}
    onExportCSV={handleExportCSV}  // ← Thêm prop này
/>
```

---

### 3. `pages/monetization/payments/components/PaymentToolbar.tsx` (CẬP NHẬT)

#### Cập nhật interface:
```typescript
interface PaymentToolbarProps {
    // ... các props khác
    onExportCSV: () => void;  // ← Thêm prop này
}
```

#### Cập nhật component:
```typescript
const PaymentToolbar: React.FC<PaymentToolbarProps> = ({ 
    filters, 
    onFilterChange, 
    dates, 
    onDatesChange, 
    onExportCSV  // ← Nhận prop
}) => {
    return (
        // ...
        <button 
            onClick={onExportCSV}  // ← Gọi handler
            className="flex items-center w-full sm:w-auto justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
        >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Xuất CSV
        </button>
    );
};
```

---

## Cách sử dụng

### Từ giao diện người dùng:

1. Vào trang **Gói đăng ký và Thanh toán**
2. Chọn tab **Giao dịch**
3. (Tùy chọn) Áp dụng các filter:
   - Tìm kiếm theo mã giao dịch, email
   - Lọc theo khoảng thời gian
   - Lọc theo trạng thái
   - Lọc theo phương thức thanh toán
   - Lọc theo kênh thanh toán
4. Click nút **"Xuất CSV"**
5. File CSV sẽ được tải xuống với tên: `giao-dich-YYYY-MM-DD.csv`

### Dữ liệu được xuất:

File CSV bao gồm các cột sau:

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| Mã giao dịch | ID của giao dịch | `pay_abc123` |
| Email người dùng | Email của người mua | `user@example.com` |
| Tên người dùng | Tên của người mua | `Nguyễn Văn A` |
| Gói đăng ký | Tên gói đã mua | `Premium 1 tháng` |
| Số tiền | Số tiền đã format | `100.000 ₫` |
| Đơn vị tiền tệ | Loại tiền tệ | `VND` |
| Trạng thái | Trạng thái giao dịch | `Thành công` |
| Phương thức | Phương thức thanh toán | `Chuyển khoản ngân hàng` |
| Kênh thanh toán | Tự động/Thủ công | `Tự động` |
| Mã giao dịch gateway | Mã từ cổng thanh toán | `TXN123456` |
| Ngày giao dịch | Ngày giờ giao dịch | `15/01/2024, 10:30:00` |
| Người xử lý | Admin xử lý (nếu có) | `Admin Nguyễn` |
| Ghi chú | Ghi chú thêm | `Đã xác nhận` |

---

## Tính năng đặc biệt

### 1. Hỗ trợ tiếng Việt
- Thêm BOM (Byte Order Mark) để Excel hiển thị đúng tiếng Việt
- Không cần chuyển encoding khi mở file

### 2. Xử lý dữ liệu đặc biệt
- Tự động escape dấu phẩy, ngoặc kép trong text
- Xử lý giá trị null/undefined
- Format số tiền và ngày giờ theo chuẩn Việt Nam

### 3. Tên file tự động
- Format: `giao-dich-YYYY-MM-DD.csv`
- Ví dụ: `giao-dich-2024-01-15.csv`

### 4. Xuất theo filter
- Chỉ xuất các giao dịch đang hiển thị (đã được filter)
- Không xuất toàn bộ database

---

## Ví dụ file CSV xuất ra

```csv
Mã giao dịch,Email người dùng,Tên người dùng,Gói đăng ký,Số tiền,Đơn vị tiền tệ,Trạng thái,Phương thức,Kênh thanh toán,Mã giao dịch gateway,Ngày giao dịch,Người xử lý,Ghi chú
pay_001,user1@example.com,Nguyễn Văn A,Premium 1 tháng,100.000 ₫,VND,Thành công,Chuyển khoản ngân hàng,Tự động,TXN123456,15/01/2024 10:30:00,Admin Nguyễn,Đã xác nhận
pay_002,user2@example.com,"Trần, Thị B",Basic 3 tháng,200.000 ₫,VND,Đang chờ,MoMo,Thủ công,,16/01/2024 14:20:00,,
pay_003,user3@example.com,Lê Văn C,Premium 6 tháng,500.000 ₫,VND,Thất bại,VNPay,Tự động,TXN789012,17/01/2024 09:15:00,,Giao dịch bị từ chối
```

---

## Xử lý lỗi

### Trường hợp 1: Không có dữ liệu
```typescript
if (payments.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
}
```
**Kết quả:** Hiển thị thông báo, không tải file

### Trường hợp 2: Dữ liệu thiếu
```typescript
user_email: payment.userEmail || 'N/A',
```
**Kết quả:** Hiển thị 'N/A' cho các trường thiếu

### Trường hợp 3: Browser không hỗ trợ
- Sử dụng Blob API (hỗ trợ tất cả browser hiện đại)
- Fallback: User có thể copy/paste dữ liệu

---

## Mở rộng trong tương lai

### 1. Xuất nhiều format
```typescript
// Thêm dropdown chọn format
<select onChange={(e) => setExportFormat(e.target.value)}>
  <option value="csv">CSV</option>
  <option value="excel">Excel</option>
  <option value="pdf">PDF</option>
</select>
```

### 2. Xuất tất cả (không chỉ trang hiện tại)
```typescript
const handleExportAll = async () => {
  const allPayments = await fetchPayments({ limit: 10000 });
  // Export all...
};
```

### 3. Tùy chỉnh cột xuất
```typescript
const [selectedColumns, setSelectedColumns] = useState([
  'id', 'user_email', 'amount', 'status'
]);
// Chỉ xuất các cột được chọn
```

### 4. Lên lịch xuất tự động
```typescript
// Xuất báo cáo hàng ngày/tuần/tháng
const scheduleExport = (frequency: 'daily' | 'weekly' | 'monthly') => {
  // Implementation...
};
```

---

## Testing

### Test case 1: Xuất CSV bình thường
```
1. Vào trang Giao dịch
2. Click "Xuất CSV"
3. Kiểm tra:
   - File được tải xuống ✓
   - Tên file đúng format ✓
   - Dữ liệu đầy đủ ✓
   - Tiếng Việt hiển thị đúng ✓
```

### Test case 2: Xuất với filter
```
1. Áp dụng filter (ví dụ: chỉ "Thành công")
2. Click "Xuất CSV"
3. Kiểm tra:
   - Chỉ xuất giao dịch thành công ✓
   - Số lượng đúng ✓
```

### Test case 3: Không có dữ liệu
```
1. Filter sao cho không có kết quả
2. Click "Xuất CSV"
3. Kiểm tra:
   - Hiển thị alert "Không có dữ liệu" ✓
   - Không tải file ✓
```

### Test case 4: Dữ liệu đặc biệt
```
1. Có giao dịch với:
   - Tên có dấu phẩy: "Nguyễn, Văn A"
   - Ghi chú có xuống dòng
   - Giá trị null
2. Click "Xuất CSV"
3. Kiểm tra:
   - Dữ liệu được escape đúng ✓
   - Mở trong Excel không bị lỗi ✓
```

---

## Kết luận

Chức năng xuất CSV đã được triển khai hoàn chỉnh với:
- ✅ Xuất tất cả thông tin giao dịch
- ✅ Hỗ trợ tiếng Việt
- ✅ Format dữ liệu đẹp (số tiền, ngày giờ)
- ✅ Xử lý dữ liệu đặc biệt
- ✅ Tên file tự động với timestamp
- ✅ Xuất theo filter hiện tại
- ✅ Xử lý lỗi tốt
- ✅ Dễ dàng mở rộng

User có thể xuất CSV để:
- Lưu trữ offline
- Phân tích trong Excel
- Báo cáo cho kế toán
- Backup dữ liệu
