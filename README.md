# Lighthouse Care Volunteer Management App

A full-featured volunteer management web application for [Lighthouse Care](https://lighthousecare.org.au), an Australian not-for-profit charity based in Logan, South East Queensland.

**Live at:** https://volunteer.lighthousecare.org.au

---

## What this app does

- Volunteer sign-up and profile management
- Online induction with quiz (configurable sections and questions)
- Shift rostering and calendar view
- On-site sign-in/sign-out kiosk (tablet-friendly, with guest support)
- Attendance tracking and no-show detection
- Admin dashboard with reporting and volunteer status management
- Automated email notifications (sign-up, induction, shift reminders, inactivity check-ins)
- Blue Card (Working with Children Check) tracking
- CSV export of volunteer data

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM |
| Auth | Custom session-based auth (HTTP-only cookies) |
| Email | Resend / SMTP / Microsoft 365 (configurable) |
| Runtime | Node.js 18+ |

---

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later (or a hosted service such as Supabase or Railway)
- npm or pnpm

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/lighthouse-care/volunteer-app.git
cd volunteer-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and update the following required values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random 32+ character string (run `openssl rand -base64 32`) |
| `EMAIL_PROVIDER` | `mock` (dev), `resend`, or `smtp` |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |

### 3. Set up the database

Run migrations to create all tables:

```bash
npm run db:migrate
```

Generate the Prisma client:

```bash
npm run db:generate
```

Seed the database with sample data:

```bash
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@lighthousecare.org.au | Admin@1234! |
| Kiosk | kiosk@lighthousecare.org.au | Kiosk@1234! |
| Volunteer (Active) | sarah.mitchell@example.com | Volunteer@1234! |
| Volunteer (Active) | david.nguyen@example.com | Volunteer@1234! |
| Volunteer (Inducted) | emma.thompson@example.com | Volunteer@1234! |
| Volunteer (Pending) | james.patel@example.com | Volunteer@1234! |
| Volunteer (Inactive) | lisa.chen@example.com | Volunteer@1234! |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database browser) |
| `npm run db:reset` | Reset database and re-run all migrations |

---

## Project Structure

```
src/
  app/
    admin/          # Admin dashboard pages
      volunteers/   # Volunteer management
      shifts/       # Shift rostering
      attendance/   # Attendance records
      reports/      # Reporting
      settings/     # App settings, induction sections, quiz questions
    auth/           # Login, sign-up, forgot password
    dashboard/      # Volunteer-facing portal
    induction/      # Induction flow
    kiosk/          # Sign-in/sign-out kiosk
  lib/
    actions/        # Server Actions (auth, admin, volunteer, kiosk)
    auth.ts         # Session management
    email.ts        # Email sending
    prisma.ts       # Prisma client singleton
    utils.ts        # Shared utilities
prisma/
  schema.prisma     # Database schema
  seed.ts           # Database seeding
```

---

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set all environment variables from `.env.example` in the Vercel project settings.
4. Connect a PostgreSQL database (Vercel Postgres, Supabase, or Neon all work well).
5. Deploy. Vercel will automatically run `next build`.

After first deployment, run the seed from your local machine against the production `DATABASE_URL`:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

---

## Email Configuration

Set `EMAIL_PROVIDER` in your `.env` file:

- **`mock`** — Logs emails to the console. No setup needed. Use for development.
- **`resend`** — Set `RESEND_API_KEY`. Recommended for production.
- **`smtp`** — Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Compatible with Microsoft 365 (`smtp.office365.com:587`).

---

## Future Integrations

| Integration | Purpose | Status |
|------------|---------|--------|
| **Twilio** | SMS notifications and shift reminders | Planned |
| **MessageMedia** | AU-based SMS alternative | Planned |
| **Mailchimp** | Bulk communications and newsletters | Planned |
| **Microsoft 365** | SMTP email (already supported via SMTP provider) | Supported |
| **MyFoodLink** | Integration with Lighthouse Care's store POS system | Future |

---

## About Lighthouse Care

Lighthouse Care (ABN 87 637 110 948) is an ACNC-registered not-for-profit charity based in Logan, South East Queensland. Founded in 2004 by Debbie and Ron Hill, we provide affordable groceries, $25 trolleys, home delivery, and emergency food relief to over 750,000 people across South East Queensland each year.

We operate two not-for-profit grocery stores (Loganholme and Hillcrest) and an online store. We are entirely self-funded — every purchase directly funds free food relief for families in crisis.

**Mission:** Making lives better so that together we can make the world better.

[lighthousecare.org.au](https://lighthousecare.org.au)

---

## Licence

Private — all rights reserved. This application is developed for and owned by Lighthouse Care.
