/**
 * Barrel file for Community APIs.
 * This file re-exports all API functions from their respective feature-specific files,
 * providing a single entry point for components to import from.
 * Điều này giữ cho các đường dẫn import trong ứng dụng nhất quán (`import * as api from './api'`)
 * ngay cả khi logic bên trong được tách thành nhiều file.
 */

export * from './api/posts';
export * from './api/comments';
export * from './api/interactions';
export * from './api/stats';
export * from './api/activity';
