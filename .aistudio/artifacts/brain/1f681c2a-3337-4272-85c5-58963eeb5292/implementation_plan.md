# Enterprise Security Hardening & Multi-Tenant Architecture Plan

A comprehensive security lockdown and performance optimization for the Algerian Laboratory Education platform (`lab-education-dz`), establishing zero-trust Firestore rules, server-enforced custom claims, protected AI inference gateways, unified school-tenant database scoping, strict HTML rendering sanitization, and lightweight school directory search.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 interactive clarification:
> - **API Authentication & Rate Limiting**: All calls to `/api/gemini` and `/api/db` will require a verified Firebase ID token passed in the `Authorization: Bearer <token>` header, enforced by an Express authentication middleware with per-user burst and minute-level quotas.
> - **Canonical Tenant Isolation**: Database access across both Firestore collections and backend PostgreSQL SQL routes is strictly scoped by the verified **Canonical School ID** (derived from the user's verified school profile membership), eliminating reliance on arbitrary client-supplied payload parameters.
> - **School Directory Optimization**: The 4.5 MB, 132,000-line monolithic `schools.ts` dataset will be migrated to a dedicated server-side search and filtering API endpoint (`/api/schools`) with client-side Wilaya indexing and localStorage caching, slashing bundle size by over 4 MB.

---

## 1. Overview & Core Concept

- **What It Does**: Hardens every data layer across the application—from database rules and backend proxy routes to client-side document printing and offline caching—ensuring complete tenant isolation, role immutability, denial-of-wallet protection, and zero cross-account data leakage.
- **Target Audience / Persona**: Laboratory supervisors (ملحق بالمخابر), school directors (مدير المؤسسة), studies censors (الناظر), financial economists (مقتصد), and laboratory inspectors across Algerian secondary and middle schools.
- **Key Value**: Guarantees legal compliance with Algerian institutional data privacy guidelines, protects system AI quotas against unauthorized scraping, prevents privilege escalation attacks, and delivers high-performance page loads by removing multi-megabyte payloads.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Authentication & Role Resolution*: When a user signs in with Google, the client sends their Firebase ID token to the server. The server verifies tokens, checks or sets custom claims, resolves their canonical school ID, and issues scoped access without trusting client-side claims.
  2. *School & Lab Data Management*: Requests to chemicals, equipment, schedules, and reports automatically bind to the user's verified school tenant ID. Any attempt to update records belonging to another school or modify tenant fields is rejected with `403 Forbidden`.
  3. *AI Assistance & Intelligence*: Chemist assistant queries pass the user's auth token to `/api/gemini`. The endpoint enforces per-user quotas (e.g., 20 requests/minute), validates inputs (max character size, schema sanity), and filters for authorized model aliases.
  4. *Safe Document Printing & Export*: Administrative documents, activity sheets, and daily reports pass through a strict DOMPurify sanitization pipeline before being displayed in `PrintPreviewModal` or passed to print frames, preventing script injection or event handler tampering.
  5. *School Directory Search*: In Settings and profile registration, selecting a Wilaya dynamically fetches lightweight commune lists from `/api/schools`, with smooth instant autocomplete.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Institutional enterprise dashboard following Algerian educational administrative styling (emerald `--primary` accent, clean white canvas, slate structural dividers, and zero visual clutter).
  - *Color Palette*:
    - Canvas background: `#FFFFFF` (light) / `#0B0F19` (dark)
    - Structural cards & tables: `#F8FAFC` / `#1E293B` with hairline borders (`1px solid rgba(226, 232, 240, 0.8)`)
    - Primary institutional accent: `#047857` (Algerian Emerald) / `#059669`
    - Muted secondary: `#64748B` / `#94A3B8`
  - *Typography & Hierarchy*:
    - Display & Titles: `Plus Jakarta Sans` paired with `Amiri` / `Cairo` for authentic Arabic administrative typography.
    - Tabular Figures: `tabular-nums font-mono` for all inventory counts, chemical concentrations, and timestamps.
  - *Component Styling*: Flat single-elevation surfaces, 12px–16px inner container padding, unboxed metadata text separated by middle dots (`·`), and high-contrast WCAG AA accessible interactive buttons.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Zero-Trust Firestore Rules & Server-Set Admin Claims
- **Chosen Approach**:
  - Completely rewrite `firestore.rules` to enforce strict ownership, school-membership verification, and server-managed admin credentials.
  - Profile documents (`users/{userId}`) can only be read by the owner user or verified admins; blanket `allow read: if isSignedIn()` is removed.
  - Settings documents (`settings/{id}`) require authentication and school ownership; public read access is revoked.
  - School data subcollections (`schools/{schoolId}/**`) strictly require that the authenticated user belongs to `schoolId` (verified via `users/$(request.auth.uid).data.schoolId == schoolId`).
  - In `src/firebase.ts`, remove insecure substring checks like `email.includes('admin')` and client-writable Firestore fields. Administrative authority is restricted strictly to `request.auth.token.admin == true` or the root admin document `/admins/$(request.auth.uid)`.
- **Trade-Off**: Users can no longer arbitrarily grant themselves admin rights by editing their profile document in DevTools. Admin assignment must be performed via server API or trusted admin document.

### Decision 2: Single Canonical Tenant ID for SQL & Firestore
- **Chosen Approach**:
  - In `src/routes/dbRoutes.ts`, replace `const schoolId = req.user?.uid;` with the user's verified canonical school ID obtained from their authenticated profile.
  - Whitelist writable fields on all table updates (`chemicals`, `equipment`, `teachers`, `labSessions`, etc.) using an explicit field allowlist, preventing clients from injecting or overriding `schoolId` or `id`.
  - Cap bulk operations with explicit payload array limits (max 100 items per bulk insert) to prevent payload denial-of-service.
- **Trade-Off**: Removes client flexibility to send arbitrary fields, but completely closes relational update-gaps and cross-tenant pollution.

### Decision 3: Protected Gemini AI Inference Gateway
- **Chosen Approach**:
  - Secure `/api/gemini` in `server.ts` with Firebase ID token authentication (`req.headers.authorization`).
  - Add per-user token-bucket rate limiting (20 requests / user / minute) in addition to the IP limiter.
  - Enforce strict request validation: max payload size (15,000 characters), model allowlisting (`gemini-3.8-flash`, `gemini-3.1-flash-lite`), and sanitize user input before prompt construction.
  - Ensure Firebase Cloud Function in `functions/src/index.ts` also enforces `request.auth` check and input validation.
  - Update `firebase.json` rewrites so that `/api/**` endpoints properly route to the backend express server instead of falling back to `index.html`.
- **Trade-Off**: Requires clients to include authorization tokens on Gemini requests, preventing anonymous API abuse and quota exhaustion.

### Decision 4: Client-Side HTML Sanitization in Print & Document Engines
- **Chosen Approach**:
  - Install and configure `DOMPurify` (or an equivalent zero-dependency HTML sanitizer) for `PrintPreviewModal.tsx`, `printService.ts`, and `pdfService.ts`.
  - Strip all `<script>`, `<iframe>`, `object`, and inline event attributes (`onload`, `onerror`, `onclick`) before rendering custom HTML via `dangerouslySetInnerHTML` or writing to print windows.
- **Trade-Off**: Eliminates XSS vectors from saved or imported template documents with negligible (<5ms) rendering overhead.

### Decision 5: Account-Isolated Offline Caching
- **Chosen Approach**:
  - In `src/hooks/useSqlCollection.ts`, namespace all `localStorage` cache keys by the active user's UID and school ID (e.g., `offline_cache_${schoolId}_${userId}_${key}`).
  - Add an automatic cache purge on user sign-out to guarantee that subsequent users on a shared school computer cannot inspect previous session data.
- **Trade-Off**: Requires re-populating cache on fresh account sign-ins, but guarantees strict cross-account confidentiality on shared computers.

### Decision 6: Lightweight School Directory Architecture
- **Chosen Approach**:
  - Move the 4.5 MB `schools.ts` dataset to server-side asset storage, served through a dedicated `/api/schools` route with pagination and Wilaya filtering.
  - Replace the bloated 132,000-line client import with an asynchronous lookup service with client-side Wilaya caching.
  - Bundle size drops by over 4 MB, improving initial page load time significantly.

### Decision 7: Route Security and Permissions Tightening
- **Chosen Approach**:
  - In `src/config/permissions.ts`, replace `cleanPath.startsWith(r)` with exact path or segment boundary matching: `cleanPath === r || cleanPath.startsWith(r + '/')`.
  - Remove the duplicate declaration of `ROUTES.ADMIN` in `src/App.tsx`.
  - Create a checked-in `storage.rules` file enforcing school-level read/write permissions for lab attachments and document uploads, and wire it into `firebase.json`.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Browser (SPA)                          │
│                                                                        │
│   ┌────────────────────────┐      ┌────────────────────────────────┐   │
│   │   Authentication &     │      │   Print Preview & Documents    │   │
│   │   Permissions Engine   │      │   • DOMPurify Sanitizer        │   │
│   │   • Exact Route Guard  │      │   • Safe Print Frames          │   │
│   │   • Verified Claims    │      │   • Live A4 Simulator          │   │
│   └───────────┬────────────┘      └────────────────────────────────┘   │
│               │ Auth Bearer Token                                      │
│               ▼                                                        │
│   ┌────────────────────────┐      ┌────────────────────────────────┐   │
│   │   React Query Hooks    │      │   Isolated Cache Layer         │   │
│   │   • useSqlCollection   │─────▶│   Key: cache_${schoolId}_      │   │
│   │   • schoolsApi Service │      │        ${userId}_${col}        │   │
│   └───────────┬────────────┘      └────────────────────────────────┘   │
└───────────────┼────────────────────────────────────────────────────────┘
                │ Authorization: Bearer <ID_TOKEN>
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Backend Server                          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   verifyFirebaseToken Middleware                               │   │
│   │   • Validates Google/Firebase Token Integrity                  │   │
│   │   • Resolves Canonical School ID from verified user profile    │   │
│   │   • Attaches req.user = { uid, email, schoolId, isAdmin }      │   │
│   └───────────────────────┬────────────────────────────────────────┘   │
│                           │                                            │
│        ┌──────────────────┼───────────────────┐                        │
│        ▼                  ▼                   ▼                        │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐              │
│  │  /api/gemini  │  │  /api/db/*    │  │  /api/schools  │              │
│  │  • Rate Limit │  │  • Scoped by  │  │  • Fast search │              │
│  │  • Max Input  │  │    schoolId   │  │  • Wilaya API  │              │
│  │  • Allowlist  │  │  • Field White│  │  • <100KB wire │              │
│  │  • GenAI SDK  │  │    list       │  │    payload     │              │
│  └───────┬───────┘  └───────┬───────┘  └────────────────┘              │
└──────────┼──────────────────┼──────────────────────────────────────────┘
           │                  │
           ▼                  ▼
┌────────────────────┐ ┌─────────────────────────────────────────────────┐
│ Gemini 3.8 Flash   │ │ Cloud SQL / Postgres & Firestore               │
│ Managed AI Gateway │ │ • firestore.rules: Zero-Trust ABAC              │
│                    │ │ • storage.rules: School-scoped uploads          │
│                    │ │ • Drizzle ORM: Parameterized safe updates       │
└────────────────────┘ └─────────────────────────────────────────────────┘
```

---

## 5. Implementation Steps & Verification Sequence

1. **Step 1: Security Rules Lockdown**
   - Create `storage.rules` with school-scoped access policies.
   - Overhaul `firestore.rules` to enforce strict ownership, verify school membership on `/schools/{schoolId}/**`, restrict `/users/{userId}` PII reads to owner/admin, protect `/settings/{id}`, and require server-set admin claims.
   - Update `firebase.json` with storage rules and hosting API rewrites.
2. **Step 2: Admin Authority & Auth Hardening**
   - Refactor `src/firebase.ts`: eliminate naive email substring matching and client-writeable role checks; enforce server claims (`idTokenResult.claims.admin`) and `/admins/{uid}` document verification.
   - Tighten `src/config/permissions.ts` route matching with boundary guards.
   - Remove duplicate admin route from `src/App.tsx`.
3. **Step 3: Secure Express API & Database Scoping**
   - Implement verified token middleware for Express.
   - Protect `/api/gemini` with token authentication, per-user rate limiting (20 req/min), model allowlisting, and input length limits.
   - Synchronize `functions/src/index.ts` with uncompromised auth checks.
   - Refactor `src/routes/dbRoutes.ts`: enforce canonical school ID on all queries, apply field allowlists on updates, and cap bulk insert payloads.
4. **Step 4: HTML Sanitization & Client Cache Isolation**
   - Sanitize all custom HTML in `src/components/PrintPreviewModal.tsx` and printing services using DOMPurify.
   - Update `src/hooks/useSqlCollection.ts` to scope offline cache keys by `schoolId` and `uid`, adding session clearance on logout.
5. **Step 5: School Directory Optimization**
   - Convert `src/data/schools.ts` into a lightweight async service backed by a server endpoint or compressed chunks, reducing main bundle weight by 4.5 MB.
6. **Step 6: Build & Verification**
   - Run `lint_applet` and `compile_applet` to guarantee complete build integrity and zero runtime regressions.
