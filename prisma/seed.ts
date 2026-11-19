import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { RecordStatus, UserRole } from "../generated/prisma/enums";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.auditEvent.deleteMany({ where: { eventCode: { startsWith: "DEMO-" } } });
  await prisma.shareTransaction.deleteMany({ where: { reference: { startsWith: "DEMO-" } } });
  await prisma.contribution.deleteMany({ where: { reference: { startsWith: "DEMO-" } } });
  await prisma.fund.deleteMany({ where: { code: { startsWith: "DEMO-" } } });

  const memberUser = await prisma.user.upsert({
    where: { email: "member@ladtemco.local" },
    update: {},
    create: { email: "member@ladtemco.local", displayName: "Maria S. Dela Cruz", role: UserRole.MEMBER },
  });
  const officer = await prisma.user.upsert({
    where: { email: "admin@ladtemco.local" },
    update: {},
    create: { email: "admin@ladtemco.local", displayName: "Ana R. Santos", role: UserRole.TREASURER },
  });
  const member = await prisma.member.upsert({
    where: { memberNumber: "LAD-0241" },
    update: { shareCapital: 1_800_000 },
    create: { memberNumber: "LAD-0241", userId: memberUser.id, joinedAt: new Date("2019-06-12"), shareCapital: 1_800_000 },
  });

  for (const [index, month] of [8, 9, 10, 11, 12].entries()) {
    await prisma.contribution.create({
      data: {
        reference: `DEMO-CON-2026-${String(index + 1).padStart(3, "0")}`,
        memberId: member.id,
        amountCentavos: 50_000,
        contributionAt: new Date(2026, month - 1, 10),
        status: RecordStatus.POSTED,
        receiptNumber: `DEMO-OR-${index + 1}`,
      },
    });
  }
  await prisma.shareTransaction.create({
    data: { reference: "DEMO-SHARE-001", memberId: member.id, amountCentavos: 300_000, shares: 30, postedAt: new Date("2026-01-15") },
  });
  await prisma.fund.createMany({
    data: [
      { code: "DEMO-MEMBER", name: "Member Welfare Services", approvedCentavos: 40_000_000, utilizedCentavos: 31_000_000, status: "ONGOING" },
      { code: "DEMO-TRAINING", name: "Teacher Development Program", approvedCentavos: 25_000_000, utilizedCentavos: 18_090_000, status: "ONGOING" },
      { code: "DEMO-COMMUNITY", name: "Community Outreach Program", approvedCentavos: 30_000_000, utilizedCentavos: 22_000_000, status: "ONGOING" },
    ],
  });
  await prisma.auditEvent.create({
    data: { eventCode: "DEMO-AUDIT-001", actorId: officer.id, action: "Verified contribution", entityType: "Contribution", entityId: "DEMO-CON-2026-005", metadata: JSON.stringify({ source: "seed", immutable: true }) },
  });
}

main().finally(() => prisma.$disconnect());
