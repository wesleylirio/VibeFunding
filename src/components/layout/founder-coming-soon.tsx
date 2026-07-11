import Link from "next/link";
import { Rocket } from "lucide-react";
import { VibeWordmark } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";

export function FounderComingSoon({
  userName,
}: {
  userName?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-5 md:px-8">
        <Link href="/">
          <VibeWordmark />
        </Link>
        <Badge variant="outline">Coming soon</Badge>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-20">
        <div className="card-surface p-6 md:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-vibe-soft text-vibe">
            <Rocket className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            Founder Mode
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {userName ? `${userName.split(" ")[0]}, f` : "F"}ounder tools are
            coming soon — available first for selected startups.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Launch Build Rounds, coordinate agents, and publish Proof of Build
            from a dedicated founder workspace.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/discover"
              className="inline-flex h-11 items-center justify-center rounded-[var(--vf-radius-md)] bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Continue as Investor
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[var(--vf-radius-md)] border border-border px-5 text-sm font-medium"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
