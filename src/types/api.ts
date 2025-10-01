/**
 * Định nghĩa cấu trúc trả về chuẩn cho các API lấy danh sách có phân trang.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}