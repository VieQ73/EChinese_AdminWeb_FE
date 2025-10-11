/**
 * Entities Index - Re-export tất cả types từ các module domain
 *
 * File này cung cấp một điểm import duy nhất cho tất cả các entity types.
 */

// --- Base Types ---
export * from './base';

// --- Domain Modules ---
export * from './user';
export * from './subscription';
export * from './vocab';
export * from './content';
export * from './community';
export * from './system';
export * from './mocktest';
export * from './mocktest_extended'; // Mở rộng từ mocktest cho domain/API/UI
