---
name: StudyLock auth architecture
description: Google OAuth login flow, profile setup, and data persistence approach for the StudyLock Expo app.
---

# Auth architecture

- `expo-auth-session/providers/google` handles OAuth in Expo Go via browser redirect.
- `Google.useAuthRequest` throws invariant if `clientId` is undefined — must pass a non-empty fallback string (e.g. `"not-configured"`) and gate `promptAsync()` on `IS_CONFIGURED`.
- Env var: `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (web OAuth client ID from Google Cloud Console).
- After OAuth, fetch Google profile from `https://www.googleapis.com/userinfo/v2/me`.

# Profile setup flow
1. `/login` — Google Sign-In button
2. `/profile-setup` — 3-4 step wizard: name → exam category → specific exam → class/board (optional)
3. `/(tabs)` — main app

# Data storage
- `AppUser` stored in AsyncStorage under key `studylock_user`.
- Backend sync attempted to `/api/users/upsert` (POST) on login and `/api/users/:googleId/profile` (PATCH) on profile save.
- Backend gracefully skipped when `DATABASE_URL` is not set.
- Sessions, todos, allowed apps use separate AsyncStorage keys.

# Context
- `StudyProvider` exposes `user`, `isAuthLoading`, `loginWithGoogle`, `updateUserProfile`, `logout`.
- Legacy `studentName` and `nameLoaded` props derived from `user?.firstName` and `!isAuthLoading`.

**Why:** Routing in `_layout.tsx` depends on `isAuthLoading` + `user.setupComplete` to redirect between login/profile-setup/tabs.
