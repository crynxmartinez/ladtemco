PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "deletedAt" DATETIME
);
CREATE INDEX IF NOT EXISTS "User_role_active_idx" ON "User"("role", "active");

CREATE TABLE IF NOT EXISTS "Member" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberNumber" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL UNIQUE,
  "joinedAt" DATETIME NOT NULL,
  "shareCapital" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "deletedAt" DATETIME,
  CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Member_joinedAt_idx" ON "Member"("joinedAt");

CREATE TABLE IF NOT EXISTS "Contribution" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reference" TEXT NOT NULL UNIQUE,
  "memberId" TEXT NOT NULL,
  "amountCentavos" INTEGER NOT NULL,
  "contributionAt" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "receiptNumber" TEXT UNIQUE,
  "reversedById" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Contribution_reversedById_fkey" FOREIGN KEY ("reversedById") REFERENCES "Contribution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Contribution_memberId_contributionAt_idx" ON "Contribution"("memberId", "contributionAt");
CREATE INDEX IF NOT EXISTS "Contribution_status_contributionAt_idx" ON "Contribution"("status", "contributionAt");

CREATE TABLE IF NOT EXISTS "ShareTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reference" TEXT NOT NULL UNIQUE,
  "memberId" TEXT NOT NULL,
  "amountCentavos" INTEGER NOT NULL,
  "shares" INTEGER NOT NULL,
  "postedAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShareTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ShareTransaction_memberId_postedAt_idx" ON "ShareTransaction"("memberId", "postedAt");

CREATE TABLE IF NOT EXISTS "Fund" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "approvedCentavos" INTEGER NOT NULL,
  "utilizedCentavos" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "Fund_status_createdAt_idx" ON "Fund"("status", "createdAt");

CREATE TABLE IF NOT EXISTS "AuditEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventCode" TEXT NOT NULL UNIQUE,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" TEXT NOT NULL,
  CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AuditEvent_actorId_occurredAt_idx" ON "AuditEvent"("actorId", "occurredAt");
CREATE INDEX IF NOT EXISTS "AuditEvent_entityType_entityId_occurredAt_idx" ON "AuditEvent"("entityType", "entityId", "occurredAt");
