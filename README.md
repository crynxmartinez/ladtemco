# Ladtemco Cooperative Management System

Local-first cooperative CRM prototype for Ladtemco. It includes separate administrator and member portals for contributions, share capital, funds, liquidations, reports, documents, meetings, and cooperative transparency.

## Local setup

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000` in Opera GX. The login screen provides local member and administrator demo access.

## Technology

- Next.js 16 and React 19
- TypeScript
- Prisma 7
- Local SQLite database

The local database and environment files are intentionally excluded from version control. PostgreSQL and production authentication are planned for the public deployment phase.
