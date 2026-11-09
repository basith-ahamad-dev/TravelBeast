# TravelBeast Tourism

Next.js 15 (App Router) + TypeScript + Tailwind v4 + Prisma + **Turso (libSQL)**. Images: Cloudinary (local-disk fallback in dev).

## Run locally
1. `npm install`
2. `cp .env.example .env` and fill in values (see below)
3. `npm run db:setup` — applies migrations and seeds the admin + demo content
4. `npm run dev` -> http://localhost:3000, admin at /admin/login
5. With the app running: `npm run test:e2e`

With `TURSO_DATABASE_URL` empty, the app uses a local SQLite file (`DATABASE_URL`, default `./dev.db`), so no account is needed for development.

## Turso setup
```
turso db create travelbeast
turso db show travelbeast --url        # -> TURSO_DATABASE_URL (libsql://...)
turso db tokens create travelbeast     # -> TURSO_AUTH_TOKEN
```
Put both in `.env` (or your host's environment variables), then run `npm run db:setup` once.
`npm run db:deploy` applies migrations only; `npm run db:seed` is idempotent.

## Changing the schema
Prisma Migrate cannot connect to Turso, so migrations are plain SQL files in `prisma/migrations/<name>/migration.sql`, applied by `scripts/migrate.ts` (tracked in a `_migrations` table). To add one, edit `prisma/schema.prisma`, then generate the SQL for the change from the previous schema state, e.g.:
```
npx prisma migrate diff --from-url "file:./dev.db" --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0002_name/migration.sql
npm run db:deploy
```

## Notes
- SQLite has no native arrays, so a package's `included` / `excluded` lists are stored as JSON.
- Set `CLOUDINARY_*` for production uploads. Without them, uploads go to `./uploads` (dev only; not suitable for serverless hosting).
- Seed creates the admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` plus demo content (replace via the dashboard).
