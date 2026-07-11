import { FounderComingSoon } from "@/components/layout/founder-coming-soon";
import { getJurorSession } from "@/lib/demo/juror-session";

export const dynamic = "force-dynamic";

/**
 * Founder workspace is not open product-wide yet.
 * All /founder routes show Coming soon (selected startups only later).
 */
export default async function FounderLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  const juror = await getJurorSession();
  return (
    <FounderComingSoon
      userName={juror.loggedIn ? juror.displayName : undefined}
    />
  );
}
