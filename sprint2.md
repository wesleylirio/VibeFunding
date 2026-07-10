You are beginning the first real external AI integration for VibeFunding.

The Demo Mode application is already product-complete and must remain stable.

This pass has only two goals:

1. Prove the application is reproducibly containerized.
2. Connect the existing Gemma product experiences to a real Gemma 4 model hosted on AMD Developer Cloud.

Do not add new product features.
Do not redesign the application.
Do not integrate Fireworks yet.
Do not remove deterministic fallbacks.

Before changing anything, read:

1. README.md
2. ARCHITECTURE.md
3. SPRINTS.md
4. IMPLEMENTATION_STATUS.md
5. PRE_INTEGRATION_AUDIT.md
6. IDENTITY_AND_COMMUNITY_REPORT.md
7. DESIGN_REFINEMENT_REPORT.md

Inspect the existing Gemma gateway implementation directly. Do not assume that AmdGemmaGateway is complete merely because the class exists.

# Phase 0 — Stable checkpoint

Before integration work:

1. Run:
   - npm run lint
   - npm run typecheck
   - npm run test
   - npm run build

2. If git is available:
   - Ensure secrets and `.env` files are ignored.
   - Commit the current stable Demo Mode state.
   - Create a tag or clearly named checkpoint such as:
     `pre-amd-gemma-integration`

3. Do not commit API keys, Hugging Face tokens, SSH keys, model files, SQLite runtime data containing secrets, or cloud credentials.

# Phase 1 — Clean Docker smoke test

The application must be proven from Docker before the live provider is introduced.

Requirements:

- Preserve the developer’s current local database.
- Use a temporary or fresh Demo Mode database for the smoke test.
- Build the image from scratch.
- Start the complete application through Docker Compose.
- Verify `/api/health` returns HTTP 200.
- Verify the landing page loads.
- Verify login works.
- Verify the Investor portfolio loads.
- Verify one persistent allocation through the container.
- Verify restart persistence if a Docker volume is intended.
- Verify Demo reset.
- Verify the container binds to `0.0.0.0:3000`.

Do not delete the developer’s current database or working data.

Document the exact commands and results.

If native `better-sqlite3` compilation fails, fix the Docker build correctly. Do not bypass SQLite persistence or replace it with in-memory storage.

# Phase 2 — Gemma provider architecture

Preserve these provider modes:

