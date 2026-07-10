Perform a strict post-refinement audit of the current VibeFunding application.

Do not add new product features during this pass.

Your goals are:

1. Verify that the identity/community/onboarding refinement was actually completed.
2. Detect regressions in previously working functionality.
3. Fix only critical or obvious P0 bugs.
4. Report the exact state of the application before we begin real AMD/Gemma and Fireworks integrations.

Read:

- README.md
- ARCHITECTURE.md
- SPRINTS.md
- IMPLEMENTATION_STATUS.md
- DESIGN_REFINEMENT_REPORT.md
- IDENTITY_AND_COMMUNITY_REPORT.md
- INVESTOR_QA_REPORT.md, if present

Inspect the implementation directly. Do not rely only on previous reports.

For every item below, answer:

- IMPLEMENTED AND FUNCTIONAL
- IMPLEMENTED BUT PRESENTATIONAL ONLY
- PARTIALLY IMPLEMENTED
- NOT IMPLEMENTED
- REGRESSION FOUND

Include the relevant route, component or file for each answer.

## 1. Brand identity

Verify:

- VibeFunding has a recognizable logo mark and wordmark.
- Brand tokens are reusable and not hardcoded separately on every page.
- Branding appears consistently in navigation, wallet, charts, Proof of Build and Agent Replay.
- The product no longer looks like a generic dashboard.
- The brand works in light and dark themes.
- Favicon and application metadata are configured.
- Project branding remains distinct from platform branding.

Explain what the actual VibeFunding visual identity is.

## 2. Themes

Verify:

- Light mode works.
- Dark mode works.
- System preference works.
- Theme persists after reload.
- No incorrect-theme flash appears on load.
- Charts remain readable.
- Gemma remains readable.
- Project pages remain readable.
- Community remains readable.
- Proof of Build remains readable.
- No components contain broken hardcoded dark-mode colors.

List any pages that still look incorrect in light mode.

## 3. Landing page

Verify:

- `/` is a real public landing page.
- Primary CTA is Investor.
- Secondary CTA is Founder.
- Product thesis is understandable within seconds.
- Capital → compute → agents → Proof of Build → value is represented visually.
- Sardinhas, Computers People and Tubarões are explained.
- Gemma is introduced.
- Proof of Build is introduced.
- Featured project links into the product.
- CTAs lead to the correct login or onboarding flow.
- The page works on mobile.

## 4. Demo login and session

Verify:

- `/login` exists.
- Any display name and non-empty password work.
- Password is not persisted.
- Investor is the default role.
- Display name persists after reload.
- Initials/avatar are generated.
- User name appears near the wallet or account control.
- Logout works.
- Role switching works.
- Demo reset does not unexpectedly erase the display name.
- No fixed seeded user name remains visible where the personalized identity should appear.

State exactly where session data is stored.

## 5. Investor-first onboarding

Verify:

- First login lands in Investor experience.
- Gemma gives a personalized briefing.
- A recommended opportunity is visible.
- Build Rounds and Proof of Build are understandable without a tutorial.
- The first screen is not overloaded.
- All onboarding actions link to working pages.

## 6. Founder Quickstart

Verify:

- “Create a project with Gemma” exists.
- Manual creation remains available.
- The quickstart asks only a small number of questions.
- Gemma generates an editable draft.
- Draft contains project information, Build Round, resources, risks, returns, Project Token, NFT/benefit and One-Paper.
- The generated draft can be edited.
- The draft can be regenerated.
- Preview as Investor works.
- Save as draft works and persists.
- Nothing is automatically published.
- The UI clearly states that founders remain in control.

Clarify whether this currently uses deterministic Demo Mode logic or a real Gemma provider.

## 7. Community

Verify:

- Every detailed project has a Community tab or route.
- Founder/team posts exist.
- Investor posts exist.
- Comments work and persist.
- Likes work and persist.
- Dislikes work and persist.
- New posts can be created and persist.
- Role badges display correctly.
- Posts can reference Build Rounds, Agent Runs or Proofs of Build.
- Community actions survive reload.
- Community data resets correctly.
- Investor and Founder identities are represented correctly.

Test repeated likes/dislikes and ensure counters cannot be accidentally inflated through simple repeated clicks unless intentionally designed.

## 8. Project external presence

Verify:

- Website link exists where configured.
- Repository link exists where configured.
- Telegram, Instagram, X/Twitter, Discord and docs are supported.
- Only configured links are displayed.
- Icons and labels are accessible.
- Links open correctly.
- No placeholder or invalid links appear in normal use.

## 9. Project identity

Verify that detailed projects support:

- Logo.
- Cover.
- Brand colors.
- Screenshots or media.
- Video-ready space.
- Team.
- One-Paper.
- Project Token visual.
- NFT artwork.
- Social links.
- Community activity.
- Build Rounds.
- Agent activity.
- Proofs of Build.

Confirm whether each detailed project actually has distinct branding or merely uses the same layout with different text.

## 10. Gemma identity

Verify:

- Gemma has a distinctive visual identity.
- Gemma is not just a generic sparkle icon.
- Floating Gemma works across normal pages.
- Floating Gemma does not permanently reduce page width.
- It opens and closes correctly.
- It knows the current page.
- It knows the current project.
- It knows the current portfolio.
- It uses the personalized user name.
- Contextual insight changes by page.
- Gemma states such as analyzing/reporting are visually represented.
- `/gemma` is an intelligence center, not only a chat screen.

Verify the dedicated Gemma page contains:

- Personalized briefing.
- Opportunity matches.
- Portfolio intelligence.
- Reports.
- Important Proofs and project updates.

