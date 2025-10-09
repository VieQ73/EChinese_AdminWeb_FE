/**
 * Base types và utility types dùng chung cho toàn hệ thống
 */

export type UUID = string;
export type Timestamp = string;
export type Json = any;

// FIX: Add missing PaginatedResponse type.
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}