import { AppShell } from "@/components/layout/app-shell";
import { ProjectCard } from "@/components/projects/project-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PreferenceQuestionnaire } from "@/components/investor/preference-questionnaire";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import {
  getInvestedProjectIds,
  getInvestedProjectSlugs,
  getPortfolio,
} from "@/lib/queries/portfolio";
import {
  getCategories,
  getStages,
  listProjects,
} from "@/lib/queries/projects";
import { rankProjectMatches } from "@/lib/investor/preferences";
import { getGemmaGateway } from "@/lib/gemma";
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
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const stage = typeof params.stage === "string" ? params.stage : undefined;
  const sort =
    typeof params.sort === "string"
      ? (params.sort as "TRENDING" | "RECENT" | "RELEVANCE" | "PROGRESS")
      : "TRENDING";
  const showFilters = params.filters === "1";
  const verifiedOnly = params.verified === "1";

  const session = await getDemoSession();
  const portfolio = await getPortfolio(session.investorId);
  const prefs = juror.investorPreferences;
  const onboarding = !prefs;

  // First-use onboarding: only the questionnaire — no project list yet
  if (onboarding) {
    return (
      <AppShell
        role={juror.role}
        userName={juror.displayName}
        initials={juror.initials}
        title="Welcome"
        vibeBalance={portfolio.vibeBalance}
        hideGemma
      >
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-4">
          <PreferenceQuestionnaire onboarding />
        </div>
      </AppShell>
    );
  }

  const { items: allItems, total } = await listProjects({
    search,
    category,
    stage,
    sort,
    page: 1,
    limit: 24,
    verifiedOnly,
  });

  const categories = await getCategories();
  const stages = await getStages();

  // Never re-suggest projects the investor already funded
  const investedIds = await getInvestedProjectIds(session.investorId);
  const investedSlugs = await getInvestedProjectSlugs(session.investorId);

  const rankedPool = rankProjectMatches(allItems, prefs, {
    excludeIds: investedIds,
    excludeSlugs: investedSlugs,
  });
  const fallbackMatches = rankedPool.slice(0, 3);
  let gemmaMatches = fallbackMatches;
  try {
    const candidates = rankedPool
      .map((project) => ({
        slug: project.slug,
        name: project.name,
        category: project.category,
        stage: project.stage,
        proofCount: project.proofCount,
        round: project.activeRound?.title,
        progress: project.activeRound?.progress,
      }));
    const response = await getGemmaGateway().chat({
      context: "GLOBAL_DISCOVERY",
      message: `Act as an investment diligence engine. Evaluate this investor profile: ${JSON.stringify(prefs)}. From these candidates: ${JSON.stringify(candidates)}, select exactly three best-fit projects. Return only their slugs in ranked order, separated by commas. Do not add advice or a call to action.`,
      role: "INVESTOR",
    });
    const rankedSlugs = candidates
      .map((candidate) => candidate.slug)
      .filter((slug) => response.content.toLowerCase().includes(slug.toLowerCase()));
    const aiMatches = rankedSlugs
      .map((slug) => rankedPool.find((project) => project.slug === slug))
      .filter((project): project is (typeof fallbackMatches)[number] => Boolean(project))
      .slice(0, 3);
    if (aiMatches.length === 3) gemmaMatches = aiMatches;
  } catch {
    // Deterministic ranking remains available if the live model is unavailable.
  }
  const gemmaSlugs = new Set(gemmaMatches.map((m) => m.slug));
  // Suggestions first (unfunded only), then full list (incl. already invested)
  const orderedProjects = [
    ...gemmaMatches,
    ...allItems.filter((p) => !gemmaSlugs.has(p.slug)),
  ];

  function href(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = {
      q: search,
      category,
      stage,
      sort,
      verified: verifiedOnly ? "1" : undefined,
      filters: showFilters ? "1" : undefined,
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
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="card-surface p-4 md:p-5">
          <form method="get" className="flex flex-col gap-3 md:flex-row">
            <Input
              name="q"
              placeholder="Search projects…"
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
              className="h-10 rounded-[var(--vf-radius-sm)] bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Search
            </button>
            <Link
              href={href({ filters: showFilters ? undefined : "1" })}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium"
            >
              Filters{showFilters ? " · hide" : ""}
            </Link>
          </form>

          {showFilters ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={href({ verified: verifiedOnly ? undefined : "1" })}>
                <Badge variant={verifiedOnly ? "success" : "outline"}>
                  Proof verified
                </Badge>
              </Link>
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c}
                  href={href({ category: category === c ? undefined : c })}
                >
                  <Badge variant={category === c ? "accent" : "outline"}>
                    {c}
                  </Badge>
                </Link>
              ))}
              {stages.slice(0, 4).map((s) => (
                <Link key={s} href={href({ stage: stage === s ? undefined : s })}>
                  <Badge variant={stage === s ? "warning" : "outline"}>
                    {s}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Projects</h2>
            <span className="text-xs text-muted-foreground">{total} listed</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orderedProjects.map((project) => (
              <ProjectCard
                key={"id" in project ? project.id : project.slug}
                project={project}
                gemmaSuggestion={gemmaSlugs.has(project.slug)}
              />
            ))}
          </div>
          {orderedProjects.length === 0 ? (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              No projects match these filters.
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
