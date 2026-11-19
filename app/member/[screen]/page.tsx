import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal-shell";
import { ScreenContent } from "@/components/screen-content";

export default async function MemberScreen({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const member = await prisma.member.findFirst({ where: { memberNumber: "LAD-0241", deletedAt: null }, include: { user: true, contributions: { orderBy: { contributionAt: "desc" } } } });
  return <PortalShell portal="member" active={screen} name={member?.user.displayName ?? "Member"} role="Member">
    <ScreenContent portal="member" screen={screen} databaseSummary={{ memberNumber: member?.memberNumber ?? "LAD-0241", contributionCount: member?.contributions.length ?? 0, shareCapital: member?.shareCapital ?? 0 }} />
  </PortalShell>;
}
