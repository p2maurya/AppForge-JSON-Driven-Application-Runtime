# AppForge
live link :https://appforge-json-driven-application-runtime.onrender.com
A metadata-driven application runtime that converts JSON configuration into working applications.

## Features

- JSON config → rendered frontend (forms, tables, dashboards)
- Dynamic CRUD API per app
- Config validation with graceful error handling
- CSV import
- GitHub export
- User authentication

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- PostgreSQL + Prisma ORM
- Custom session auth with bcrypt

## Getting Started

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL in .env

npm run db:generate
npm run db:push
npm run dev
```

## Architecture

### Config Validation

Every config passes through `src/lib/config-validator.ts` before being stored or rendered. Invalid configs are sanitized and never cause crashes — unknown fields are defaulted, missing required fields get fallback values, and unknown component types render a `FallbackRenderer`.

### Runtime API

`/api/runtime/[appId]` handles dynamic CRUD for any app. Records are stored as JSON blobs in `AppRecord.data`, validated at the API layer against the app's config schema.

### Renderer

`AppRenderer` dispatches to `FormRenderer`, `TableRenderer`, or `FallbackRenderer` based on config type. All renderers are wrapped in error boundaries to prevent crashes from propagating.

## Deployment

### Vercel + Neon (recommended)

1. Create a Neon PostgreSQL database
2. Deploy to Vercel, set `DATABASE_URL` and `NEXTAUTH_SECRET`
3. Run `npx prisma db push` via Vercel build command or locally against production DB

```
Build command: prisma generate && next build
```

## API Reference

### Auth
- `POST /api/auth/signup` — create account
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current user

### Apps
- `GET /api/apps` — list user's apps
- `POST /api/apps` — create app
- `GET /api/apps/:id` — get app
- `PUT /api/apps/:id` — update app (config, name, isPublished)
- `DELETE /api/apps/:id` — delete app

### Runtime
- `GET /api/runtime/:appId` — list records (paginated)
- `POST /api/runtime/:appId` — create record (validated against config)

### Features
- `POST /api/apps/:id/import-csv` — import CSV rows
- `GET /api/apps/:id/export-github` — export app as code files