State which responses are currently deterministic, cached or generated.

## 11. Wallet

Verify:

- Wallet is persistent in the top navigation.
- VIBE balance is correct.
- Hide/show balance works.
- Preference persists.
- Project Tokens are visible.
- NFTs are visible.
- Pending contributions are visible.
- Verified contributions are visible.
- Personalized identity appears.
- Allocation causes a smooth and correct wallet update.
- Wallet values remain correct after reload.
- Wallet values return to original state after reset.

## 12. Allocation semantics

Re-test all resource types.

### VIBE

Verify:

- Immediate settlement.
- Balance decreases.
- Build Units are calculated.
- Build Round progresses.
- Project Tokens are released immediately.
- NFT releases only when threshold conditions are met.
- Portfolio and activity update.
- Reload preserves everything.

### AMD GPU hours

Verify:

- Contribution becomes pending.
- No final Project Tokens are released before verification.
- Estimated Build Units are shown.
- Estimated reward is shown.
- Verification action works.
- Verified contribution releases rewards exactly once.

### Agent hours

Verify the same pending → verified → released flow.

### Agentic/model credits

Verify the same pending → verified → released flow.

Confirm:

- Rewards are calculated from Build Units, not raw amounts.
- Conversion rates are configurable.
- Different resource types produce economically consistent values.
- Zero, negative, excessive and malformed amounts are rejected.
- Double-click cannot create duplicate allocations.
- Verification cannot release rewards twice.

Provide the current conversion table.

## 13. Reward UX

Verify:

- Allocation success is visually satisfying but not casino-like.
- Project Token reward is clearly shown.
- Wallet balance animates or updates clearly.
- Build Round progress updates clearly.
- NFT reveal exists when applicable.
- NFT name, artwork and utility are shown.
- “View in Wallet” works.
- “Join Community” works.
- “Watch Agents” works.

## 14. Agent Observability

Verify no regression in:

- Agent Runs.
- Play.
- Pause.
- Speed controls.
- Skip to result.
- Timeline.
- Tests.
- Files changed.
- Commit.
- Compute source.
- Build Round association.
- Proof association.
- Visibility rules.
- Secret sanitization.
- Mobile usability.

Confirm whether runs are labeled with product language such as “Recorded execution” instead of internal Demo Mode terminology.

## 15. Proof of Build

Verify no regression in:

- Executive summary.
- Funded objective.
- Built output.
- Resources consumed.
- Tests.
- Commit.
- Artifacts.
- SHA-256 hashes.
- Canonical manifest.
- Manifest verification.
- Visibility rules.
- Gemma explanation.
- Project branding.
- Build Round link.
- Agent Run link.

Confirm whether artifact hashes are actually calculated.

Confirm whether manifest verification is deterministic.

Confirm no private fields enter the public manifest.

## 16. Navigation

Click every visible navigation item and CTA.

Check for:

- 404 routes.
- Buttons that do nothing.
- Incorrect back links.
- Broken project tabs.
- Community links.
- One-Paper links.
- Social links.
- Wallet links.
- Founder links.
- Gemma links.
- Landing-page CTAs.
- Login and logout redirects.

## 17. Responsive audit

Test at minimum:

- 1440px desktop.
- 1024px laptop/tablet.
- 768px tablet.
- 390px mobile.

Audit:

- Landing page.
- Login.
- Discover.
- Portfolio.
- Project detail.
- Community.
- Allocation.
- Reward reveal.
- Wallet.
- Floating Gemma.
- Gemma page.
- Agent Replay.
- Proof of Build.
- Founder Quickstart.

## 18. Regression testing

Re-run the original Investor vertical slice:

1. Reset.
2. Login with a custom name.
3. Discover a project.
4. Allocate VIBE.
5. Verify holdings.
6. Reload.
7. Pledge productive capacity.
8. Verify pending state.
9. Approve verification.
10. Verify reward release.
11. Watch agent execution.
12. Open Proof of Build.
13. Join community.
14. Comment on an update.
15. Switch to Founder.
16. Generate a stakeholder update.
17. Return to Investor.
18. Verify the update is visible.
19. Reset.
20. Confirm deterministic original state.

## 19. Technical validation

Run:

- npm run lint
- npm run typecheck
- npm run test
- npm run build

Also test:

- `/api/health`
- seed idempotency
- demo reset
- Docker build
- Docker startup
- application on `0.0.0.0:3000`

Do not run `npm audit fix --force`.

## 20. Required report

Create `PRE_INTEGRATION_AUDIT.md`.

Include:

- Feature matrix with status for every section above.
- Exact routes and files.
- Regressions found.
- Regressions fixed.
- Presentational-only features.
- Mock/deterministic features.
- Persistent features.
- Remaining P0 bugs.
- Remaining P1 polish.
- Tests executed.
- Build result.
- Docker result.
- Recommendation on whether the application is ready for AMD/Gemma integration.

At the end, answer these questions directly:

1. Is the Investor journey complete and functional?
2. Is the Founder Quickstart complete and functional?
3. Is Community complete and persistent?
4. Are all resource types economically normalized?
5. Are productive contributions correctly pending until verified?
6. Is Project Token/NFT settlement correct?
7. Is Gemma structurally ready for a live provider?
8. Is the app free of visible Demo Mode terminology?
9. Are light and dark themes complete?
10. Does the application have a recognizable VibeFunding identity?
11. Did any previous functionality regress?
12. Is the Dockerized application ready for external evaluation?
13. What are the three biggest remaining risks before submission?
14. Should the next engineering task be AMD/Gemma integration?

Fix only clear P0 regressions discovered during the audit. Do not begin external integrations in this pass.