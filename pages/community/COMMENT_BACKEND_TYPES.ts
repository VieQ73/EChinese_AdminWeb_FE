/**
 * COMMENT_BACKEND_TYPES.ts
 * 
 * TypeScript types/interfaces cho Comment Moderation APIs
 * Backend developer có thể copy các types này
 */

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Request body khi gỡ bình luận
 * POST /community/comments/:commentId/remove
 */
export interface RemoveCommentRequest {
  reason: string;        // Lý do gỡ - BẮT BUỘC
  ruleIds: string[];     // Danh sách ID quy tắc vi phạm - BẮT BUỘC
  resolution: string;    // Ghi chú hướng giải quyết - TÙY CHỌN
  severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm - BẮT BUỘC
}

/**
 * Request body khi khôi phục bình luận
 * POST /community/comments/:commentId/restore
 */
export interface RestoreCommentRequest {
  reason: string; // Lý do khôi phục - BẮT BUỘC
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Response chung cho remove/restore comment
 */
export interface RemoveRestoreCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
}

/**
 * Comment object
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID
  user_id: string; // UUID
  content: {
    text?: string;
    html?: string;
  };
  parent_comment_id?: string; // UUID - for nested comments
  created_at: string; // ISO timestamp
  
  // Moderation fields
  deleted_at?: string | null; // ISO timestamp
  deleted_by?: string | null; // UUID - admin user id
  deleted_reason?: string | null;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const RemoveCommentValidation = {
  reason: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 500,
    errorMessage: 'Lý do gỡ phải từ 5-500 ký tự'
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

export const RestoreCommentValidation = {
  reason: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 500,
    errorMessage: 'Lý do khôi phục phải từ 5-500 ký tự'
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

export const ErrorExamples = {
  unauthorized: {
    success: false,
    message: 'Không có quyền thực hiện hành động này'
  },
  commentNotFound: {
    success: false,
    message: 'Không tìm thấy bình luận'
  },
  alreadyRemoved: {
    success: false,
    message: 'Bình luận đã bị gỡ trước đó'
  },
  notRemoved: {
    success: false,
    message: 'Bình luận chưa bị gỡ, không thể khôi phục'
  },
  validationError: {
    success: false,
    message: 'Dữ liệu không hợp lệ',
    errors: [
      { field: 'reason', message: 'Lý do gỡ phải từ 5-500 ký tự' },
      { field: 'ruleIds', message: 'Phải chọn ít nhất 1 quy tắc vi phạm' }
    ]
  }
};

// ============================================
// EXAMPLE IMPLEMENTATION
// ============================================

/**
 * Example NestJS Controller
 * 
 * @example
 * ```typescript
 * @Post('/community/comments/:commentId/remove')
 * @UseGuards(AdminGuard)
 * async removeComment(
 *   @Param('commentId') commentId: string,
 *   @Body() body: RemoveCommentRequest,
 *   @CurrentUser() admin: User
 * ): Promise<RemoveRestoreCommentResponse> {
 *   
 *   // 1. Validate request
 *   await this.validateRemoveRequest(body);
 *   
 *   // 2. Check comment exists
 *   const comment = await this.commentService.findById(commentId);
 *   if (!comment) throw new NotFoundException('Comment not found');
 *   
 *   // 3. Check if already removed
 *   if (comment.deleted_at) {
 *     throw new BadRequestException('Comment already removed');
 *   }
 *   
 *   // 4. Start transaction
 *   return await this.db.transaction(async (trx) => {
 *     
 *     // 4.1. Update comment
 *     const [updatedComment] = await trx('comments')
 *       .where({ id: commentId })
 *       .update({
 *         deleted_at: new Date(),
 *         deleted_by: admin.id,
 *         deleted_reason: body.reason
 *       })
 *       .returning('*');
 *     
 *     // 4.2. Create violation
 *     const [violation] = await trx('violations')
 *       .insert({
 *         user_id: comment.user_id,
 *         target_type: 'comment',
 *         target_id: commentId,
 *         severity: body.severity,
 *         resolution: body.resolution || 'Bình luận đã bị gỡ.',
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
 *       target_type: 'comment',
 *       target_id: commentId,
 *       action: 'remove',
 *       reason: body.reason,
 *       performed_by: admin.id,
 *       created_at: new Date()
 *     });
 *     
 *     return {
 *       success: true,
 *       message: 'Đã gỡ bình luận thành công',
 *       comment: updatedComment
 *     };
 *   });
 * }
 * 
 * @Post('/community/comments/:commentId/restore')
 * @UseGuards(AdminGuard)
 * async restoreComment(
 *   @Param('commentId') commentId: string,
 *   @Body() body: RestoreCommentRequest,
 *   @CurrentUser() admin: User
 * ): Promise<RemoveRestoreCommentResponse> {
 *   
 *   // 1. Validate request
 *   await this.validateRestoreRequest(body);
 *   
 *   // 2. Check comment exists
 *   const comment = await this.commentService.findById(commentId);
 *   if (!comment) throw new NotFoundException('Comment not found');
 *   
 *   // 3. Check if removed
 *   if (!comment.deleted_at) {
 *     throw new BadRequestException('Comment is not removed');
 *   }
 *   
 *   // 4. Start transaction
 *   return await this.db.transaction(async (trx) => {
 *     
 *     // 4.1. Update comment
 *     const [updatedComment] = await trx('comments')
 *       .where({ id: commentId })
 *       .update({
 *         deleted_at: null,
 *         deleted_by: null,
 *         deleted_reason: null
 *       })
 *       .returning('*');
 *     
 *     // 4.2. Create moderation log
 *     await trx('moderation_logs').insert({
 *       target_type: 'comment',
 *       target_id: commentId,
 *       action: 'restore',
 *       reason: body.reason,
 *       performed_by: admin.id,
 *       created_at: new Date()
 *     });
 *     
 *     // 4.3. Optional: Update violations
 *     await trx('violations')
 *       .where({ target_type: 'comment', target_id: commentId })
 *       .update({ handled: false });
 *     
 *     return {
 *       success: true,
 *       message: 'Đã khôi phục bình luận thành công',
 *       comment: updatedComment
 *     };
 *   });
 * }
 * ```
 */

