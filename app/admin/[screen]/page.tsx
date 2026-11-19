import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal-shell";
import { ScreenContent } from "@/components/screen-content";

export default async function AdminScreen({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const [members, pending, funds] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.contribution.count({ where: { status: "FOR_REVIEW" } }),
    prisma.fund.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <PortalShell portal="admin" active={screen} name="Ana R. Santos" role="Treasurer">
    <ScreenContent portal="admin" screen={screen} databaseSummary={{ members, pending, funds: funds.length }} />
  </PortalShell>;
}
