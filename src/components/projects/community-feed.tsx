"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type Comment = {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

type Post = {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  likes: number;
  dislikes: number;
  buildRoundId?: string | null;
  proofId?: string | null;
  agentRunId?: string | null;
  createdAt: string;
  comments: Comment[];
};

const roleLabel: Record<string, string> = {
  FOUNDER: "Founder",
  TEAM: "Team",
  INVESTOR: "Investor",
  COMPUTE_PROVIDER: "Compute Provider",
  TOKEN_HOLDER: "Token Holder",
};

export function CommunityFeed({
  projectId,
  projectSlug,
  initialPosts,
  accentColor,
}: {
  projectId: string;
  projectSlug: string;
  initialPosts: Post[];
  accentColor: string;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [body, setBody] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function createPost() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/community/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            projectId,
            body,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setBody("");
        router.refresh();
        setPosts((p) => [{ ...data.post, comments: [] }, ...p]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  async function react(postId: string, reaction: "LIKE" | "DISLIKE") {
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", postId, reaction }),
    });
    const data = await res.json();
    if (res.ok && data.post) {
      setPosts((list) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, likes: data.post.likes, dislikes: data.post.dislikes }
            : p
        )
      );
    }
  }

  async function comment(postId: string) {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", postId, body: text }),
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      setCommentDrafts((d) => ({ ...d, [postId]: "" }));
      setPosts((list) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, comments: [data.comment, ...p.comments] }
            : p
        )
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="card-surface p-4">
        <div className="text-sm font-medium">Share with the community</div>
        <Textarea
          className="mt-2"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Update, question, or signal…"
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={createPost}
            disabled={pending || !body.trim()}
          >
            Post
          </Button>
        </div>
        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      </div>

      {posts.map((post) => (
        <article
          key={post.id}
          className="card-surface overflow-hidden"
          style={{ borderTop: `3px solid ${accentColor}` }}
        >
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{post.authorName}</span>
              <Badge variant="outline">
                {roleLabel[post.authorRole] || post.authorRole}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {post.body}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {post.proofId ? (
                <Link href={`/proofs/${post.proofId}`} className="text-accent hover:underline">
                  Proof of Build
                </Link>
              ) : null}
              {post.agentRunId ? (
                <Link
                  href={`/projects/${projectSlug}/agents`}
                  className="text-accent hover:underline"
                >
                  Agent run
                </Link>
              ) : null}
              {post.buildRoundId ? (
                <span className="text-muted-foreground">Build Round linked</span>
              ) : null}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => react(post.id, "LIKE")}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                <ThumbsUp className="h-3 w-3" /> {post.likes}
              </button>
              <button
                type="button"
                onClick={() => react(post.id, "DISLIKE")}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                <ThumbsDown className="h-3 w-3" /> {post.dislikes}
              </button>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-3">
              {post.comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{c.authorName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {roleLabel[c.authorRole] || c.authorRole}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{c.body}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="h-9 flex-1 rounded-lg border border-border bg-muted/40 px-3 text-sm"
                  placeholder="Comment…"
                  value={commentDrafts[post.id] || ""}
                  onChange={(e) =>
                    setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => comment(post.id)}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
