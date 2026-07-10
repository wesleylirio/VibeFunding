import Link from "next/link";
import { notFound } from "next/navigation";
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

  const posts = getCommunityFeed(project.id);

  return (
    <AppShell
      role={session.role}
      userName={juror.displayName}
      initials={juror.initials}
      title={`${project.name} · Community`}
      subtitle="Shared progress between investors, founders and contributors"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm text-accent hover:underline"
          >
            ← {project.name}
          </Link>
        </div>
        <ProjectTabs slug={project.slug} />
        <CommunityFeed
          projectId={project.id}
          projectSlug={project.slug}
          accentColor={project.accentColor}
          initialPosts={posts}
        />
      </div>
    </AppShell>
  );
}
