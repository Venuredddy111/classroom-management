# Classroom Management

A full implementation of the API described in `swagger.json`, plus an admin
panel to manage it.

- **backend/** — Node.js + TypeScript + Express + Prisma + PostgreSQL, auth via
  [better-auth](https://www.better-auth.com/) (email/password, session cookie).
  Implements every path in `swagger.json`: Departments, Subjects, Classes,
  Enrollments, Users, Auth.
- **frontend/** — [Refine.dev](https://refine.dev/) + Ant Design admin panel
  (Vite + React + TypeScript), with list/create/edit/show pages for every
  resource, wired to the backend through a custom data provider and auth
  provider.

## A heads-up about how this was built

This project was written in a sandboxed environment that could not reach the
npm registry (an organization network policy blocked it), so **`npm install`
was never actually run against this code here** — there is no `node_modules`,
and nothing has been started end-to-end yet. Everything was written carefully
and cross-checked against `swagger.json` path-by-path, and every `.ts`/`.tsx`
file was run through the TypeScript compiler to catch syntax errors (all
clean) — but the very first `npm install` you run is also this project's
first real build. Budget a little time to work through any dependency-version
hiccups (see Troubleshooting below); pinned versions are recent, real
releases, but a minor bump here or there is possible.

## Prerequisites

- Node.js 20 or later
- PostgreSQL 14+ — either running locally, or via the included
  `docker-compose.yml` (requires Docker Desktop)

## 1. Start PostgreSQL

Using Docker (from the project root):

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password `postgres` /
`postgres` and a database named `classroom` — matching `backend/.env` out of
the box.

If you'd rather use a Postgres you already have running, just edit
`backend/.env` → `DATABASE_URL` to point at it.

## 2. Backend

```bash
cd backend
npm install
npm run prisma:migrate    # creates the schema (prompts for a migration name, e.g. "init")
npm run seed               # creates demo departments/subjects/classes/users
npm run dev                 # starts the API on http://localhost:8000
```

`npm run prisma:migrate` runs `prisma migrate dev`, which also runs
`prisma generate` for you. If you ever change `prisma/schema.prisma`, re-run
that command to create a new migration.

Demo accounts created by the seed script (password for all of them:
`Password123!`):

| Role    | Email                     |
|---------|---------------------------|
| admin   | admin@classroom.com       |
| teacher | teacher.math@classroom.com |
| teacher | teacher.sci@classroom.com  |
| student | student.a@classroom.com    |
| student | student.b@classroom.com    |
| student | student.c@classroom.com    |

Quick sanity check once it's running:

```bash
curl -i http://localhost:8000/health
curl -i -c cookies.txt -X POST http://localhost:8000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@classroom.com","password":"Password123!"}'
curl -i -b cookies.txt http://localhost:8000/api/departments
```

## 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in with one of the demo accounts above
(or use the Register page — it calls `/api/auth/sign-up/email` directly).

## Project structure

```
backend/
  prisma/schema.prisma   # User/Session/Account/Verification (better-auth) +
                          # Department/Subject/Class/Enrollment (domain)
  prisma/seed.ts          # demo data
  src/lib/auth.ts          # better-auth config (role + imageCldPubId as
                            # additional user fields)
  src/lib/prisma.ts
  src/middleware/auth.ts   # session lookup, requireAuth, requireRole
  src/middleware/errorHandler.ts
  src/routes/*.ts           # one router per resource, matching swagger.json
  src/index.ts               # Express app wiring

frontend/
  src/providers/dataProvider.ts   # maps Refine's data hooks onto this API's
                                    # { data, pagination } response shape
  src/providers/authProvider.ts   # cookie-session auth via /api/auth/*
  src/pages/<resource>/            # list/create/edit/show per resource
  src/App.tsx                       # Refine + routes + layout
```

## Known simplifications (worth knowing about)

- **`POST /api/classes` teacher field**: the swagger spec takes a raw
  `teacherId` string, not a lookup, so the Create/Edit Class forms just have
  a plain text field for it — copy a teacher's id from the Users page.
- **`POST /api/enrollments`** always enrolls *the logged-in user* (that's
  what the spec says — "Student id is taken from session"), so the
  Enrollments "Create" page only asks for a class. To enroll a different
  student, either use the Edit page on an existing enrollment (which can
  reassign `studentId`), or have that student sign in and use the
  **Join a class** page (`POST /api/enrollments/join`).
- **`POST /api/users`** (admin-only user management) matches the spec
  exactly, which means it does *not* take a password — it just creates a
  user row. Someone created this way can't sign in until they go through
  `/api/auth/sign-up/email` (the Register page) themselves, or you wire up
  better-auth's password-reset flow. This is a limitation of the documented
  API shape, not an oversight in the implementation.
- The `better-auth.session` cookie name shown in `swagger.json` is
  illustrative — better-auth manages its own cookie name/format internally.

## Troubleshooting

- **`npm install` fails on a specific package version**: open that package's
  npm page and swap in the closest recent version; nothing here pins to an
  exact patch release for a load-bearing reason.
- **Prisma can't reach the database**: confirm `docker compose ps` shows
  `classroom-postgres` as healthy, and that `DATABASE_URL` in `backend/.env`
  matches (`postgresql://postgres:postgres@localhost:5432/classroom`).
- **Frontend requests fail with a CORS or cookie error**: the backend's
  `CLIENT_ORIGIN` (in `backend/.env`) must exactly match the URL the frontend
  is served from (`http://localhost:5173` by default), and both must be
  `http://localhost`, not `127.0.0.1` — cookies are origin-specific.
- **Login succeeds but the app still redirects to `/login`**: check the
  browser console/network tab for the `get-session` request — if it's not
  sending the cookie, double-check `CLIENT_ORIGIN` and that you're not mixing
  `localhost` and `127.0.0.1` between the two apps.
