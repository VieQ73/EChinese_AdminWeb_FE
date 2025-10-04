/**
 * Entities Index - Re-export tất cả types từ các module domain
 * 
 * File này giúp maintain backward compatibility và cung cấp
 * single import point cho tất cả entity types
 */

// --- Base Types ---
export * from './base';

// --- Domain Modules ---
export * from './user';
export * from './subscription';
export * from './mocktest';
export * from './vocab';
export * from './content';
export * from './community';
export * from './system';