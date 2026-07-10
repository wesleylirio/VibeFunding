"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { VibeWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSelector } from "@/lib/brand/theme";
import type { DemoRole } from "@/lib/types";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole =
    params.get("role") === "FOUNDER" ? "FOUNDER" : "INVESTOR";
  const next = params.get("next") || "";

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<DemoRole>(defaultRole);
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
            // password accepted for demo UX only — never persisted server-side
            password: password.trim(),
            role,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        const dest =
          next ||
          (role === "FOUNDER" ? "/founder" : "/portfolio");
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
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use any name and password. No real account will be created.
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
                placeholder="Wesley Kennedy"
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
                Not stored. For demo flow only.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Enter as
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["INVESTOR", "FOUNDER"] as DemoRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      role === r
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {r === "INVESTOR" ? "Investor" : "Founder"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Investor is the default journey. You can switch roles anytime.
              </p>
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <Button type="submit" variant="accent" className="w-full" disabled={pending}>
              {pending ? "Entering…" : "Enter VibeFunding"}
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
