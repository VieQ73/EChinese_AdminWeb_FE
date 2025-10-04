# Entity Types Structure - Modular Organization

## 📋 Tổng quan

File `entities.ts` gốc đã được tách thành **8 modules** theo domain để dễ maintain và scale. Tổ chức theo nguyên tắc **Domain-Driven Design**.

## 🏗️ Cấu trúc mới

```
src/types/
├── entities.ts                 # ✅ Backward compatibility layer (re-export all)
├── entities/
│   ├── index.ts               # ✅ Main export hub
│   ├── base.ts               # 🔧 UUID, Timestamp, Json types
│   ├── user.ts               # 👤 User, UserSession, UserStreak, BadgeLevel...
│   ├── subscription.ts       # 💳 Subscription, Payment
│   ├── mocktest.ts          # 📝 MockTest, MockTestSection, UserTestAnswer...
│   ├── vocab.ts             # 📚 Vocabulary, Notebook, WordType...
│   ├── content.ts           # 📖 Tip, AILesson, TranslationHistory
│   ├── community.ts         # 💬 Post, Comment, Report, ModerationLog...
│   └── system.ts            # ⚙️ AdminLog, Notification, Media
```

## 🎯 Cách sử dụng

### Option 1: Import từ entities chính (Recommended - Backward Compatible)
```typescript
// ✅ Existing code không cần thay đổi gì
import type { User, Post, Vocabulary } from '../types/entities';
```

### Option 2: Import trực tiếp từ module domain (New Way)
```typescript
// ✅ Import chỉ entities cần thiết từ domain cụ thể
import type { User, UserSession } from '../types/entities/user';
import type { Post, Comment } from '../types/entities/community';
import type { Vocabulary, Notebook } from '../types/entities/vocab';
```

### Option 3: Mixed imports (Flexible)
```typescript
// ✅ Kết hợp cả 2 cách
import type { UUID, Timestamp } from '../types/entities/base';
import type { User } from '../types/entities/user';
import type { Post, Comment } from '../types/entities/community';
```

## 📦 Chi tiết các domain modules

### 🔧 **base.ts** - Utility Types
```typescript
UUID, Timestamp, Json
```
*Dùng chung cho tất cả domains*

### 👤 **user.ts** - User Domain  
```typescript
User, UserSession, UserDailyActivity, UserStreak, 
UserUsage, RefreshToken, BadgeLevel
```
*Quản lý người dùng, sessions, hoạt động*

### 💳 **subscription.ts** - Payment Domain
```typescript
Subscription, Payment
```
*Gói đăng ký và thanh toán*

### 📝 **mocktest.ts** - Testing Domain
```typescript
MockTest, MockTestSection, MockTestQuestion, 
UserTestScore, UserTestAttempt, UserTestAnswer
```
*Đề thi thử và kết quả*

### 📚 **vocab.ts** - Vocabulary Domain
```typescript
Vocabulary, WordType, VocabularyWordType, 
Notebook, NotebookVocabItem
```
*Từ vựng và sổ tay học tập*

### 📖 **content.ts** - Learning Content Domain
```typescript
Tip, AILesson, TranslationHistory
```
*Nội dung học tập và AI*

### 💬 **community.ts** - Social Domain
```typescript
Post, Comment, PostLike, PostView, PostMediaMap, 
ModerationLog, Report
```
*Cộng đồng và tương tác xã hội*

### ⚙️ **system.ts** - System Domain
```typescript
AdminLog, Notification, Media
```
*Hệ thống, logs và thông báo*

## ✅ Lợi ích

### 🎯 **Maintainability**
- Dễ tìm và sửa types theo chức năng
- Giảm conflict khi nhiều dev làm chung
- Code organization rõ ràng hơn

### 🚀 **Performance** 
- Import chỉ types cần thiết
- Giảm bundle size (tree-shaking friendly)
- Faster TypeScript compilation

### 🔄 **Scalability**
- Thêm domain mới không ảnh hưởng code cũ
- Dễ refactor từng module riêng biệt
- Chuẩn hóa theo Domain-Driven Design

### 🛡️ **Backward Compatibility**
- ✅ **100% tương thích** với code existing
- ✅ Không cần thay đổi imports hiện tại
- ✅ Gradual migration strategy

## 🔧 Migration Strategy (Optional)

### Phase 1: Keep existing imports (DONE ✅)
```typescript
// Existing code vẫn hoạt động bình thường
import type { User, Post } from '../types/entities';
```

### Phase 2: Gradually migrate to domain imports (Optional)
```typescript
// Migrate dần dần khi update components
import type { User } from '../types/entities/user';
import type { Post } from '../types/entities/community';
```

### Phase 3: Use mixed strategy (Recommended)
```typescript
// Import base types riêng, domain types riêng
import type { UUID } from '../types/entities/base';
import type { User } from '../types/entities/user';
```

## 🧪 Validation

- ✅ All existing imports still work
- ✅ TypeScript compilation successful  
- ✅ No breaking changes
- ✅ Bundle size optimized
- ✅ IDE auto-completion improved

## 📝 Next Steps

1. **Keep using existing imports** - No action needed
2. **Optional**: Migrate to domain imports when updating components
3. **Optional**: Use domain-specific imports for new features
4. **Recommended**: Use base types import for UUID, Timestamp

---

**🎉 Kết luận**: Cấu trúc mới giữ 100% backward compatibility while cung cấp better organization và performance benefits!