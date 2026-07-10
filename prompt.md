You completed the previous design and UX refinement successfully.

This next pass is a focused PRODUCT IDENTITY, ONBOARDING, COMMUNITY and GEMMA EXPERIENCE refinement.

Do not rebuild the application from scratch.

Preserve all existing working functionality:

- Investor allocation flow;
- Build Units normalization;
- Immediate and verified settlement states;
- Wallet persistence;
- Project Tokens;
- NFTs;
- Portfolio;
- Discover;
- Agent Observability;
- Proof of Build;
- Founder dashboard;
- Gemma contextual responses;
- Demo reset;
- Database persistence;
- Docker setup.

Before changing code, read:

1. README.md
2. ARCHITECTURE.md
3. SPRINTS.md
4. IMPLEMENTATION_STATUS.md
5. DESIGN_REFINEMENT_REPORT.md
6. INVESTOR_QA_REPORT.md, if present

Then inspect the current implementation and create a concise internal plan.

Do not stop only to present the plan. Begin implementation immediately.

# Main objective

Make VibeFunding feel like a real, memorable product with its own identity.

The current product may already look polished, but it must stop feeling like a generic Web3 dashboard or a collection of well-designed components.

The next version must communicate a recognizable VibeFunding brand through:

- Visual language;
- Typography;
- Icons;
- Motion;
- Layout details;
- Wallet experience;
- Project cards;
- Gemma;
- Proof of Build;
- Community;
- Onboarding;
- Light and dark themes.

The product should feel like the investment layer of the agentic economy.

It must be modern, visual and Web3-native, while remaining credible and avoiding casino, memecoin or excessive cyberpunk aesthetics.

# 1. VibeFunding brand identity

Create a stronger platform identity.

The brand should communicate:

- Capital becoming compute;
- Compute becoming agentic work;
- Agentic work becoming Proof of Build;
- Proof of Build becoming project value;
- Distributed participation;
- Ownership;
- Networks;
- Progress.

Develop a reusable visual language around these ideas.

Possible motifs:

- Flow lines;
- Connected nodes;
- Resource streams;
- Build pulses;
- Layered proof marks;
- Token paths;
- Agent activity signals;
- Capital-to-output diagrams.

Do not use random decorative gradients without meaning.

## Brand system

Create or refine:

- VibeFunding logo mark;
- Wordmark treatment;
- App icon;
- Favicon;
- Brand color tokens;
- Accent system;
- Background surfaces;
- Border system;
- Glow system;
- Illustration primitives;
- Motion language;
- Empty-state visuals;
- Loading visuals;
- Success visuals.

The visual identity must remain recognizable in both dark and light themes.

The brand should appear subtly throughout:

- Sidebar;
- Top navigation;
- Wallet;
- Buttons;
- Progress indicators;
- Charts;
- Gemma;
- Proof of Build;
- Agent Replay;
- Community;
- Landing page.

Avoid placing the logo everywhere. Use the brand language through details.

# 2. Light and dark mode

The product currently supports only dark mode.

Implement complete support for:

- Light mode;
- Dark mode;
- System preference.

Add a theme selector in a compact and polished location.

Suggested options:

- Light;
- Dark;
- System.

Requirements:

- Persist preference;
- Respect system preference;
- Avoid flash of incorrect theme;
- Maintain contrast and readability;
- Ensure charts work in both themes;
- Ensure gradients and accents work in both themes;
- Ensure project branding remains visible;
- Ensure Proof of Build remains readable;
- Ensure Gemma remains visually distinct;
- Ensure community content remains readable.

Light mode must be intentionally designed, not a simple inversion.

Dark mode must remain premium without becoming excessively black or neon.

# 3. Landing page

Create or refine the public landing page at `/`.

The landing page must explain VibeFunding before the juror enters the product.

The default primary CTA must be:

`Explore as Investor`

The secondary CTA must be:

`Launch as Founder`

The investor path is the default journey.

## Landing page structure

### Hero

Communicate:

- What VibeFunding is;
- Why agentic compute is productive capital;
- What investors receive;
- Why Proof of Build matters.

Suggested positioning:

`Invest in the builders of the agentic economy.`

Supporting idea:

`Allocate capital, AI credits and compute to real projects. Track agents at work. Receive exposure to the value created.`

### Product flow

Create a strong visual infographic:

