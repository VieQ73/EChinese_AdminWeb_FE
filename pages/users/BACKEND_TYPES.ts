/**
 * BACKEND_TYPES.ts
 * 
 * File này chứa các TypeScript types/interfaces mà Backend cần implement
 * để tương thích với Frontend API calls.
 * 
 * Backend developer có thể copy các types này sang backend code (NestJS, Express, etc.)
 */

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Request body khi cấm người dùng
 * POST /admin/users/:userId/ban
 */
export interface BanUserRequest {
  reason: string;        // Lý do cấm (hiển thị trên log) - BẮT BUỘC
  ruleIds: string[];     // Danh sách ID quy tắc vi phạm - BẮT BUỘC
  resolution: string;    // Ghi chú hướng giải quyết - TÙY CHỌN
  severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm - BẮT BUỘC
}

/**
 * Request body khi bỏ cấm người dùng
 * POST /admin/users/:userId/unban
 */
export interface UnbanUserRequest {
  reason: string; // Lý do bỏ cấm - BẮT BUỘC
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Response chung cho ban/unban user
 */
export interface BanUserResponse {
  success: boolean;
  message: string;
  user: User; // User object đã được cập nhật
}

/**
 * User object (simplified - chỉ các fields cần thiết)
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'super admin';
  is_active: boolean; // ← Field quan trọng nhất
  community_points: number;
  level: string;
  badge_level: number;
  created_at: string;
  last_login?: string;
}

// ============================================
// DATABASE MODELS
// ============================================

/**
 * Violation record trong database
 */
export interface Violation {
  id: string; // UUID
  user_id: string; // UUID - người vi phạm
  target_type: 'user' | 'post' | 'comment';
  target_id: string; // UUID - đối tượng bị vi phạm
  severity: 'low' | 'medium' | 'high';
  resolution: string; // Ghi chú giải quyết
  detected_by: 'admin' | 'super admin' | 'auto_ai';
  handled: boolean; // Default: true
  created_at: string; // ISO timestamp
  resolved_at?: string; // ISO timestamp
}

/**
 * Violation-Rule mapping (Many-to-Many)
 */
export interface ViolationRule {
  id: string; // UUID
  violation_id: string; // UUID - references violations(id)
  rule_id: string; // UUID - references community_rules(id)
}

/**
 * Moderation log record
 */
export interface ModerationLog {
  id: string; // UUID
  target_type: 'user' | 'post' | 'comment';
  target_id: string; // UUID
  action: 'remove' | 'restore';
  reason: string;
  performed_by: string; // UUID - admin user id
  created_at: string; // ISO timestamp
}

/**
 * Community rule reference
 */
export interface CommunityRule {
  id: string; // UUID
  title: string;
  description: string;
  severity_default: 'low' | 'medium' | 'high';
  is_active: boolean;
}

// ============================================
// VALIDATION SCHEMAS (for backend)
// ============================================

/**
 * Validation rules cho BanUserRequest
 * 
 * Backend nên validate:
 * - reason: string, min 10 chars, max 500 chars
 * - ruleIds: array, min 1 item, each item is valid UUID
 * - resolution: string, max 1000 chars (optional)
 * - severity: enum ['low', 'medium', 'high']
 */
export const BanUserValidation = {
  reason: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 500,
    errorMessage: 'Lý do cấm phải từ 10-500 ký tự'
  },
  ruleIds: {
    type: 'array',
    required: true,
    minItems: 1,
    itemType: 'uuid',
    errorMessage: 'Phải chọn ít nhất 1 quy tắc vi phạm'
  },
  resolution: {
    type: 'string',
    required: false,
    maxLength: 1000,
    errorMessage: 'Ghi chú không được vượt quá 1000 ký tự'
  },
  severity: {
    type: 'enum',
    required: true,
    values: ['low', 'medium', 'high'],
    errorMessage: 'Mức độ vi phạm không hợp lệ'
  }
};

// ============================================
// ERROR RESPONSES
// ============================================

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Example error responses:
export const ErrorExamples = {
  unauthorized: {
    success: false,
    message: 'Không có quyền thực hiện hành động này'
  },
  userNotFound: {
    success: false,
    message: 'Không tìm thấy người dùng'
  },
  validationError: {
    success: false,
    message: 'Dữ liệu không hợp lệ',
    errors: [
      { field: 'reason', message: 'Lý do cấm phải từ 10-500 ký tự' },
      { field: 'ruleIds', message: 'Phải chọn ít nhất 1 quy tắc vi phạm' }
    ]
  },
  selfBan: {
    success: false,
    message: 'Super Admin không thể cấm chính mình'
  }
};

