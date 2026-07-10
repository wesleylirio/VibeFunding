import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StakeholderUpdateForm } from "@/components/founder/stakeholder-update-form";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getFounderProject } from "@/lib/queries/founder";
import { getPortfolio } from "@/lib/queries/portfolio";

export const dynamic = "force-dynamic";

export default async function StakeholderUpdatePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const juror = await requireJuror(
    `/founder/projects/${projectId}/stakeholder-update`
  );
  const session = getDemoSession();
  const project = getFounderProject(projectId);
  if (!project) notFound();
  const portfolio = getPortfolio(session.investorId);

  const draft = project.updates.find((u) => u.status === "DRAFT");
  const activeRound = project.rounds.find((r) =>
    ["OPEN", "BUILDING", "FUNDED"].includes(r.status)
  );

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Stakeholder update"
      subtitle={project.name}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-3xl">
        <StakeholderUpdateForm
          projectId={project.id}
          buildRoundId={activeRound?.id}
          initialId={draft?.id}
          initialTitle={draft?.title || ""}
          initialBody={draft?.body || ""}
        />
      </div>
    </AppShell>
  );
}
