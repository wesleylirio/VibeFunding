import { BookOpen, ExternalLink, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const config: Record<
  string,
  { label: string; icon: typeof ExternalLink }
> = {
  website: { label: "Website", icon: ExternalLink },
  repository: { label: "Repository", icon: ExternalLink },
  docs: { label: "Docs", icon: BookOpen },
  telegram: { label: "Telegram", icon: MessageCircle },
  discord: { label: "Discord", icon: MessageCircle },
  x: { label: "X", icon: ExternalLink },
  twitter: { label: "X", icon: ExternalLink },
  instagram: { label: "Instagram", icon: ExternalLink },
};

export function ProjectSocialLinks({
  links,
  light = false,
  className,
}: {
  links: Record<string, string>;
  light?: boolean;
  className?: string;
}) {
  const entries = Object.entries(links || {}).filter(([, v]) => Boolean(v));
  if (!entries.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {entries.map(([key, url]) => {
        const meta = config[key] || { label: key, icon: ExternalLink };
        const Icon = meta.icon;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={meta.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition",
              light
                ? "border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            {meta.label}
          </a>
        );
      })}
    </div>
  );
}
