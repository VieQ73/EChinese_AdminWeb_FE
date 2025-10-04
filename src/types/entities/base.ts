/**
 * Base types và utility types dùng chung cho toàn hệ thống
 */

// --- Utility Types ---
export type UUID = string; // Postgres UUID
export type Timestamp = string; // ISO 8601 string

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any; // Sử dụng 'any' cho các trường JSON/JSONB phức tạp