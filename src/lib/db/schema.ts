import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  activeRole: text("active_role", { enum: ["INVESTOR", "FOUNDER"] })
    .notNull()
    .default("INVESTOR"),
  vibeBalance: real("vibe_balance").notNull().default(0),
  bio: text("bio"),
  createdAt: text("created_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  stage: text("stage").notNull(),
  status: text("status", { enum: ["ACTIVE", "PAUSED", "COMPLETED"] })
    .notNull()
    .default("ACTIVE"),
  logoEmoji: text("logo_emoji").notNull().default("◆"),
  accentColor: text("accent_color").notNull().default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#22d3ee"),
  repositoryUrl: text("repository_url"),
  websiteUrl: text("website_url"),
  socialLinks: text("social_links").notNull().default("{}"),
  brandPattern: text("brand_pattern").default("nodes"),
  founderId: text("founder_id")
    .notNull()
    .references(() => users.id),
  visibility: text("visibility", { enum: ["PUBLIC", "PARTIAL", "PRIVATE"] })
    .notNull()
    .default("PUBLIC"),
  techStack: text("tech_stack").notNull().default("[]"),
  metrics: text("metrics").notNull().default("{}"),
  risks: text("risks").notNull().default("[]"),
  history: text("history").notNull().default("[]"),
  tokenSymbol: text("token_symbol"),
  tokenName: text("token_name"),
  detailed: integer("detailed", { mode: "boolean" }).notNull().default(false),
  trendingScore: integer("trending_score").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const buildRounds = sqliteTable("build_rounds", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  status: text("status", {
    enum: ["DRAFT", "OPEN", "FUNDED", "BUILDING", "COMPLETED"],
  })
    .notNull()
    .default("DRAFT"),
  targetValue: real("target_value").notNull(),
  fundedValue: real("funded_value").notNull().default(0),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at"),
  expectedDeliverables: text("expected_deliverables").notNull().default("[]"),
  risks: text("risks").notNull().default("[]"),
  publicSummary: text("public_summary"),
  createdAt: text("created_at").notNull(),
});

export const resourceRequirements = sqliteTable("resource_requirements", {
  id: text("id").primaryKey(),
  buildRoundId: text("build_round_id")
    .notNull()
    .references(() => buildRounds.id),
  type: text("type", {
    enum: [
      "VIBE",
      "STABLECOIN",
      "AGENT_TOKENS",
      "AGENT_HOURS",
      "AMD_GPU_HOURS",
      "COMPUTE_UNITS",
    ],
  }).notNull(),
  targetAmount: real("target_amount").notNull(),
  fundedAmount: real("funded_amount").notNull().default(0),
  unit: text("unit").notNull(),
  label: text("label").notNull(),
});

