import { cn } from "@/lib/utils";

/** Lightweight safe markdown renderer for product content (no HTML injection). */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <div className={cn("prose-product space-y-2 text-sm", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("• ") || l.trim().startsWith("* "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-muted-foreground">
              {lines.map((line, j) => (
                <li key={j}>{formatInline(line.replace(/^[-•*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines[0]?.startsWith("## ")) {
          return (
            <div key={i}>
              <h3 className="text-sm font-semibold text-foreground">
                {formatInline(lines[0].replace(/^##\s+/, ""))}
              </h3>
              {lines.slice(1).map((line, j) => (
                <p key={j} className="mt-1 text-muted-foreground">
                  {formatInline(line)}
                </p>
              ))}
            </div>
          );
        }
        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {formatInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[12px] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