```text
auto
amd
mock
Expected behavior:
GEMMA_PROVIDER=amd
Requires the AMD-hosted endpoint.
Fails clearly during health diagnostics if unavailable.
Normal product requests still receive a graceful fallback rather than crashing the application.
GEMMA_PROVIDER=mock
Uses deterministic existing responses.
Requires no external credentials.
GEMMA_PROVIDER=auto
Attempts AMD first.
Falls back to cached responses.
Falls back to deterministic responses last.
Does not expose internal provider failure messages to normal users.
Environment variables:
GEMMA_PROVIDER=auto
GEMMA_BASE_URL=
GEMMA_API_KEY=
GEMMA_MODEL=google/gemma-4-12B-it
GEMMA_TIMEOUT_MS=30000
GEMMA_MAX_OUTPUT_TOKENS=2048
Do not hardcode:
Endpoint IP;
API key;
Cloud provider hostname;
Model ID;
Authentication headers.
All provider calls must happen server-side.
Phase 3 — Real AMD Gemma gateway
Implement or complete AmdGemmaGateway.
The target server should expose an OpenAI-compatible API when possible.
Support:
System instructions;
Multi-turn messages;
Temperature;
Maximum output tokens;
Abort/timeout;
Provider metadata;
Model metadata;
Request ID;
Latency;
Error normalization.
Do not send the full database to the model.
Build minimal, contextual payloads containing only the data required for the current task.
Do not send:
Passwords;
Cookies;
API keys;
Private agent payloads;
Environment variables;
Private source code;
Founder-only information to Investor contexts;
Internal database IDs unless technically required.
Phase 4 — Structured Gemma capabilities
Connect the live provider to these existing product capabilities.
1. Portfolio briefing
Gemma receives:
Investor display name;
Holdings summary;
Current allocations;
Category and stage exposure;
Pending productive contributions;
Recent Proofs of Build;
Recent stakeholder updates.
Gemma returns:
Executive briefing;
Important changes;
Risks;
Portfolio concentration;
Projects requiring attention;
Opportunity suggestions.
2. Project due diligence
Gemma receives:
Public project information;
Founder/team information;
Traction;
Current Build Round;
Resource requirements;
Return mechanisms;
Previous Proofs of Build;
Recent public agent activity.
Gemma returns:
Summary;
Strengths;
Risks;
Open questions;
Execution assessment;
Build Round assessment;
Portfolio relevance.
3. Proof of Build explanation
Gemma receives:
Canonical public proof data;
Task;
Resource usage;
Tests;
Artifacts;
Verification status;
Commit metadata.
Gemma returns:
What was funded;
What was produced;
What evidence exists;
What remains unverified;
Investor-friendly explanation.
Gemma must never claim that a Proof of Build guarantees code correctness or project success.
4. Founder Quickstart
Replace deterministic draft generation with live Gemma when AMD is available.
The output must remain an editable draft.
Generate:
Project identity;
Pitch;
Problem;
Solution;
Audience;
Current stage;
Build Round objective;
Deliverables;
Suggested sprint draft;
Resource estimate;
Build Units estimate;
Risks;
Return mechanisms;
Project Token concept;
NFT or access benefit;
Investor summary;
One-Paper draft.
Founders retain control.
Nothing is automatically published.
Deterministic generation remains the fallback.
5. Stakeholder update
Gemma receives:
Public Agent Events;
Build Round progress;
Proofs of Build;
Resources consumed;
Deliverables completed;
Founder-provided notes.
Gemma generates an editable stakeholder update.
It must not publish automatically.
6. Contextual chat
The floating Gemma assistant must use the current page context:
Portfolio;
Discover;
Project;
Build Round;
Agent Run;
Proof of Build;
Community;
Founder workspace.
Do not provide unrestricted database access through chat.
Phase 5 — Structured output validation
Do not trust arbitrary model output.
For every structured capability:
Define a Zod schema.
Request JSON or reliably parse structured output.
Validate the response.
Reject malformed output.
Retry once with a corrective schema prompt when appropriate.
Fall back to cached/deterministic output if validation still fails.
Store:
Provider;
Model;
Generated timestamp;
Latency;
Request ID;
Validated response;
Context type.
Do not store hidden reasoning or chain-of-thought.
Phase 6 — Caching and resilience
Live Gemma must never become a single point of failure.
Requirements:
Cache successful responses by context hash.
Avoid repeated inference for unchanged contexts.
Add a reasonable cache TTL.
Allow explicit refresh.
Preserve the latest valid response when AMD is unavailable.
Do not display raw provider errors to investors.
Do not show “Demo Mode”, “Mock”, “Cached Demo” or hackathon terminology in normal product UI.
When a response is genuinely live, show a subtle positive attribution such as:
Gemma 4 · AMD Instinct
or:
Powered by Gemma on AMD
Do not show the endpoint, IP address or API key.
When fallback is active, simply show Gemma without falsely claiming a live AMD response.
Phase 7 — Health and diagnostics
Create a server-side diagnostic endpoint:
GET /api/gemma/health
It may return:
{
  "configured": true,
  "reachable": true,
  "provider": "amd",
  "model": "google/gemma-4-12B-it",
  "latencyMs": 824,
  "lastCheckedAt": "..."
}
It must never expose:
API keys;
Authorization headers;
Full endpoint credentials;
User prompts;
Private data.
Normal users do not need to see this endpoint’s raw output.
Add a small internal diagnostics page or script only if one already fits the architecture. Do not add a new public admin product.
Phase 8 — AMD deployment support
Create:
infra/amd/
├── README.md
├── env.example
├── verify-gpu.sh
├── verify-endpoint.sh
└── start-server.sh
The documentation must cover:
Confirming the MI300X is visible;
Confirming ROCm/PyTorch can access the GPU;
Providing the Hugging Face token securely;
Downloading the configured Gemma model;
Starting an OpenAI-compatible inference server;
Binding the inference port;
Testing /v1/models;
Testing one chat request;
Connecting VibeFunding through environment variables;
Shutting down and destroying cloud resources safely.
Do not describe any command as tested unless it was actually tested.
Use google/gemma-4-12B-it as the initial recommended model, but keep the model configurable.
Prefer vLLM if the current ROCm/vLLM environment supports Gemma 4 correctly.
If Gemma 4 is not supported by the installed vLLM version:
Do not silently downgrade to Gemma 2.
Record the incompatibility.
Upgrade to a compatible current serving stack or use a minimal Transformers/PyTorch endpoint.
Preserve the OpenAI-compatible contract expected by the application where possible.
Do not spend time optimizing speculative decoding, multimodal inputs, quantization or maximum throughput until basic inference works.
Phase 9 — Evidence for submission
Create:
AMD_GEMMA_INTEGRATION.md
Include:
AMD hardware used;
Model used;
Serving framework;
Application contexts using Gemma;
Configuration flow;
Health-check result;
Example sanitized request;
Example sanitized response;
Observed latency;
Fallback design;
Security boundaries;
Limitations.
Prepare an evidence/amd/ directory for manually supplied:
AMD cloud screenshot;
GPU information screenshot;
Model server logs;
Successful Gemma response;
VibeFunding UI showing live AMD attribution.
Do not fabricate screenshots or evidence.
Phase 10 — Tests
Add tests for:
Provider selection;
AMD request formatting;
Timeout;
AMD failure fallback;
Cache hit;
Cache invalidation;
Structured output validation;
Malformed response retry;
Project visibility boundaries;
Portfolio context filtering;
Proof context filtering;
Founder Quickstart live-to-fallback behavior;
Health endpoint redaction.
Re-run:
npm run lint
npm run typecheck
npm run test
npm run build
Docker clean smoke test
Do not run npm audit fix --force.
Completion criteria
This pass is complete only when:
The stable Demo Mode remains functional.
Docker has been smoke-tested.
A real AMD-hosted Gemma response reaches VibeFunding.
At least project due diligence works with live Gemma.
At least portfolio briefing works with live Gemma.
At least Proof of Build explanation works with live Gemma.
Founder Quickstart uses live Gemma when available.
All live functions fall back gracefully.
No secret reaches the client.
The UI identifies genuine AMD responses accurately.
Tests and production build pass.
The integration is documented with truthful evidence.
Create AMD_INTEGRATION_REPORT.md with:
Docker smoke result;
Provider implementation;
Model used;
Endpoint status;
Product capabilities connected;
Live requests confirmed;
Cache behavior;
Fallback behavior;
Tests;
Build result;
Remaining limitations;
Exact manual steps still required from the developer.
Do not begin Fireworks integration in this pass.
Begin now with the stable checkpoint and clean Docker smoke test, then complete the application-side AMD Gemma integration