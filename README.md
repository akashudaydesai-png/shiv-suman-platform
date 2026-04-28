# Shiv Suman Driving School Platform

This folder is the new implementation foundation for the master blueprint:

- Public SEO website
- Role-based secure web app
- Driving school ERP
- RTO work CRM
- Training automation
- Fleet and camera evidence mapping

The old Laravel and Flutter projects remain untouched as reference material.

## Apps

- `apps/web`: Next.js, React, TypeScript, Tailwind UI for the public site and secure dashboards.
- `apps/api`: NestJS, Prisma, PostgreSQL, Redis-ready backend API.
- `packages/shared`: Shared roles, statuses, events, and permission constants.

## Local Setup

After installing Node.js 20+:

```bash
cd shiv-suman-platform
npm install
npm run dev
```

API environment:

```bash
cp apps/api/.env.example apps/api/.env
cd apps/api
npm run prisma:generate
npm run prisma:migrate
```

## GitHub And Vercel Deployment

This repo is prepared for:

- GitHub Actions CI at `.github/workflows/ci.yml`
- Vercel deployment workflow at `.github/workflows/vercel-deploy.yml`
- Multi-service Vercel routing in `vercel.json`

### Recommended GitHub repository name

`shiv-suman-platform`

### Required GitHub repository secrets

Add these secrets in GitHub before enabling the Vercel deployment workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Required Vercel project settings

1. Import the GitHub repository into Vercel.
2. Set the framework preset to `Services`.
3. Keep the root directory at the repository root.
4. Add production and preview environment variables:

```bash
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NOTIFICATION_PROVIDER=
STORAGE_PROVIDER=
PUBLIC_WEB_URL=
```

### Deployment behavior

- Pull requests create preview deployments.
- Pushes to `main` trigger production deployment.
- Every push and pull request also runs CI typecheck and build validation.

## Architecture Defaults

- PostgreSQL is the main database.
- Redis powers queues, automation, and realtime-ready cache.
- Razorpay webhooks are the payment source of truth.
- Zoho/SMS/WhatsApp providers are wrapped behind notification services.
- Fleet/camera data is stored as evidence references and synced from vendor APIs.
