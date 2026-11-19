import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal-shell";
import { ScreenContent } from "@/components/screen-content";

const demoMember = {
  name: "Maria S. Dela Cruz",
  summary: { memberNumber: "LAD-0241", contributionCount: 5, shareCapital: 1_800_000 },
};

async function getDemoMember() {
  try {
    const member = await prisma.member.findFirst({
      where: { memberNumber: "LAD-0241", deletedAt: null },
      include: { user: true, contributions: { orderBy: { contributionAt: "desc" } } },
    });

    if (!member) return demoMember;

    return {
      name: member.user.displayName,
      summary: {
        memberNumber: member.memberNumber,
        contributionCount: member.contributions.length,
        shareCapital: member.shareCapital,
      },
    };
  } catch (error) {
    console.warn("Member demo database is unavailable; using anonymized demo data.", error);
    return demoMember;
  }
}

export default async function MemberScreen({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const member = await getDemoMember();

  return <PortalShell portal="member" active={screen} name={member.name} role="Member">
    <ScreenContent portal="member" screen={screen} databaseSummary={member.summary} />
  </PortalShell>;
}
