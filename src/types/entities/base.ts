/**
 * Base types và utility types dùng chung cho toàn hệ thống
 */

// --- Utility Types ---
export type UUID = string; // Postgres UUID
export type Timestamp = string; // ISO 8601 string

export type Json = unknown; // Sử dụng 'unknown' cho các trường JSON/JSONB phức tạp