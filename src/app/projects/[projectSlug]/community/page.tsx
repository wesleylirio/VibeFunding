import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { CommunityFeed } from "@/components/projects/community-feed";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getProjectBySlug } from "@/lib/queries/projects";
import { getCommunityFeed } from "@/lib/queries/community";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const juror = await requireJuror(`/projects/${projectSlug}/community`);
  const session = getDemoSession();
  const portfolio = getPortfolio(session.investorId);
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const hasInvested =
    portfolio.allocations.some((a) => a.projectId === project.id) ||
    portfolio.holdings.some(
      (h) =>
        h.projectId === project.id &&
        (h.assetType === "PROJECT_TOKEN" || h.assetType === "NFT")
    );

  if (!hasInvested) {
    redirect(`/projects/${project.slug}`);
  }

  const posts = getCommunityFeed(project.id);

  return (
    <AppShell
      role={session.role}
      userName={juror.displayName}
      initials={juror.initials}
      title={`${project.name} · Community`}
      subtitle="For people who invested in this Build Round"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-xl border border-gemma/30 bg-gemma-soft/40 px-4 py-3 text-sm">
          <span className="font-medium text-gemma">Demo path · step 2 of 3</span>
          <span className="text-muted-foreground">
            {" "}
            — You&apos;re in the community. Next: Portfolio.
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm text-accent hover:underline"
          >
            ← {project.name}
          </Link>
        </div>
        <ProjectTabs slug={project.slug} showCommunity />

        <CommunityFeed
          projectId={project.id}
          projectSlug={project.slug}
          accentColor={project.accentColor}
          initialPosts={posts}
        />

        {/* Close the demo loop */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-vibe" />
                Next: Portfolio
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                See your VIBE balance, project tokens, and holdings in one place.
              </p>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Back to Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Step 3 of 3 · End of the investor demo path
          </p>
        </section>
      </div>
    </AppShell>
  );
}
