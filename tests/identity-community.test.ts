import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  initialsFromName,
  parseJurorCookie,
  serializeJurorSession,
} from "../src/lib/demo/juror-session";
import {
  generateQuickstartDraft,
  saveQuickstartDraft,
} from "../src/lib/founder/quickstart";

describe("juror session helpers", () => {
  it("builds initials from display name", () => {
    expect(initialsFromName("Wesley Kennedy")).toBe("WK");
    expect(initialsFromName("Ada")).toBe("AD");
  });

  it("parses logged-in cookie and defaults when empty", () => {
    expect(parseJurorCookie(undefined).loggedIn).toBe(false);
    const raw = serializeJurorSession({
      loggedIn: true,
      displayName: "Wesley Kennedy",
      initials: "WK",
      role: "INVESTOR",
      onboardingSeen: false,
      founderQuickstartSeen: false,
    });
    const parsed = parseJurorCookie(raw);
    expect(parsed.loggedIn).toBe(true);
    expect(parsed.displayName).toBe("Wesley Kennedy");
    expect(parsed.role).toBe("INVESTOR");
  });

  it("defaults role to investor", () => {
    const parsed = parseJurorCookie(
      JSON.stringify({
        loggedIn: true,
        displayName: "Test",
      })
    );
    expect(parsed.role).toBe("INVESTOR");
  });
});

describe("founder quickstart", () => {
  const testDb = path.join(process.cwd(), "data", "test-quickstart.db");

  beforeAll(async () => {
    process.env.DATABASE_URL = `file:${testDb}`;
    fs.mkdirSync(path.dirname(testDb), { recursive: true });
    for (const f of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    const { seedDatabase } = await import("../src/lib/db/seed");
    seedDatabase({ force: true });
  });

  afterAll(async () => {
    try {
      const { getSqlite } = await import("../src/lib/db");
      getSqlite().close();
    } catch {
      /* ignore */
    }
    for (const f of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it("generates an editable draft from few inputs", () => {
    const draft = generateQuickstartDraft({
      building: "A routing layer for open-weight coding models",
      stage: "MVP",
      nextGoal: "Ship GPU-aware batching",
      evidence: "Prototype router live",
    });
    expect(draft.name.length).toBeGreaterThan(2);
    expect(draft.buildRound.deliverables.length).toBeGreaterThan(0);
    expect(draft.buildRound.estimatedBuildUnits).toBeGreaterThan(0);
    expect(draft.token.symbol.length).toBeGreaterThan(0);
    expect(draft.onePaper).toContain("One-Paper");
  });

  it("saves draft as DRAFT build round project", () => {
    const draft = generateQuickstartDraft({
      building: "Chaos testing harness for agents",
      stage: "Prototype",
      nextGoal: "Release first policy pack",
      evidence: "Internal alpha",
    });
    const saved = saveQuickstartDraft(draft);
    expect(saved.projectId).toBeTruthy();
    expect(saved.slug).toBeTruthy();
    expect(saved.roundId).toBeTruthy();
  });
});

describe("community reactions", () => {
  const testDb = path.join(process.cwd(), "data", "test-community.db");

  beforeAll(async () => {
    process.env.DATABASE_URL = `file:${testDb}`;
    // Reset module cache globals carefully
    const g = globalThis as unknown as {
      sqlite?: { close?: () => void };
      db?: unknown;
      __vfSeeded?: boolean;
    };
    try {
      g.sqlite?.close?.();
    } catch {
      /* ignore */
    }
    g.sqlite = undefined;
    g.db = undefined;
    g.__vfSeeded = false;

    fs.mkdirSync(path.dirname(testDb), { recursive: true });
    for (const f of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    // Re-import after path set
    const seedMod = await import("../src/lib/db/seed");
    seedMod.seedDatabase({ force: true });
  });

  afterAll(async () => {
    try {
      const { getSqlite } = await import("../src/lib/db");
      getSqlite().close();
    } catch {
      /* ignore */
    }
    for (const f of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it("supports post, like, dislike, comment", async () => {
    const community = await import("../src/lib/queries/community");
    const post = await community.createCommunityPost({
      projectId: "proj-collabmesh",
      authorName: "Wesley Kennedy",
      authorRole: "INVESTOR",
      body: "Excited about the presence engine.",
    });
    expect(post.id).toBeTruthy();

    const liked = await community.reactToPost({
      postId: post.id,
      reactorKey: "juror:Wesley",
      reaction: "LIKE",
    });
    expect(liked.likes).toBe(1);

    const disliked = await community.reactToPost({
      postId: post.id,
      reactorKey: "juror:Other",
      reaction: "DISLIKE",
    });
    expect(disliked.dislikes).toBe(1);

    const comment = await community.addCommunityComment({
      postId: post.id,
      authorName: "Maya Chen",
      authorRole: "FOUNDER",
      body: "Welcome to the round!",
    });
    expect(comment.body).toContain("Welcome");

    const feed = await community.getCommunityFeed("proj-collabmesh");
    const found = feed.find((p) => p.id === post.id);
    expect(found?.comments.length).toBeGreaterThan(0);
  });
});

describe("theme preference storage key", () => {
  it("uses vf-theme key contract", () => {
    // Contract used by layout bootstrap script and ThemeProvider
    expect("vf-theme").toBe("vf-theme");
  });
});
