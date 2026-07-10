import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import {
  communityComments,
  communityPosts,
  communityReactions,
  projects,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import { nowIso } from "@/lib/db/seed-data";

export type AuthorRole =
  | "FOUNDER"
  | "TEAM"
  | "INVESTOR"
  | "COMPUTE_PROVIDER"
  | "TOKEN_HOLDER";

export function getCommunityFeed(projectId: string) {
  ensureSeeded();
  const db = getDb();
  const posts = db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.projectId, projectId))
    .orderBy(desc(communityPosts.createdAt))
    .all()
    .map((post) => {
      const comments = db
        .select()
        .from(communityComments)
        .where(eq(communityComments.postId, post.id))
        .orderBy(desc(communityComments.createdAt))
        .all();
      return { ...post, comments };
    });
  return posts;
}

export function createCommunityPost(input: {
  projectId: string;
  authorName: string;
  authorRole: AuthorRole;
  body: string;
  buildRoundId?: string;
  proofId?: string;
  agentRunId?: string;
}) {
  ensureSeeded();
  const db = getDb();
  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .get();
  if (!project) throw new Error("Project not found");
  if (!input.body.trim()) throw new Error("Post body required");

  const id = `cpost-${nanoid(10)}`;
  const createdAt = nowIso();
  db.insert(communityPosts)
    .values({
      id,
      projectId: input.projectId,
      authorName: input.authorName,
      authorRole: input.authorRole,
      body: input.body.trim(),
      buildRoundId: input.buildRoundId ?? null,
      proofId: input.proofId ?? null,
      agentRunId: input.agentRunId ?? null,
      likes: 0,
      dislikes: 0,
      createdAt,
    })
    .run();
  return db.select().from(communityPosts).where(eq(communityPosts.id, id)).get()!;
}

export function addCommunityComment(input: {
  postId: string;
  authorName: string;
  authorRole: AuthorRole;
  body: string;
}) {
  ensureSeeded();
  const db = getDb();
  const post = db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, input.postId))
    .get();
  if (!post) throw new Error("Post not found");
  if (!input.body.trim()) throw new Error("Comment body required");

  const id = `ccom-${nanoid(10)}`;
  db.insert(communityComments)
    .values({
      id,
      postId: input.postId,
      authorName: input.authorName,
      authorRole: input.authorRole,
      body: input.body.trim(),
      createdAt: nowIso(),
    })
    .run();
  return db
    .select()
    .from(communityComments)
    .where(eq(communityComments.id, id))
    .get()!;
}

export function reactToPost(input: {
  postId: string;
  reactorKey: string;
  reaction: "LIKE" | "DISLIKE";
}) {
  ensureSeeded();
  const db = getDb();
  const post = db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, input.postId))
    .get();
  if (!post) throw new Error("Post not found");

  const existing = db
    .select()
    .from(communityReactions)
    .where(
      and(
        eq(communityReactions.postId, input.postId),
        eq(communityReactions.reactorKey, input.reactorKey)
      )
    )
    .get();

  let likes = post.likes;
  let dislikes = post.dislikes;

  if (existing) {
    if (existing.reaction === "LIKE") likes = Math.max(0, likes - 1);
    if (existing.reaction === "DISLIKE") dislikes = Math.max(0, dislikes - 1);
    if (existing.reaction === input.reaction) {
      db.delete(communityReactions)
        .where(eq(communityReactions.id, existing.id))
        .run();
    } else {
      db.update(communityReactions)
        .set({ reaction: input.reaction })
        .where(eq(communityReactions.id, existing.id))
        .run();
      if (input.reaction === "LIKE") likes += 1;
      else dislikes += 1;
    }
  } else {
    db.insert(communityReactions)
      .values({
        id: `creact-${nanoid(10)}`,
        postId: input.postId,
        reactorKey: input.reactorKey,
        reaction: input.reaction,
        createdAt: nowIso(),
      })
      .run();
    if (input.reaction === "LIKE") likes += 1;
    else dislikes += 1;
  }

  db.update(communityPosts)
    .set({ likes, dislikes })
    .where(eq(communityPosts.id, input.postId))
    .run();

  return db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, input.postId))
    .get()!;
}
