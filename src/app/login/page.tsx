"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { VibeWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSelector } from "@/lib/brand/theme";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "";

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("Enter a display name.");
      return;
    }
    if (!password.trim()) {
      setError("Enter any password (it will not be stored).");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/demo/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: displayName.trim(),
            password: password.trim(),
            role: "INVESTOR",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        // Founder destinations are not available — land on Discover
        const dest =
          next && !next.startsWith("/founder") ? next : "/discover";
        router.push(dest);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-5 md:px-8">
        <Link href="/">
          <VibeWordmark />
        </Link>
        <ThemeSelector />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <div className="card-surface p-6 md:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter as an investor to discover projects, fund Build Rounds with
            VIBE, and follow verified progress.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Display name
              </label>
              <Input
                className="mt-1"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                autoComplete="nickname"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <Input
                className="mt-1"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Anything"
                autoComplete="off"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Not stored — used only for this session flow.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Account type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-[var(--vf-radius-sm)] border border-primary bg-vibe-soft px-3 py-2.5 text-sm font-medium text-vibe">
                  Investor
                </div>
                <div
                  className="relative rounded-[var(--vf-radius-sm)] border border-border bg-muted/40 px-3 py-2.5 text-sm font-medium text-muted-foreground"
                  title="Coming soon for selected startups"
                >
                  <span className="opacity-70">Founder</span>
                  <Badge
                    variant="outline"
                    className="absolute -right-1 -top-2 text-[9px]"
                  >
                    Coming soon
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Founder Mode is opening first for selected startups.
              </p>
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <Button type="submit" variant="accent" className="w-full" disabled={pending}>
              {pending ? "Entering…" : "Continue as Investor"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
