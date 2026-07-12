import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addCommunityComment,
  createCommunityPost,
  getCommunityFeed,
  reactToPost,
} from "@/lib/queries/community";
import { getJurorSession } from "@/lib/demo/juror-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }
  return NextResponse.json({ posts: await getCommunityFeed(projectId) });
}

const postSchema = z.object({
  action: z.enum(["create", "comment", "react"]),
  projectId: z.string().optional(),
  postId: z.string().optional(),
  body: z.string().optional(),
  reaction: z.enum(["LIKE", "DISLIKE"]).optional(),
  authorRole: z
    .enum(["FOUNDER", "TEAM", "INVESTOR", "COMPUTE_PROVIDER", "TOKEN_HOLDER"])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = postSchema.parse(await request.json());
    const juror = await getJurorSession();
    const authorName = juror.loggedIn ? juror.displayName : "Guest";
    const defaultRole =
      juror.role === "FOUNDER" ? "FOUNDER" : ("INVESTOR" as const);

    if (body.action === "create") {
      if (!body.projectId || !body.body) {
        return NextResponse.json(
          { error: "projectId and body required" },
          { status: 400 }
        );
      }
      const post = await createCommunityPost({
        projectId: body.projectId,
        authorName,
        authorRole: body.authorRole || defaultRole,
        body: body.body,
      });
      return NextResponse.json({ ok: true, post });
    }

    if (body.action === "comment") {
      if (!body.postId || !body.body) {
        return NextResponse.json(
          { error: "postId and body required" },
          { status: 400 }
        );
      }
      const comment = await addCommunityComment({
        postId: body.postId,
        authorName,
        authorRole: body.authorRole || defaultRole,
        body: body.body,
      });
      return NextResponse.json({ ok: true, comment });
    }

    if (body.action === "react") {
      if (!body.postId || !body.reaction) {
        return NextResponse.json(
          { error: "postId and reaction required" },
          { status: 400 }
        );
      }
      const reactorKey = juror.loggedIn
        ? `juror:${juror.displayName}`
        : "guest";
      const post = await reactToPost({
        postId: body.postId,
        reactorKey,
        reaction: body.reaction,
      });
      return NextResponse.json({ ok: true, post });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed" },
      { status: 400 }
    );
  }
}