// ============================================
// SQL QUERIES REFERENCE
// ============================================

export const SQLQueries = {
  
  // Remove comment
  removeComment: `
    UPDATE comments 
    SET 
      deleted_at = NOW(),
      deleted_by = $1,
      deleted_reason = $2
    WHERE id = $3
    RETURNING *;
  `,
  
  // Restore comment
  restoreComment: `
    UPDATE comments 
    SET 
      deleted_at = NULL,
      deleted_by = NULL,
      deleted_reason = NULL
    WHERE id = $1
    RETURNING *;
  `,
  
  // Create violation for comment
  createCommentViolation: `
    INSERT INTO violations (
      id, user_id, target_type, target_id,
      severity, resolution, detected_by,
      handled, created_at, resolved_at
    )
    VALUES (
      gen_random_uuid(), $1, 'comment', $2,
      $3, $4, $5,
      true, NOW(), NOW()
    )
    RETURNING *;
  `,
  
  // Create moderation log
  createModerationLog: `
    INSERT INTO moderation_logs (
      id, target_type, target_id,
      action, reason, performed_by, created_at
    )
    VALUES (
      gen_random_uuid(), 'comment', $1,
      $2, $3, $4, NOW()
    );
  `,
  
  // Get comment with violations
  getCommentWithViolations: `
    SELECT 
      c.*,
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
    FROM comments c
    LEFT JOIN violations v ON c.id = v.target_id AND v.target_type = 'comment'
    WHERE c.id = $1
    GROUP BY c.id;
  `
};

// ============================================
// BUSINESS LOGIC HELPERS
// ============================================

/**
 * Helper để check xem user có quyền gỡ comment không
 */
export function canRemoveComment(admin: any, comment: any): boolean {
  // Admin và super admin có thể gỡ bất kỳ comment nào
  if (admin.role === 'admin' || admin.role === 'super admin') {
    return true;
  }
  
  // User chỉ có thể gỡ comment của chính mình
  return admin.id === comment.user_id;
}

/**
 * Helper để check xem user có quyền khôi phục comment không
 */
export function canRestoreComment(admin: any, comment: any): boolean {
  // Chỉ admin và super admin mới có thể khôi phục
  return admin.role === 'admin' || admin.role === 'super admin';
}

/**
 * Helper để format comment response
 */
export function formatCommentResponse(comment: any): Comment {
  return {
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    content: comment.content,
    parent_comment_id: comment.parent_comment_id,
    created_at: comment.created_at,
    deleted_at: comment.deleted_at,
    deleted_by: comment.deleted_by,
    deleted_reason: comment.deleted_reason
  };
}
