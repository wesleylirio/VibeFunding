import { AppShell } from "@/components/layout/app-shell";
import { ProjectCard } from "@/components/projects/project-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import {
  getCategories,
  getStages,
  listProjects,
} from "@/lib/queries/projects";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const juror = await requireJuror("/discover");
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const stage = typeof params.stage === "string" ? params.stage : undefined;
  const sort =
    typeof params.sort === "string"
      ? (params.sort as "TRENDING" | "RECENT" | "RELEVANCE" | "PROGRESS")
      : "TRENDING";
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const verifiedOnly = params.verified === "1";
  const section = typeof params.section === "string" ? params.section : "all";

  const session = getDemoSession();
  const portfolio = getPortfolio(session.investorId);
  const { items, total, totalPages } = listProjects({
    search,
    category,
    stage,
    sort,
    page,
    limit: 12,
    verifiedOnly: verifiedOnly || section === "verified",
  });
  const categories = getCategories();
  const stages = getStages();

  const trending = items.filter((p) => p.activeRound).slice(0, 3);
  const gemmaMatches = items
    .filter((p) => p.detailed || p.proofCount > 0)
    .slice(0, 3)
    .map((p) => ({
      ...p,
      matchReason:
        p.category === "Developer Tools"
          ? "Aligns with your developer-tools concentration"
          : p.proofCount > 0
            ? "Has verified Proof of Build evidence"
            : "Active Build Round with clear deliverables",
    }));

  function href(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = {
      q: search,
      category,
      stage,
      sort,
      page: String(page),
      verified: verifiedOnly ? "1" : undefined,
      section: section !== "all" ? section : undefined,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    const qs = sp.toString();
    return qs ? `/discover?${qs}` : "/discover";
  }

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Discover"
      subtitle="Find Build Rounds across the agentic economy"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="card-surface p-4 md:p-5">
          <form method="get" className="flex flex-col gap-3 md:flex-row">
            <Input
              name="q"
              placeholder="Search projects, categories, stages…"
              defaultValue={search}
              className="md:flex-1"
            />
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 rounded-xl border border-border bg-muted/60 px-3 text-sm"
            >
              <option value="TRENDING">Trending</option>
              <option value="RECENT">Recent</option>
              <option value="PROGRESS">Progress</option>
            </select>
            <button
              type="submit"
              className="h-10 rounded-xl bg-white px-5 text-sm font-medium text-neutral-950"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "verified", label: "Proof verified" },
              { key: "trending", label: "Trending rounds" },
              { key: "matches", label: "Gemma matches" },
            ].map((s) => (
              <Link key={s.key} href={href({ section: s.key === "all" ? undefined : s.key, page: "1" })}>
                <Badge variant={section === s.key || (s.key === "all" && section === "all") ? "accent" : "outline"}>
                  {s.label}
                </Badge>
              </Link>
            ))}
            {categories.slice(0, 5).map((c) => (
              <Link key={c} href={href({ category: category === c ? undefined : c, page: "1" })}>
                <Badge variant={category === c ? "accent" : "outline"}>{c}</Badge>
              </Link>
            ))}
            {stages.slice(0, 4).map((s) => (
              <Link key={s} href={href({ stage: stage === s ? undefined : s, page: "1" })}>
                <Badge variant={stage === s ? "warning" : "outline"}>{s}</Badge>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {total} projects · server-side search & filters
          </p>
        </section>

        {section === "matches" || (!search && page === 1 && section === "all") ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Gemma matches</h2>
              <Badge variant="gemma">For your portfolio</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gemmaMatches.map((project) => (
                <ProjectCard
                  key={`match-${project.id}`}
                  project={project}
                  matchReason={project.matchReason}
                />
              ))}
            </div>
          </section>
        ) : null}

        {section === "trending" || (!search && page === 1 && section === "all") ? (
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Trending Build Rounds</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {trending.map((project) => (
                <ProjectCard key={`trend-${project.id}`} project={project} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-base font-semibold">
            {section === "verified" ? "Proof-verified projects" : "All projects"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {items.length === 0 ? (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              No projects match these filters.
            </div>
          ) : null}
        </section>

        <div className="flex items-center justify-between">
          <Link
            href={href({ page: String(Math.max(1, page - 1)) })}
            className={`text-sm ${page <= 1 ? "pointer-events-none text-muted-foreground" : "text-accent"}`}
          >
            ← Previous
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link
            href={href({ page: String(Math.min(totalPages, page + 1)) })}
            className={`text-sm ${page >= totalPages ? "pointer-events-none text-muted-foreground" : "text-accent"}`}
          >
            Next →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
