import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal-shell";
import { ScreenContent } from "@/components/screen-content";

const demoSummary = { members: 286, pending: 7, funds: 3 };

async function getAdminSummary() {
  try {
    const [members, pending, funds] = await Promise.all([
      prisma.member.count({ where: { deletedAt: null } }),
      prisma.contribution.count({ where: { status: "FOR_REVIEW" } }),
      prisma.fund.count(),
    ]);

    return { members, pending, funds };
  } catch (error) {
    console.warn("Admin demo database is unavailable; using anonymized demo data.", error);
    return demoSummary;
  }
}

export default async function AdminScreen({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const databaseSummary = await getAdminSummary();

  return <PortalShell portal="admin" active={screen} name="Ana R. Santos" role="Treasurer">
    <ScreenContent portal="admin" screen={screen} databaseSummary={databaseSummary} />
  </PortalShell>;
}
