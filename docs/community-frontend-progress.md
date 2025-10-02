# Tiến độ triển khai Frontend — "Nội dung Cộng đồng" (Admin)

Cập nhật: 2025-10-02

Mục tiêu: implement Admin Community management UI (feed, moderation, post create/edit modal, user profile, filters) — theo đặc tả trong `docs/Admin _Community_Content.markdown`.

Tóm tắt trạng thái hiện tại (delta so với spec)

- Core layout
  - [x] Main feed column implemented as a scrollable center column (infinite scroll).
  - [x] Right column is a fixed-width admin tool panel (filters, topic list) and can switch to a full-right user profile panel.
  - [x] Left app sidebar remains fixed via `MainLayout`.

- Data layer / Mock API
  - [x] `src/features/community/communityApi.ts` provides mock store `mockPosts`, `mockComments` and pagination via `fetchPosts({page,limit})`.
  - [x] Added `fetchUserPostsAll(userId)` to support user profile (includes deleted / soft-deleted entries).
  - [x] Moderation endpoints exist in mock: `removePost`, `restorePost`, `hardDeletePost` which push simple admin logs to `mockAdminLogs`.

- Hooks / State management
  - [x] `src/features/community/hooks/useCommunity.ts` exposes create/update/remove/restore/hardDelete and comment methods and integrates with mock API. Pagination is handled at page level (page+limit).

- PostCard
  - [x] `src/features/community/components/PostCard.tsx` updated to match requested structure:
    - Avatar + Name + Topic — Relative time on same header row.
    - Title shown below header (bigger).
    - Content (rich HTML) rendered below title.
    - Images grid below content.
    - Footer with 3 evenly spaced counters: Likes (left), Comments (center), Views (right).
    - Removed Share action and removed "Xem trang người đăng" from dropdown.
    - Clicking avatar/name triggers opening the user profile panel in the right column.

- Create / Edit Post Modal
  - [x] `src/features/community/components/CreateEditPostModal.tsx` upgraded to a full-size modal with:
    - Title field
    - Lightweight rich-text editor (contentEditable) with toolbar (bold/italic/underline/link/ordered/unordered lists)
    - FrameType controls: Single / Two-column / Gallery
    - Image upload with preview, reorder, and client-side validation (max 3, jpg/png/webp, max 5MB each). No video allowed.
    - Visibility select (public feed)
    - Buttons: Hủy / Đăng (Cập nhật khi edit)
  - [ ] Note: cropping (aspect-lock) is indicated in UI as a note; no real cropper implemented (can be added).

- User profile & moderation UI
  - [x] `src/features/community/components/UserProfilePanel.tsx` created — full-right panel that fetches user and all their posts (including deleted) and displays them.
  - [x] Admin actions (remove/restore/hardDelete) wired to the mock API and the feed refreshes after actions.
  - [x] `RemoveConfirmModal` is used for soft-delete with optional reason; logic enforced to require reason when actor != author.

- Page wiring
  - [x] `src/pages/AdminCommunityPage.tsx` rebuilt to use paginated `fetchPosts`, infinite scroll sentinel, compact composer input that opens the create modal, and right sidebar filters.
  - [x] Posts are enriched with user display names by fetching `fetchUserById` for each batch.
  - [x] Topic filter + search UI present and wired to reload the feed (client-side params forwarded to fetchPosts). Filtering server-side support is mocked.

- Tests / Quality gates
  - [x] Files edited compiled locally in this session (file-level error checks) — no outstanding TypeScript errors reported for edited files.
  - [ ] Integration test: not implemented. Manual smoke is recommended by running the dev server.

Open tasks / Recommended next steps

1. Filter & search behavior
   - [ ] Implement server-side or client-side search for content (currently `fetchPosts` accepts params but server-side filtering is mock; it is being passed search/topic from the page). Ensure filter debounce and consistent paging.

2. Rich editor improvements
   - [ ] Replace lightweight contentEditable with a stable rich editor (Quill / TipTap) for robust formatting, delta/html serialization, and toolbar features such as color/background.
   - [ ] Integrate a real image cropper (aspect-ratio locking) in the upload flow.

3. Real-time sync & notifications
   - [ ] Add mock WebSocket/SSE events to broadcast post create/update/remove/restore actions (use `mockAdminLogs` to simulate events for dev). Connect UI to listen and update feed.

4. Admin logs & audit viewer
   - [ ] Add an Admin Logs viewer to review entries from `mockAdminLogs` (UI + simple pagination).

5. Tests & CI
   - [ ] Add unit tests / integration tests for major components and mock API behaviors.

6. UX polish
   - [ ] Add empty states, error states, and success toasts. Improve accessibility and keyboard handling in the rich editor.

Files changed in this implementation (high level)

- src/features/community/communityApi.ts — mock API, pagination, fetchUserPostsAll
- src/features/community/hooks/useCommunity.ts — hook wrapper over mock API
- src/features/community/components/PostCard.tsx — Post card UI and action menu adjustments
- src/features/community/components/CreateEditPostModal.tsx — full creator/editor modal with rich editor and image handling
- src/features/community/components/UserProfilePanel.tsx — new
- src/pages/AdminCommunityPage.tsx — main feed page wiring (infinite scroll, composer, right panel, filters)

How I verified

- Read relevant source files and validated TypeScript errors for edited files in the session.
- Ensured the component structure maps to the spec items requested.

If you'd like I can:
- Add a small status badge at the top of `docs/Admin _Community_Content.markdown` linking to this progress file.
- Implement one of the Open tasks above (pick one).


---
Generated by frontend update tool on 2025-10-02