// ============================================
// EXAMPLE IMPLEMENTATION (Pseudo-code)
// ============================================

/**
 * Example backend controller implementation
 * 
 * @example
 * ```typescript
 * // NestJS Controller
 * @Post('/admin/users/:userId/ban')
 * @UseGuards(AdminGuard)
 * async banUser(
 *   @Param('userId') userId: string,
 *   @Body() body: BanUserRequest,
 *   @CurrentUser() admin: User
 * ): Promise<BanUserResponse> {
 *   
 *   // 1. Validate request
 *   await this.validateBanRequest(body);
 *   
 *   // 2. Check user exists
 *   const user = await this.userService.findById(userId);
 *   if (!user) throw new NotFoundException('User not found');
 *   
 *   // 3. Check self-ban
 *   if (admin.role === 'super admin' && admin.id === userId) {
 *     throw new ForbiddenException('Cannot ban yourself');
 *   }
 *   
 *   // 4. Start transaction
 *   return await this.db.transaction(async (trx) => {
 *     
 *     // 4.1. Update user
 *     await trx('users')
 *       .where({ id: userId })
 *       .update({ is_active: false });
 *     
 *     // 4.2. Create violation
 *     const [violation] = await trx('violations')
 *       .insert({
 *         user_id: userId,
 *         target_type: 'user',
 *         target_id: userId,
 *         severity: body.severity,
 *         resolution: body.resolution || `Tài khoản bị cấm. Lý do: ${body.reason}`,
 *         detected_by: admin.role === 'super admin' ? 'super admin' : 'admin',
 *         handled: true,
 *         created_at: new Date(),
 *         resolved_at: new Date()
 *       })
 *       .returning('*');
 *     
 *     // 4.3. Create violation-rule mappings
 *     const violationRules = body.ruleIds.map(ruleId => ({
 *       violation_id: violation.id,
 *       rule_id: ruleId
 *     }));
 *     await trx('violation_rules').insert(violationRules);
 *     
 *     // 4.4. Create moderation log
 *     await trx('moderation_logs').insert({
 *       target_type: 'user',
 *       target_id: userId,
 *       action: 'remove',
 *       reason: body.reason,
 *       performed_by: admin.id,
 *       created_at: new Date()
 *     });
 *     
 *     // 4.5. Get updated user
 *     const updatedUser = await trx('users')
 *       .where({ id: userId })
 *       .first();
 *     
 *     return {
 *       success: true,
 *       message: 'Đã cấm người dùng thành công',
 *       user: updatedUser
 *     };
 *   });
 * }
 * ```
 */

// ============================================
// SQL QUERIES REFERENCE
// ============================================

export const SQLQueries = {
  
  // Update user to banned
  updateUserToBanned: `
    UPDATE users 
    SET is_active = false, updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
  
  // Create violation
  createViolation: `
    INSERT INTO violations (
      id, user_id, target_type, target_id, 
      severity, resolution, detected_by, 
      handled, created_at, resolved_at
    )
    VALUES (
      gen_random_uuid(), $1, 'user', $1,
      $2, $3, $4,
      true, NOW(), NOW()
    )
    RETURNING *;
  `,
  
  // Create violation-rule mapping
  createViolationRule: `
    INSERT INTO violation_rules (id, violation_id, rule_id)
    VALUES (gen_random_uuid(), $1, $2);
  `,
  
  // Create moderation log
  createModerationLog: `
    INSERT INTO moderation_logs (
      id, target_type, target_id, 
      action, reason, performed_by, created_at
    )
    VALUES (
      gen_random_uuid(), 'user', $1,
      'remove', $2, $3, NOW()
    );
  `,
  
  // Get user with violation history
  getUserWithViolations: `
    SELECT 
      u.*,
      json_agg(
        json_build_object(
          'id', v.id,
          'severity', v.severity,
          'resolution', v.resolution,
          'created_at', v.created_at,
          'rules', (
            SELECT json_agg(cr.title)
            FROM violation_rules vr
            JOIN community_rules cr ON vr.rule_id = cr.id
            WHERE vr.violation_id = v.id
          )
        )
      ) FILTER (WHERE v.id IS NOT NULL) as violations
    FROM users u
    LEFT JOIN violations v ON u.id = v.user_id
    WHERE u.id = $1
    GROUP BY u.id;
  `
};
