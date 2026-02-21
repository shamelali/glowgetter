# GlowGetter.my - Replit Agent Guide

## Overview

GlowGetter.my is a Malaysian makeup artist and beauty studio directory/booking platform. Users can browse, search, and book professional makeup artists and luxury beauty studios. The platform supports three user roles: **Client** (book services), **Artist** (manage profile, services, portfolio, and bookings), and **Studio** (similar to Artist but for studio businesses).

Core features:
- Artist and studio discovery with search/filter by location, specialty, etc.
- Artist/studio profile pages with services, portfolio galleries, and booking
- Client booking management
- Artist/studio dashboard for managing profiles, services, and incoming bookings
- SEO-friendly slug-based URLs for artist and studio profiles

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (rose/gold/cream elegant palette)
- **Typography**: Playfair Display (display/headings) + DM Sans (body text)
- **Build Tool**: Vite
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

The frontend lives in `client/` with entry point at `client/src/main.tsx`. Pages are in `client/src/pages/`, custom hooks in `client/src/hooks/`, and UI components in `client/src/components/ui/`.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (executed via tsx in dev, esbuild-bundled for production)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Route Definitions**: Shared route contracts in `shared/routes.ts` using Zod schemas for type-safe API definitions
- **Server Entry**: `server/index.ts` creates HTTP server, registers routes, and serves static files in production or sets up Vite dev server in development

The server uses a storage layer pattern (`server/storage.ts`) with a `DatabaseStorage` class implementing an `IStorage` interface, making the data layer swappable.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` (main tables) and `shared/models/auth.ts` (auth tables)
- **Migrations**: Drizzle Kit with `drizzle-kit push` for schema sync
- **Connection**: `pg` Pool via `DATABASE_URL` environment variable

Key tables: `users`, `sessions`, `artists`, `studios`, `services`, `portfolios`, `bookings`

Relationships:
- Artists and Studios belong to Users (via `userId`)
- Services and Portfolios can belong to either an Artist or a Studio
- Bookings reference a client (user), an artist or studio, and a service

### Authentication & Authorization
- **Method**: Replit OpenID Connect (OIDC) Auth via Passport.js
- **Session Storage**: PostgreSQL-backed sessions using `connect-pg-simple`
- **Session Table**: `sessions` table (mandatory, do not drop)
- **Auth Files**: Located in `server/replit_integrations/auth/`
- **Key Endpoints**: `/api/auth/user` (get current user), `/api/login`, `/api/logout`
- **Middleware**: `isAuthenticated` middleware guards protected routes

### Build & Deployment
- Dev: `tsx server/index.ts` with Vite dev server middleware (HMR enabled)
- Build: Custom build script (`script/build.ts`) that runs Vite for client and esbuild for server
- Production: Server serves static files from `dist/public/`, runs as `node dist/index.cjs`
- SPA fallback: All unmatched routes serve `index.html` for client-side routing

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `shared/schema.ts` - Database table definitions and Zod insert schemas
- `shared/routes.ts` - API route contracts with paths, methods, and response schemas
- `shared/models/auth.ts` - User and session table definitions

## External Dependencies

### Database
- **PostgreSQL** - Primary database, connected via `DATABASE_URL` environment variable
- Must be provisioned before the app can start

### Authentication
- **Replit OIDC** - OpenID Connect provider for authentication
- Requires `ISSUER_URL` (defaults to `https://replit.com/oidc`), `REPL_ID`, and `SESSION_SECRET` environment variables

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` - ORM and migration tooling
- `express` + `express-session` - HTTP server and session management
- `passport` + `openid-client` - Authentication
- `connect-pg-simple` - PostgreSQL session store
- `@tanstack/react-query` - Client-side data fetching
- `wouter` - Client-side routing
- `zod` + `drizzle-zod` - Schema validation
- `react-day-picker` - Calendar component for booking
- `framer-motion` - Animations
- `date-fns` - Date utilities
- `embla-carousel-react` - Carousel component
- `recharts` - Charts (for dashboard)
- `vaul` - Drawer component

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` - Runtime error overlay
- `@replit/vite-plugin-cartographer` - Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` - Dev banner (dev only)