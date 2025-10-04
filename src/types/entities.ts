/**
 * Main Entities Export - Backward Compatibility Layer
 * 
 * File này re-export tất cả entities từ các module domain
 * để đảm bảo backward compatibility với existing code.
 * 
 * Từ nay có thể import từ:
 * - import { User } from './types/entities' (existing way)
 * - import { User } from './types/entities/user' (new modular way)
 */

// Re-export tất cả types từ entities index
export * from './entities/index';
