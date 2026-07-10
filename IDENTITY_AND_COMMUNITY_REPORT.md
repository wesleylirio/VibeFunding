# Identity & Community Report

## Brand system created

- **VibeMark** logo: capital → compute → proof node flow (SVG)
- Wordmark treatment + favicon (`public/favicon.svg`)
- Brand color tokens: flow, compute, agent, proof, value
- Shared surfaces, borders, glow, flow-line utilities
- Empty/loading/success via existing card system + reveal animations
- Brand appears in sidebar, landing, Gemma orb, progress accents — not logo spam

## Light and dark mode

- Full **light**, **dark**, and **system** preferences
- `ThemeProvider` + anti-FOUC bootstrap script in root layout
- Preference persisted in `localStorage` (`vf-theme`)
- Charts use CSS variables for grid/tooltip in both themes
- Theme selector in header and landing/login

## Landing page

- `/` explains product before entry
- Primary CTA: **Explore as Investor**
- Secondary CTA: **Launch as Founder**
- Hero, capital→value flow diagram, participants (Sardinhas / Computers People / Tubarões), Gemma, Proof of Build, featured CollabMesh

## Login status

- `/login` demo login
- Any name + password (password discarded, never stored)
- Role Investor (default) or Founder
- Cookie `vf_juror` persists display name, initials, role, onboarding flags
- Logout clears cookie
- App routes require juror session

## Investor default flow

- Default role Investor
- Post-login → portfolio
- First-run **OnboardingCard**: briefing, Build Rounds, recommended project, Proof, allocate
- Dismissible; flag persisted in session cookie

## Founder Quickstart

- `/founder/quickstart` — Create a project with Gemma
- Four questions → animated generation → editable draft
- Save as DRAFT project + Build Round + resources/returns
- Explicit “Create manually” path
- Gemma never publishes automatically

## Community status

- `/projects/[slug]/community`
- Seeded posts for detailed projects
- Persist: post, comment, like, dislike
- Role badges: Founder, Team, Investor, Compute Provider, Token Holder
- Links to Proof / Agent runs when present

## Project social links

- `socialLinks` JSON on projects (website, repo, telegram, x, discord, docs)
- Compact icons in project hero
- Only non-empty links rendered

## Gemma identity changes

- Custom **GemmaOrb** (context ring + core), not generic sparkle
- States: idle, analyzing, monitoring, founder, proof, etc.
- Floating assistant greets juror by first name
- Intelligence center: Your Briefing, Matches, Portfolio Intelligence, Reports

## Wallet changes

- VIBE + hide/show + tokens + NFTs
- Shows juror initials/name
- Pending productive contributions section
- Smooth balance tick animation

## Responsive validation

- Landing CTAs stack on mobile
- Login form single column
- Wallet compact on small screens
- Theme selector + role switch remain reachable
- Project tabs horizontally scroll
- Floating Gemma above mobile nav

## Tests executed

- Juror session parse/initials
- Founder quickstart generate + save
- Community post/like/dislike/comment
- Existing conversion, allocation, proof hash suites

## Build result

- `npm run typecheck`
- `npm run test`
- `npm run lint`
- `npm run build`

## Known limitations

- Quickstart client shell uses static Founder name until full cookie read on client (server founder pages use juror name)
- Community has no moderation
- Social links are product-facing placeholders for demo projects
- Theme system preference requires browser matchMedia
- Real auth intentionally out of scope
