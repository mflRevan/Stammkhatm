# Stammkhatm – Haus Des Islam

A private Khatm management app for the **Stammtisch** group of **Haus Des Islam**. The Quran is split into N segments each month, and group members claim and complete segments to finish a full Khatm together.

## Features

- **Monthly Khatm cycles** – Quran split into configurable segments with Surah/Juz metadata
- **User registration** with email OTP verification
- **Claim segments** with responsibility disclaimer
- **Track completion** per user per segment
- **Admin panel** – change settings, regenerate segments, send reminders
- **Email reminders** via cron (node-cron + Nodemailer)
- **Full EN/DE i18n** – all UI strings localized
- **Light/Dark mode** – persisted toggle
- **Mobile-first** responsive design (Tailwind CSS)

## Tech Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces |
| Frontend | Vite + React + TypeScript + Tailwind |
| Backend | Express + TypeScript |
| Database | Prisma + SQLite |
| Auth | bcrypt + JWT (HttpOnly cookie) |
| Validation | Zod |
| Email | Nodemailer |
| Cron | node-cron |

## Project Structure

```
/
├── apps/
│   ├── api/          # Express API server
│   └── web/          # Vite React frontend
├── packages/
│   └── shared/       # Shared types, schemas, Quran data
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8

### Setup

```bash
# Install dependencies
pnpm install

# Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit apps/api/.env with your settings (ADMIN_EMAILS, JWT_SECRET, etc.)

# Run database migrations
cd apps/api
npx prisma migrate dev --name init
cd ../..

# Seed the database
pnpm db:seed

# Start development
pnpm dev
```

This starts:
- **API** on http://localhost:3001
- **Web** on http://localhost:5173

### Environment Variables

#### apps/api/.env

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | Secret for JWT signing | (required) |
| `DATABASE_URL` | SQLite path | `file:./dev.db` |
| `ADMIN_EMAILS` | Comma-separated admin emails | `admin@example.com` |
| `APP_URL` | Frontend URL (for CORS + emails) | `http://localhost:5173` |
| `SMTP_HOST` | SMTP server host | (optional, logs if missing) |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | (optional) |
| `SMTP_PASS` | SMTP password | (optional) |
| `SMTP_FROM` | From address | `noreply@stammkhatm.de` |

#### apps/web/.env

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `http://localhost:3001` |

## Deployment (Render)

### API (Web Service)

1. Create a new **Web Service** on Render
2. Set build command: `pnpm install && pnpm --filter @stammkhatm/api build`
3. Set start command: `cd apps/api && npx prisma migrate deploy && node dist/index.js`
4. Add all env vars from the table above
5. **Attach a persistent disk** mounted at `/data`
6. Set `DATABASE_URL=file:/data/stammkhatm.db`

### Web (Static Site)

1. Create a new **Static Site** on Render
2. Set build command: `pnpm install && pnpm --filter @stammkhatm/web build`
3. Set publish directory: `apps/web/dist`
4. Set `VITE_API_URL` to your API service URL
5. Add rewrite rule: `/* → /index.html` (SPA)

## API Routes

### Auth
- `POST /auth/register` – Register with name, email, password
- `POST /auth/verify-otp` – Verify email with 6-digit OTP
- `POST /auth/login` – Login with email + password
- `POST /auth/logout` – Clear session
- `GET /me` – Get current user

### Data
- `GET /cycles/current` – Get current month's cycle + segments
- `POST /segments/:id/claim` – Claim a segment
- `POST /claims/:id/complete` – Mark claim as complete

### Admin (whitelist-protected)
- `GET /admin/settings` – Get app settings
- `PUT /admin/settings` – Update settings
- `POST /admin/cycle/regenerate` – Regenerate current month's segments
- `POST /admin/reminders/send-now` – Manually trigger reminder emails

## License

Private – Haus Des Islam
