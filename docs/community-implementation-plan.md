# Community (Admin) Implementation Plan

This document tracks the phased implementation of the Admin "Community Content" feature. We'll mark phases as "Not started", "In progress", or "Done" and keep notes for each.

Date created: 2025-10-02

## Phase status

- Phase 0 — Scaffolding & API prep: In progress
  - Create feature folder and minimal API hooks
  - Add route `/admin/community` and a scaffold page
  - Prepare mock API functions and expected real API endpoints
  - Files added: `src/features/community/communityApi.ts` (mock), `src/features/community/hooks/useCommunity.ts`, `src/pages/AdminCommunityPage.tsx`

- Phase 1 — MVP feed + create/edit + basic moderation: Done
- Phase 2 — Permissions & User profile modal & reports: In progress
- Phase 3 — Real-time sync & polishing: Not started
- Phase 4 — Hard-delete, audit logs, retention policy: Not started

---

## Phase 0 — Details (started)

Goal: scaffold the feature, add routes, prepare mock APIs and a simple Admin page to list posts. This prepares the frontend to connect to real backend later.

Tasks completed in Phase 0:
- Add docs tracking file (this file).
- Create mock API file `src/features/community/communityApi.ts` with functions:
  - `fetchPosts(params)` -> GET `/admin/posts`
  - `fetchPostById(id)` -> GET `/admin/posts/:id`
  - `createPost(payload)` -> POST `/admin/posts`
  - `updatePost(id, payload)` -> PUT `/admin/posts/:id`
  - `removePost(id, { reason?, self? })` -> POST `/admin/posts/:id/remove`
  - `restorePost(id)` -> POST `/admin/posts/:id/restore`
  - `hardDeletePost(id, { reason? })` -> DELETE `/admin/posts/:id`
  - Mocks return realistic shapes including `removed_kind`.

- Create a simple hook `src/features/community/hooks/useCommunity.ts` to wrap API calls and state.
- Create `src/pages/AdminCommunityPage.tsx` route and wire to `App.tsx`.

Notes:
- All mock functions respect `USE_MOCK_API` env variable and fall back to `apiClient` real endpoints (prepare real API paths accordingly).

---

## Phase 1 — Details (completed)

Goal: Implement an MVP admin feed with create/edit post, basic moderation actions (soft remove, restore, hard delete), and comment viewing.

Tasks completed in Phase 1:
- Implement `PostCard` UI and moderation actions. (See `src/features/community/components/PostCard.tsx`)
- Implement a lightweight `CommentItem` component for comment rendering. (See `src/features/community/components/CommentItem.tsx`)
- Create `CreateEditPostModal` for creating/editing posts using a simple textarea and converting to minimal ops structure.
- Add `RemoveConfirmModal` to collect optional removal reason and confirm soft/hard deletes.
- Extend `useCommunity` hook to expose comment operations (`fetchComments`, `addComment`, `removeComment`, `hardDeleteComment`).
- Extend mock `communityApi` with comment endpoints and moderation behaviors.
- Wire the admin page `src/pages/AdminCommunityPage.tsx` to the hook and components; added buttons to load comments per post and to open modals.
- Fix navigation: update `MainLayout` to point the 'Nội dung Cộng đồng' nav item to `/admin/community`.

Files created/updated in Phase 1:
- `src/features/community/components/PostCard.tsx`
- `src/features/community/components/CommentItem.tsx`
- `src/features/community/components/CreateEditPostModal.tsx`
- `src/features/community/components/RemoveConfirmModal.tsx`
- `src/features/community/hooks/useCommunity.ts`
- `src/features/community/communityApi.ts`
- `src/pages/AdminCommunityPage.tsx`
- `src/components/layout/MainLayout.tsx` (nav path fix)

Notes and verification:
- During development, an import resolution issue was encountered for `CommentItem` used in `PostCard`. To unblock the build quickly, comment rendering was inlined in `PostCard`. `CommentItem.tsx` remains available for reuse; consider reintroducing it when resolving any tooling/case-sensitivity issues.
- Basic flows are mock-backed and respect the `USE_MOCK_API` flag.

Next steps (low-effort polish for Phase 1):
- Reuse `CommentItem` in `PostCard` (replace inlined markup) once import path/case is validated.
- Add client-side role checks to hide/disable destructive actions for non-admins.
- Add small unit tests for `useCommunity` hook (happy path + failure modes).

---

## Phase 2 — Details (in progress)

Goal: Polish the admin feed UI to resemble a social media post feed (Instagram/Facebook style) and implement permission-driven action menus, user profile modal, and reporting flows.

Work started:
- Replace inline action buttons with a three-dot vertical menu per post. Menu options vary by role (owner, admin, super admin) and by post state (deleted vs active). Implemented in `src/features/community/components/PostCard.tsx` via `ActionMenu`.
- Presentational action bar (Like / Comment / Share) added to `PostCard` for feed feel.

Next tasks for Phase 2:
1. Permission enforcement: refine `ActionMenu` to show/hide actions exactly per spec (owner vs admin vs super admin), and ensure backend calls validate permissions as well.
2. User profile modal: implement a lightweight `UserCommunityModal` to view poster's profile and recent posts. (UI + hook to fetch user posts)
3. Reporting flow: add 'Báo cáo' option in the menu to open a report modal collecting reason and category, wired to mock `communityApi.reportPost`.
4. Polishing: adjust spacing, avatar images, and typography to match social feed layout and improve readability on mobile.

I will continue by implementing task 1 (finalize permission checks in menu) and start task 2 (skeleton for `UserCommunityModal`).

## How to mark a phase done
- Update this file and change the phase status to "Done" and list files changed.

---

End of plan.
