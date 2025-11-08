# Blogify — Next.js Blog Platform

An opinionated blog platform built with the Next.js App Router, TypeScript and Tailwind CSS. It includes a simple content editor, live post preview, category management, client-side toasts, and a small set of admin flows (create/drafts/edit). This README explains how to run the project, what it uses, and important design decisions.

## ⚙️ 1) Setup — Run Locally

### 🧩 Prerequisites
Before you begin, make sure you have the following installed:
- **Node.js 18+** (LTS recommended)
- **npm**, **pnpm**, or **yarn**
- **Git**
- **PostgreSQL** (or **Neon**, a hosted Postgres-compatible service)

---

### 📦 Install Dependencies

Clone the repository and install dependencies:

```bash
# from repository root
npm install
# or
yarn install
# or
pnpm install

#Database Setup
npm run db:push

#Start Development Server
npm run dev
# or
yarn dev
# or
pnpm dev



## 2) Tech stack

- Next.js (App Router) — server- and client-side rendering, routing, and bundling.
- ShadCN UI + TypeScript — type safety.
- Tailwind CSS — utility-first styling.
- framer-motion — small UI animations for cards and motion effects.
- lucide-react — icons.
- tRPC — typed client/server RPC calls.
- Drizzle ORM (Postgres) — server-side database queries and schema.
- React Query (@tanstack/react-query) — client-side caching for server data.
- next-themes — theme toggling (light/dark).
- next/image — optimized image component and remotePatterns configured for Cloudinary.
- ToastProvider (custom) — app-wide toasts for non-blocking user feedback.
- Neon DB - DATABASE

Dev / build tools
- TypeScript, ESLint (project linting), Prettier (formatting), Vercel/Next.js for deployment.

3rd-party services (optional)
- Cloudinary — image hosting/transformations (configured via remote pattern).

## 3) Features implemented (checklist)

## 3) Features implemented (checklist)

Priority 1 — Core app flows
- [x] Blog post CRUD operations (create, read, update, delete)
- [x] Category CRUD operations
- [x] Assign one or more categories to posts
- [x] Individual post view page
- [x] Category filtering on listing page
- [x] Basic responsive navigation
- [x] Clean, professional UI (

Priority 2 — Expected Features
- [x] Landing page with at least 3 sections (Header/Hero, Feature,Footer0
- [x] Dashboard page for managing posts
- [x] Draft vs Published post status
- [x] Loading and error states
- [x] Mobile-responsive design
- [x] Content editor (choose ONE: rich text editor OR markdown support - markdown is faster)

Priority 3 — Bonus Features
- [x] Full 5-section landing page (Header, Hero, Features, CTA, Footer)
- [x] Search functionality for posts
- [x] Post statistics (word count, reading time)
- [x] Dark mode support
- [x] Advanced rich text editor features
- [x] Image upload for posts
- [x] Post preview functionality


## 4) Trade-offs and decisions

- Providers split (SSR head + client providers): Initially providers (React Query, trpc client, theme, toasts) were inside `app/layout.tsx`. To ensure the viewport meta and other head metadata are present server-side, `app/layout.tsx` is now a server component and providers are moved into `src/components/Providers.tsx` which is a `"use client"` wrapper. This ensures correct SSR head output (fixes mobile viewport issues) but adds an extra client boundary. Trade-off: a small increase in client bundle for providers vs correct metadata on first paint.
- Lightweight content editor (contentEditable): I chose a minimal editor to avoid shipping a heavy rich-text dependency (e.g., Slate/TipTap/Quill). This keeps the bundle small and speeds up iteration. Trade-off: less built-in formatting and fewer structured editing features. A future improvement is to add an optional rich editor behind a feature flag.
- Toasts over blocking alerts: For better UX we replaced synchronous alert() with toasts for non-blocking error/success messages. This improves perceived performance and reduces modal interruptions.
- Tailwind utility classes: Fast to implement and highly responsive. The project uses canonical class names (e.g. `min-h-40`) instead of arbitrary pixel values to keep consistency and enable JIT optimization.
- No SSR-heavy data fetching on homepage: most data is fetched client-side with React Query for a snappier local dev experience and easier cache invalidation via tRPC. If SEO-heavy pages are needed, we can move specific routes to server components with prefetching.

## 5) Estimated time spent (high-level)
- Project scaffold & initial pages: ~2–4 hours
- Create/Drafts flows + editor + preview: ~6–9 hours
- Responsive polish, navbar, and mobile fixes: ~2–4 hours
- Toasts, confirm dialog, and UX replacements: ~1–2 hours
- Bug-fix & refactor (Providers + layout SSR): ~1–2 hours

These are approximate and depend on testing/iterations.

## 6) Project structure / environment

Top-level layout (key folders):

- `src/app/` — Next.js App Router pages and layouts.
	- `layout.tsx` — root layout; now a server component that includes `<head>` metadata.
	- `page.tsx` — app root page.
	- `blog/` — blog routes (listing `page.tsx`, create `page.tsx`, post `[id]/page.tsx`).
	- `drafts/` — draft pages.

- `src/components/` — shared presentational components
	- `Navbar.tsx`, `BlogCard.tsx`, `RecentPostCard.tsx`, `ToastProvider.tsx`, `Providers.tsx` (client-only wrapper for providers).

- `src/server/` — server-only code (e.g., database schema, server utils)
	- `db/` — Drizzle schema and DB connection helpers.

- `src/utils/` — client & server utilities (e.g., `trpc` client setup).

- `public/` — static assets (icons, images).