```text
Invest resources
→ Agents build
→ Proof of Build
→ Projects grow
→ Investors capture value
This should feel like a branded product diagram, not plain text.
Participants
Present:
Sardinhas;
Computers People;
Tubarões.
Explain each through concise visual cards.
Gemma
Show Gemma as:
Portfolio intelligence;
Project discovery;
Due diligence;
Progress analysis;
Founder communication support.
Proof of Build
Present Proof of Build as a core primitive.
Show:
What was funded;
What agents did;
What evidence exists;
What investors can verify.
Featured project
Show one visually strong project card with:
Branding;
Build Round;
Agent activity;
Proof of Build;
Project Token;
Community signal;
Allocation CTA.
Final CTA
Explore as Investor;
Launch as Founder.
Do not make the landing page excessively long.
4. Demo login and personalized session
Create or refine a demo login route.
Suggested route:
/login
The juror should be able to enter:
Display name;
Any password;
Investor or Founder role.
The UI must clearly say:
Use any name and password. No real account will be created.
Do not store the password.
Do not build real authentication.
Session behavior
Persist:
Display name;
Initials;
Active role;
Theme preference;
Wallet visibility state.
Show the juror’s name in the product instead of a fixed seeded identity.
Example:
Wallet · 49,500 VIBE
WK · Wesley Kennedy
The default role must be Investor.
The role selector must remain available after login.
Add:
Logout;
Change role;
Avatar generated from initials;
Personalized Gemma greeting.
Resetting the demo should reset product data but should not unexpectedly erase the display name unless explicitly requested.
5. Investor-first onboarding
After login, Investor should be the default experience.
The first screen should not overwhelm the juror.
Create a concise onboarding sequence or contextual first-run experience:
Gemma portfolio briefing;
A small explanation of Build Rounds;
A recommended project;
A visible Proof of Build;
A clear allocation action.
Do not create a long tutorial.
The user should understand the product through the interface itself.
6. Founder Quickstart with Gemma
Founder Mode needs a strong and fast experience.
The juror should not be required to manually fill a large form.
Create:
Create a project with Gemma
Quickstart flow
Ask only a few questions:
What are you building?
What stage is the project in?
What do you want to accomplish next?
What resources or evidence do you already have?
Gemma then generates an editable draft containing:
Temporary project name;
One-line pitch;
Project description;
Problem;
Solution;
Audience;
Current stage;
Suggested branding direction;
Suggested Build Round;
Objective;
Deliverables;
Possible sprint draft;
Resource requirements;
Estimated Build Units;
Risks;
Possible return mechanisms;
Project Token draft;
NFT or access benefit draft;
Investor summary;
One-Paper draft.
Show an animated generation sequence:
Understanding the project;
Structuring the opportunity;
Preparing the Build Round;
Estimating productive resources;
Creating investor communication;
Drafting the One-Paper.
Then show:
Review project;
Edit manually;
Regenerate;
Preview investor page;
Save as draft.
Founder control
Make it explicit that:
Gemma creates a draft;
Founders remain in control;
Every field can be manually edited;
Sprints can be defined manually;
Gemma never publishes automatically.
Always keep a visible:
Create manually
option.
7. Project community
Add a simple community experience for every detailed project.
Suggested route or tab:
/projects/[projectSlug]/community
or a project tab named:
Community
The goal is to create a sense of shared participation between:
Investors;
Founders;
Team members;
Resource contributors.
Community feed
Support:
Founder updates;
Team updates;
Investor posts;
Comments;
Likes;
Dislikes;
Author role badges;
Time;
Project branding;
Links to Build Rounds;
Links to Proofs of Build;
Links to Agent Runs.
Example author badges:
Founder;
Team;
Investor;
Compute Provider;
Token Holder.
For the MVP, all content can use persisted seeded data.
Actions must work and persist:
Like;
Dislike;
Comment;
Create post.
No complex moderation system is required.
Do not build:
Private messages;
Live chat;
Notifications infrastructure;
Complex reputation;
Full social network.
Community relationship with project progress
Founder updates should be able to reference:
Build Round;
Proof of Build;
Agent Run;
Milestone;
Stakeholder update.
This helps connect social communication with verifiable work.
8. Project social and external presence
Each detailed project should support simulated external links:
Website;
Repository;
Telegram;
Instagram;
X/Twitter;
Discord;
Documentation.
Only display links that exist for that project.
Use appropriate icons and accessible labels.
Add these to the branded project hero or a compact project link area.
Do not make social links dominate the page.
9. Project branding improvements
Every detailed project must feel like an independent venture.
Support:
Logo;
Cover image;
Brand colors;
Visual pattern;
Product screenshots;
Video placeholder;
Team avatars;
Project Token visual;
NFT artwork;
One-Paper cover;
Social links;
Website link;
Community activity.
Ensure project branding does not break the global VibeFunding design system.
Create reusable project branding tokens.
Example:
interface ProjectBrand {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  coverUrl?: string;
  visualPattern?: string;
}
10. Gemma identity
Gemma currently needs a stronger identity.
Gemma must not feel like a generic chatbot or a copied AI assistant.
Develop a recognizable Gemma identity.
Possible traits:
Distinctive orb or symbol;
Branded intelligence pulse;
Context ring;
Portfolio signal visualization;
Project-specific accent adaptation;
Calm motion;
Clear state changes.
Gemma states may include:
Listening;
Analyzing;
Comparing;
Monitoring;
Reporting;
Founder assist;
Proof analysis.
Use motion and iconography to communicate state.
Do not use a generic sparkle icon as the entire Gemma identity.
Floating Gemma
Gemma should remain accessible as a floating assistant.
It should:
Show a compact contextual insight;
Open a drawer;
Know the current page;
Use the juror’s name;
Reference the current portfolio or project;
Avoid permanently occupying large screen space.
Gemma intelligence center
Redesign /gemma as a premium intelligence experience.
Sections:
Your Briefing
Personalized greeting;
What changed;
Important portfolio events;
Proofs published;
Build Rounds needing attention.
Opportunity Matches
Projects matching profile;
Why each matches;
Risk;
Stage;
Proof evidence;
Active Build Round.
Portfolio Intelligence
Concentration;
Resource mix;
Project stage mix;
Exposure;
Recent allocations;
Assets;
Project Tokens;
NFTs.
Reports
Weekly report;
Project comparison;
Stakeholder summaries;
Important agent activity;
Build Round progress.
The page should feel like a visual AI-generated report or newsletter.
11. Wallet improvements
Keep the persistent wallet in the top navigation.
Ensure it contains:
VIBE balance;
Hide/show control;
Project Token summary;
NFT summary;
Compact dropdown;
Juror identity;
Smooth balance animation.
Wallet dropdown may include:
VIBE;
Project Tokens;
NFTs;
Pending productive contributions;
Verified contributions.
Make pending contributions visibly different from settled holdings.
12. Community and reward UX
After investing, offer useful next actions:
View holding;
Watch agents;
Open Proof of Build;
Join project community;
Follow founder updates.
After receiving an NFT:
Show branded reveal;
Explain its utility;
Add View in Wallet;
Add Join Community.
Do not use casino-like effects.
13. Navigation and project tabs
Detailed project navigation should be easy to understand.
Suggested tabs:
Overview;
Build Rounds;
Agents;
Proofs;
Community;
Team;
One-Paper.
Do not place every section on one endlessly long page.
Use route tabs or anchored sections with clear state.
Ensure direct URLs work.
14. Remove remaining generic UI
Audit and replace:
Generic icons;
Generic cards;
Repeated identical containers;
Plain system messages;
Generic empty states;
Placeholder project art;
Default button styling;
Default chart styling;
Generic Gemma visuals.
The product should remain consistent but not monotonous.
15. Copy and terminology
Keep language concise and human-readable.
Avoid excessive technical or institutional wording.
Use product terminology consistently:
Build Round;
Build Units;
Project Token;
Productive contribution;
Proof of Build;
Agent Run;
Portfolio;
Community;
Founder;
Investor;
Compute Provider.
Do not reintroduce visible:
Demo Mode;
Simulated Demo;
Hackathon labels;
Cached / Demo;
Seed data language.
Internal demo architecture may remain.
16. Responsive behavior
Validate:
Landing page;
Login;
Wallet;
Theme selector;
Floating Gemma;
Gemma intelligence center;
Project hero;
Project tabs;
Community;
Founder Quickstart;
Allocation flow;
Reward reveal;
Agent Replay;
Proof of Build.
Mobile must remain usable.
17. Tests
Add or update tests for:
Demo login;
Name persistence;
Investor default role;
Role switching;
Logout;
Wallet visibility;
Theme persistence;
System theme;
Community likes;
Community dislikes;
Community comments;
Community post creation;
Founder Quickstart draft generation;
Manual founder mode;
Project social links;
Existing allocation flow;
Existing productive contribution verification;
Existing reset behavior.
Run:
lint;
typecheck;
tests;
production build.
Do not use npm audit fix --force.
18. Deliverable report
Create:
IDENTITY_AND_COMMUNITY_REPORT.md
Include:
Brand system created;
Light and dark mode implementation;
Landing page status;
Login status;
Investor onboarding status;
Founder Quickstart status;
Community status;
Project social link status;
Gemma identity changes;
Gemma intelligence center changes;
Wallet changes;
Responsive validation;
Tests executed;
Build result;
Known limitations.
At completion, report:
Brand identity:
Light mode:
Dark mode:
Landing page:
Demo login:
Investor default flow:
Founder Quickstart:
Community:
Project social links:
Gemma identity:
Wallet:
Tests:
Build:
Remaining P0 issues:
Begin by auditing the current visual identity and reusable component system, then implement this refinement without breaking the existing functional product.