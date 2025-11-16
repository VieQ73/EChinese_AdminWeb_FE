// utils/csvExport.ts

/**
 * Utility functions để xuất dữ liệu ra file CSV
 */

/**
 * Chuyển đổi mảng object thành chuỗi CSV
 * @param data - Mảng dữ liệu cần xuất
 * @param headers - Object mapping key -> tên cột hiển thị
 * @returns Chuỗi CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers: Record<keyof T, string>
): string {
  if (data.length === 0) return '';

  // Lấy các keys từ headers
  const keys = Object.keys(headers) as (keyof T)[];
  
  // Tạo header row
  const headerRow = keys.map(key => headers[key]).join(',');
  
  // Tạo data rows
  const dataRows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      
      // Xử lý giá trị null/undefined
      if (value === null || value === undefined) return '';
      
      // Xử lý string có dấu phẩy hoặc dấu ngoặc kép
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        // Escape dấu ngoặc kép và wrap trong dấu ngoặc kép
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Tải xuống file CSV
 * @param csvContent - Nội dung CSV
 * @param filename - Tên file (không cần .csv extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Thêm BOM để Excel hiển thị đúng tiếng Việt
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Tạo link download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Format số tiền VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format ngày giờ
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
