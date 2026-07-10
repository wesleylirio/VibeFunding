import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getFounderDashboard } from "@/lib/queries/founder";
import { getPortfolio } from "@/lib/queries/portfolio";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function FounderProjectsPage() {
  const juror = await requireJuror("/founder/projects");
  const session = getDemoSession();
  const dash = getFounderDashboard(session.founderId);
  const portfolio = getPortfolio(session.investorId);

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Founder projects"
      subtitle="Projects under your founder profile"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto grid max-w-4xl gap-3">
        {dash.projects.map((p) => (
          <Link
            key={p.id}
            href={`/founder/projects/${p.id}`}
            className="card-surface flex items-center justify-between p-5 hover:border-neutral-300"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ background: p.accentColor }}
              >
                {p.logoEmoji}
              </div>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.shortDescription}</div>
              </div>
            </div>
            <Badge variant="outline">{p.stage}</Badge>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