export const returnMechanisms = sqliteTable("return_mechanisms", {
  id: text("id").primaryKey(),
  buildRoundId: text("build_round_id")
    .notNull()
    .references(() => buildRounds.id),
  type: text("type", {
    enum: [
      "PROJECT_TOKEN",
      "VIBE",
      "NFT",
      "DIRECT_PAYMENT",
      "BUYBACK",
      "REVENUE_SHARE",
      "PRODUCT_ACCESS",
      "DISCOUNT",
    ],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  simulated: integer("simulated", { mode: "boolean" }).notNull().default(true),
  terms: text("terms"),
});

export const allocations = sqliteTable("allocations", {
  id: text("id").primaryKey(),
  investorId: text("investor_id")
    .notNull()
    .references(() => users.id),
  buildRoundId: text("build_round_id")
    .notNull()
    .references(() => buildRounds.id),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  resourceType: text("resource_type", {
    enum: [
      "VIBE",
      "STABLECOIN",
      "AGENT_TOKENS",
      "AGENT_HOURS",
      "AMD_GPU_HOURS",
      "COMPUTE_UNITS",
    ],
  }).notNull(),
  amount: real("amount").notNull(),
  normalizedValue: real("normalized_value").notNull(),
  buildUnits: real("build_units").notNull().default(0),
  rewardTokens: real("reward_tokens").notNull().default(0),
  rewardNftId: text("reward_nft_id"),
  settlementStatus: text("settlement_status", {
    enum: [
      "IMMEDIATE",
      "PENDING_VERIFICATION",
      "VERIFIED",
      "REWARD_RELEASED",
    ],
  })
    .notNull()
    .default("IMMEDIATE"),
  verifiedAt: text("verified_at"),
  createdAt: text("created_at").notNull(),
});

export const holdings = sqliteTable("holdings", {
  id: text("id").primaryKey(),
  investorId: text("investor_id")
    .notNull()
    .references(() => users.id),
  projectId: text("project_id").references(() => projects.id),
  assetType: text("asset_type", {
    enum: ["PROJECT_TOKEN", "VIBE", "NFT"],
  }).notNull(),
  assetSymbol: text("asset_symbol").notNull(),
  assetName: text("asset_name").notNull(),
  amount: real("amount").notNull(),
  simulatedValue: real("simulated_value"),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const nfts = sqliteTable("nfts", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageEmoji: text("image_emoji").notNull().default("◈"),
  rarity: text("rarity").notNull().default("Common"),
  utility: text("utility").notNull().default("[]"),
  simulated: integer("simulated", { mode: "boolean" }).notNull().default(true),
});

export const agentRuns = sqliteTable("agent_runs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  buildRoundId: text("build_round_id").references(() => buildRounds.id),
  taskTitle: text("task_title").notNull(),
  taskDescription: text("task_description").notNull(),
  agentName: text("agent_name").notNull(),
  harness: text("harness").notNull(),
  model: text("model").notNull(),
  provider: text("provider").notNull(),
  status: text("status", {
    enum: ["QUEUED", "RUNNING", "WAITING", "FAILED", "COMPLETED"],
  })
    .notNull()
    .default("QUEUED"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  publicSummary: text("public_summary"),
  visibility: text("visibility", {
    enum: ["PUBLIC", "INVESTORS", "FOUNDER_ONLY"],
  })
    .notNull()
    .default("PUBLIC"),
  computeSource: text("compute_source").notNull().default("AMD Developer Cloud"),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  computeTimeSeconds: integer("compute_time_seconds").default(0),
  filesChanged: integer("files_changed").default(0),
  linesAdded: integer("lines_added").default(0),
  linesRemoved: integer("lines_removed").default(0),
  testsTotal: integer("tests_total").default(0),
  testsPassed: integer("tests_passed").default(0),
  testsFailed: integer("tests_failed").default(0),
  commitHash: text("commit_hash"),
  replayLabel: text("replay_label").notNull().default("Demo replay"),
  createdAt: text("created_at").notNull(),
});

export const agentEvents = sqliteTable("agent_events", {
  id: text("id").primaryKey(),
  runId: text("run_id")
    .notNull()
    .references(() => agentRuns.id),
  sequence: integer("sequence").notNull(),
  type: text("type", {
    enum: [
      "RUN_STARTED",
      "PLANNING",
      "READING_FILE",
      "TOOL_CALL",
      "FILE_CHANGED",
      "TEST_STARTED",
      "TEST_COMPLETED",
      "COMMIT_CREATED",
      "ARTIFACT_CREATED",
      "RUN_COMPLETED",
      "RUN_FAILED",
    ],
  }).notNull(),
  title: text("title").notNull(),
  publicMessage: text("public_message").notNull(),
  privatePayload: text("private_payload"),
  visibility: text("visibility", {
    enum: ["PUBLIC", "INVESTORS", "FOUNDER_ONLY"],
  })
    .notNull()
    .default("PUBLIC"),
  delayMs: integer("delay_ms").notNull().default(600),
  createdAt: text("created_at").notNull(),
});

export const proofsOfBuild = sqliteTable("proofs_of_build", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  buildRoundId: text("build_round_id").references(() => buildRounds.id),
  agentRunId: text("agent_run_id")
    .notNull()
    .references(() => agentRuns.id),
  taskTitle: text("task_title").notNull(),
  taskDescription: text("task_description").notNull(),
  agentName: text("agent_name").notNull(),
  harness: text("harness").notNull(),
  model: text("model").notNull(),
  provider: text("provider").notNull(),
  computeSource: text("compute_source").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  computeTimeSeconds: integer("compute_time_seconds"),
  normalizedCost: real("normalized_cost"),
  filesChanged: integer("files_changed").notNull().default(0),
  linesAdded: integer("lines_added").notNull().default(0),
  linesRemoved: integer("lines_removed").notNull().default(0),
  testsTotal: integer("tests_total"),
  testsPassed: integer("tests_passed"),
  testsFailed: integer("tests_failed"),
  commitHash: text("commit_hash"),
  repositoryUrl: text("repository_url"),
  artifactRootHash: text("artifact_root_hash").notNull(),
  manifestHash: text("manifest_hash").notNull(),
  manifestJson: text("manifest_json").notNull(),
  verificationStatus: text("verification_status", {
    enum: ["RECORDED", "HASH_VERIFIED", "HUMAN_VERIFIED"],
  })
    .notNull()
    .default("RECORDED"),
  publicSummary: text("public_summary").notNull(),
  gemmaSummary: text("gemma_summary"),
  createdAt: text("created_at").notNull(),
});

export const proofArtifacts = sqliteTable("proof_artifacts", {
  id: text("id").primaryKey(),
  proofId: text("proof_id")
    .notNull()
    .references(() => proofsOfBuild.id),
  type: text("type", {
    enum: ["DIFF", "TEST_REPORT", "LOG", "COMMIT", "FILE", "SCREENSHOT", "BUILD"],
  }).notNull(),
  name: text("name").notNull(),
  path: text("path"),
  hash: text("hash").notNull(),
  size: integer("size"),
  visibility: text("visibility", {
    enum: ["PUBLIC", "INVESTORS", "FOUNDER_ONLY"],
  })
    .notNull()
    .default("PUBLIC"),
  contentPreview: text("content_preview"),
});

export const stakeholderUpdates = sqliteTable("stakeholder_updates", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  buildRoundId: text("build_round_id").references(() => buildRounds.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status", {
    enum: ["DRAFT", "APPROVED", "PUBLISHED"],
  })
    .notNull()
    .default("DRAFT"),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const gemmaInsights = sqliteTable("gemma_insights", {
  id: text("id").primaryKey(),
  context: text("context").notNull(),
  projectId: text("project_id"),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  risks: text("risks").notNull().default("[]"),
  strengths: text("strengths").notNull().default("[]"),
  questions: text("questions").notNull().default("[]"),
  portfolioImpact: text("portfolio_impact"),
  sources: text("sources").notNull().default("[]"),
  provider: text("provider", {
    enum: ["AMD_GEMMA", "CACHE", "DEMO"],
  })
    .notNull()
    .default("DEMO"),
  generatedAt: text("generated_at").notNull(),
});

export const gemmaMessages = sqliteTable("gemma_messages", {
  id: text("id").primaryKey(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  context: text("context").notNull(),
  projectId: text("project_id"),
  provider: text("provider", {
    enum: ["AMD_GEMMA", "CACHE", "DEMO"],
  })
    .notNull()
    .default("DEMO"),
  createdAt: text("created_at").notNull(),
});

export const demoState = sqliteTable("demo_state", {
  id: text("id").primaryKey().default("default"),
  activeRole: text("active_role", { enum: ["INVESTOR", "FOUNDER"] })
    .notNull()
    .default("INVESTOR"),
  activeUserId: text("active_user_id").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const communityPosts = sqliteTable("community_posts", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role", {
    enum: ["FOUNDER", "TEAM", "INVESTOR", "COMPUTE_PROVIDER", "TOKEN_HOLDER"],
  }).notNull(),
  body: text("body").notNull(),
  buildRoundId: text("build_round_id"),
  proofId: text("proof_id"),
  agentRunId: text("agent_run_id"),
  likes: integer("likes").notNull().default(0),
  dislikes: integer("dislikes").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const communityComments = sqliteTable("community_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => communityPosts.id),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role", {
    enum: ["FOUNDER", "TEAM", "INVESTOR", "COMPUTE_PROVIDER", "TOKEN_HOLDER"],
  }).notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const communityReactions = sqliteTable("community_reactions", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => communityPosts.id),
  reactorKey: text("reactor_key").notNull(),
  reaction: text("reaction", { enum: ["LIKE", "DISLIKE"] }).notNull(),
  createdAt: text("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type BuildRound = typeof buildRounds.$inferSelect;
export type ResourceRequirement = typeof resourceRequirements.$inferSelect;
export type ReturnMechanism = typeof returnMechanisms.$inferSelect;
export type Allocation = typeof allocations.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type Nft = typeof nfts.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type AgentEvent = typeof agentEvents.$inferSelect;
export type ProofOfBuild = typeof proofsOfBuild.$inferSelect;
export type ProofArtifact = typeof proofArtifacts.$inferSelect;
export type StakeholderUpdate = typeof stakeholderUpdates.$inferSelect;
export type GemmaInsight = typeof gemmaInsights.$inferSelect;
export type DemoState = typeof demoState.$inferSelect;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type CommunityComment = typeof communityComments.$inferSelect;
