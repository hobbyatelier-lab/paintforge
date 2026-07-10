**PAINTFORGE**

*Business Concept, Architecture & Roadmap*

**paintforge.io**

v1.4 · July 10, 2026 · Agustín Medina --- consistency pass: name
registry canonized, §17 competitor additions, verification records
filed, catalog count reconciled, stale patches removed, launch-eve code
fixes logged. (Supersedes v1.3 rev U: IrisMatch polished, DB audit
complete, email + legal shipped.)

![](./doc_media/media/186f00fa6d00de51b1d86c1187a5a9cb5cb80b6c.png){width="2.2916666666666665in"
height="1.40625in"}

> **✦** *This document is a living working document. Everything in it is
> subject to change. It captures intent, architecture, and direction ---
> not final decisions.*

1\. What Is PaintForge

PaintForge is a web-based hobby platform for miniature painters, terrain
builders, scale modelers, and Gunpla builders. At launch it is an
inventory management and project planning tool. What it is building
toward: an active, intelligent studio mentor --- not a passive digital
clipboard. A tool that transforms the way painters plan, execute, and
acquire. Every feature should be able to answer: how does this make the
app a mentor rather than a list?

> **✦** *Framing principle: the objective of this feature set is
> incredible utility. That utility is the moat --- it builds deep brand
> loyalty and keeps users inside the ecosystem, which is what makes
> every downstream revenue stream work.*

This document is an internal working reference. It distinguishes between
what is live, what is in active development, and what is a hypothesis
pending validation. Features marked (pending development) are planned
but not yet built. Assumptions are treated as hypotheses until user
behaviour proves or disproves them.

The Four Layers

> **▸ Layer 1 ---** Layer 1 --- Free inventory: Full multi-brand paint
> database (6,259 entries at launch, 13 brands). Owned / My Set /
> backup target system. Hex color swatches with official chip data.
> Export and shopping list. Permanently free --- this is the acquisition
> hook. No cap on inventory size, ever.
>
> **▸ Layer 2 ---** Layer 2 --- Recipe and project builder: Users create
> projects, attach paints, document steps and technique notes. On
> completion, the Vault mechanic transforms the project into a public
> recipe --- structured data owned by PaintForge, permanently credited
> to the creator, indexed for search traffic. The project slot is freed.
> Free users hold 3 active slots with a 24-hour unvault cooldown per
> slot (prevents gaming the paywall by cycling slots). Premium users
> hold up to 10 active slots with no cooldown. Users who need more than
> 10 slots can purchase additional slot packs as a yearly
> micro-transaction --- no tier offers unlimited slots. Two-tier
> browsing: personal vault is visible from day one (your own completed
> recipes, always accessible), while the common discovery feed ---
> browsing other users\' vaulted recipes --- only opens publicly once
> the database has meaningful volume. Nobody opens a \'community\' page
> and sees three recipes. (pending development --- Vault mechanic,
> recipe builder)
>
> **▸ Layer 3 ---** Layer 3 --- Premium AI features: YouTube tutorial
> parsing and AI palette swatching from a reference image. AI features
> operate on a monthly token quota per tier --- free tier gets a limited
> quota, premium gets a higher cap, top-up purchases available when
> quota runs out (micro-transaction, not a wall). \'Unlimited\' is never
> offered: per-use API costs are real. The exact quota thresholds are
> hypotheses pending cost modelling. Painter\'s Muse voice layer (§3) is
> separate: Tier 1 voice batch entry is FREE and not token-metered
> (client-side speech recognition, zero API cost); Tier 2 painting-mode
> voice commands are premium-gated. (pending development)
>
> **▸ Layer 4 ---** Layer 4 --- Contextual affiliate commerce:
> PaintForge surfaces purchase opportunities at moments of genuine
> intent --- not as banners, but as hooks embedded in the workflow. When
> a user exports a shopping list, affiliate links go to regional
> retailers. When the system detects a planning gap (no primer added, or
> black primer with yellow basecoats), it surfaces a recommendation with
> a buy link. When inventory drops below backup target, the Low Stock
> alert offers a restock link. The goal is to be useful first,
> commercial second --- every hook should feel like the app is helping,
> not selling. (UX design pending --- purchase intent capture strategy
> to be validated)

The Core Value Proposition

Paint with what you have and what you can actually get your hands on.

This single sentence governs feature prioritisation. Delta E colour
matching is not interesting in the abstract --- it is interesting
because it tells a painter in rural Japan that the Citadel colour in the
recipe is replaceable with what Vallejo makes, which they can actually
order. The availability profile (which brands and retailers the user has
access to) filters every recommendation, making the output actionable
rather than aspirational.

The matching engine has two dimensions, handled as a single result with
a warning layer rather than separate axes: colour distance (LAB / ΔE
2000) and compatibility (finish + chemistry combined). The warning layer
uses four tiers: GREEN --- same product line, same finish, same
chemistry, safest substitution. YELLOW --- same finish and chemistry
family, different product line (high compatibility, spot-check
recommended). ORANGE --- different finish or similar-but-not-identical
chemistry such as cross-brand combinations (potential unpredictable
result, test before committing). RED --- incompatible chemistry or
finish combinations that reliably cause problems: lacquer over acrylic,
oil wash over unvarnished acrylic, enamel thinner on bare plastic,
colorshift or metallic paints substituted with anything other than a
medium or another one-coat paint of the same type. The user sees one
result with one colour code --- the engine does not require them to
understand chemistry, just to take the warning seriously. (pending
development)

Finish awareness is a distinct dimension from colour distance. Two
paints can have identical LAB values and look completely different
because one is metallic and one is flat. A gloss and a flat red with
identical hue read differently on the mini. A metallic substitute for a
flat colour is not a substitution --- it is a different creative choice.
Every paint in the database requires a finish field (flat / satin /
gloss / metallic / colorshift / one-coat / clear / wash / fx / clear /
ink / pigment / auxiliary) stored per row in Supabase and set at section
level in bulk. Substitution results surface same-finish options first;
other finishes are clearly labelled as such. Swatch display rules ---
finish_family drives swatch format in the UI. Six states: (1) flat /
gloss / satin / ink / one-coat / pigment → solid fill, solid border, hex
shown. (2) metallic / wash / fx / clear → solid fill, dashed border, hex
shown (approximate --- shifts with conditions). (3) colorshift → white
fill, dashed border, \~ indicator, no hex (a hex would misrepresent the
paint). (4) auxiliary → empty circle, grey border, --- indicator (no
color by design, not a data gap). (5) finish_family NULL → empty circle,
no border (pending classification --- visual signal that this section
needs work). (6) finish known but hex missing → empty circle, grey
border, ? indicator (data gap to fill). Chemistry families:
waterborne_acrylic / water_acrylic_polyurethane / alcohol_acrylic /
oil_polyurethane / lacquer / enamel / acrysion --- also stored per row,
set at section level. Classification is ongoing --- Vallejo and Army
Painter complete; Citadel finish complete; Tamiya finish complete where
unambiguous; all others pending.

The term \'one-coat paints\' is used throughout as the brand-neutral
descriptor for contrast-style paints (Citadel Contrast, Vallejo Xpress
Color, Army Painter Speedpaint, and equivalents). These behave
differently from standard acrylics in both finish and flow --- they
require their own compatibility tier.

> **✦** *Hypothesis: the chemistry compatibility layer is a
> differentiated feature no competitor has shipped. Validation required
> before full build commitment. Start with the most common failure
> modes: lacquer over acrylic, enamel thinner on plastic, oil wash over
> unvarnished acrylic.*

Content Ownership

User-generated content on PaintForge --- recipes, projects, step
sequences, technique notes --- remains the intellectual property of the
creator. By creating an account and using the platform, users grant
PaintForge a royalty-free, perpetual, irrevocable, worldwide license to
use, display, store, and sublicense their contributed content for the
purposes of operating and improving the platform. This is the standard
UGC licensing model (Reddit, Genius, and every serious content platform
uses it). The user retains full ownership; PaintForge gains the rights
necessary to build value on top of their contributions without acquiring
the underlying IP. Source videos and tutorials referenced during parsing
remain the original creator\'s property; PaintForge credits and links
them, never hosts or replicates them. The structured, queryable,
inventory-aware derivative --- the recipe object --- is licensed to
PaintForge by the user who generated it.

User Profile --- Voluntary & Transparent

PaintForge will collect user profile data on an entirely voluntary
basis. Every field has a \'Prefer not to say\' option. The profile
serves personalisation --- better recommendations, more relevant
substitutions, useful community features --- not surveillance. Nothing
is required to use the product except the preferred paint brand field.

+---------------------+------------------------------------------------+
| > **Required        | > Preferred paint brands --- pick up to 5,     |
| > (soft)**          | > minimum 1. This seeds the availability       |
|                     | > profile and weights every recommendation     |
|                     | > from day one. The single most useful data    |
|                     | > point for personalised substitution.         |
+---------------------+------------------------------------------------+
| > **Optional ---    | > Age group, gender (with prefer not to say).  |
| > demographics**    | > Used for community insights and editorial    |
|                     | > decisions, never for targeting.              |
+---------------------+------------------------------------------------+
| > **Optional ---    | > Country / region. Used for retailer routing  |
| > geography**       | > and availability profile. GDPR-relevant even |
|                     | > in aggregate --- collected with consent,     |
|                     | > anonymised before any external use.          |
+---------------------+------------------------------------------------+
| > **Optional ---    | > What they paint (miniatures, Gunpla, scale   |
| > painting          | > models, dioramas, terrain). Painting purpose |
| > context**         | > (tabletop standard, high quality, display,   |
|                     | > competition, commission work). Casual        |
|                     | > hobbyist or working professional.            |
+---------------------+------------------------------------------------+
| > **Optional ---    | > Games and lines they paint for (Warhammer,   |
| > games and         | > Zombicide, Horizon, Gunpla kits, etc.). Used |
| > collections**     | > for recipe tagging and community matching.   |
+---------------------+------------------------------------------------+
| > **TOS             | > The TOS states clearly that data willingly   |
| > disclosure**      | > provided is assumed to be authorised for     |
|                     | > PaintForge\'s use in aggregated, anonymised  |
|                     | > form. The \'prefer not to say\' option is    |
|                     | > the opt-out mechanism --- this IS the        |
|                     | > consent framework. No separate permission    |
|                     | > popups required for aggregate use of data    |
|                     | > the user chose to give.                      |
+---------------------+------------------------------------------------+

What We Call What We Build --- Hormozi Offer Names

Features appear in docs. Offers appear in front of humans. Every feature
we build maps to an offer name that describes the dream outcome, not the
mechanism. This naming governs all public-facing copy.

+---------------------+------------------------------------------------+
| > **Paint It With   | > The Delta E substitution + availability +    |
| > What I Own**      | > compatibility warning bundle. This is        |
|                     | > already canon --- it stays.                  |
+---------------------+------------------------------------------------+
| > **Never Ruin a    | > The chemistry linter + cure-aware timers.    |
| > Mini**            | > The payoff for the chemistry knowledge       |
|                     | > layer.                                       |
+---------------------+------------------------------------------------+
| > **Any Tutorial,   | > YouTube tutorial parsing → personalized      |
| > Your Shelf**      | > recipe → substituted shopping list.          |
+---------------------+------------------------------------------------+
| > **Never Miss a    | > Order reconciliation --- paste cart, catch   |
| > Bottle**          | > the misclick before the box ships.           |
+---------------------+------------------------------------------------+
| > **Every Project,  | > The Vault mechanic --- vaulted recipes are   |
| > Reproducible**    | > permanently reproducible with every          |
|                     | > substitution shown.                          |
+---------------------+------------------------------------------------+
| > **Painter\'s      | > The voice layer --- local, offline voice     |
| > Muse**            | > control of recipes, timers, step navigation, |
|                     | > and chemistry warnings. Default OFF;         |
|                     | > onboarding popup invites activation.         |
+---------------------+------------------------------------------------+

Canonical Feature Name Registry (decided July 9, 2026)

Internal feature/engine names, canon as of v1.4. Offer names above
govern public copy; these names govern docs, specs, and UI labels.
Struck names must not reappear in any document or interface.

+---------------------+------------------------------------------------+
| > **The Anvil**     | > The inventory core --- \"Know what you own,  |
|                     | > anytime, anywhere.\" Foundational asset      |
|                     | > engine everything else is forged on.         |
+---------------------+------------------------------------------------+
| > **IrisMatch**     | > The ΔE2000 substitution engine (F2+F3).      |
|                     | > Offer name: Paint It With What I Own. UI     |
|                     | > entry: \"Find a Substitute with IrisMatch.\" |
|                     | > ΔE2000 named in tooltip only.                |
+---------------------+------------------------------------------------+
| > **ChemGuard**     | > Chemistry linter + cure-aware timers. Offer  |
|                     | > name: Never Ruin a Mini.                     |
+---------------------+------------------------------------------------+
| > **ScribeTrace**   | > Tutorial/recipe parser (F7). Offer name: Any |
|                     | > Tutorial, Your Shelf.                        |
+---------------------+------------------------------------------------+
| > **FluxCheck**     | > Order reconciliation (F6-adjacent). Offer    |
|                     | > name: Never Miss a Bottle.                   |
+---------------------+------------------------------------------------+
| > **The Vault**     | > Recipe vault mechanic. Offer name: Every     |
|                     | > Project, Reproducible.                       |
+---------------------+------------------------------------------------+
| > **Painter\'s     | > Voice layer, default OFF. (\"MuseVoice\"     |
| > Muse**            | > STRUCK --- do not use.)                      |
+---------------------+------------------------------------------------+
| > **Project         | > AI-guided project planning --- boxes, single |
| > Wizard**          | > minis, or STLs; consumes Box Registry when   |
|                     | > the project is a box. (\"Box Wizard\" and    |
|                     | > \"Firestarter\" STRUCK.)                     |
+---------------------+------------------------------------------------+
| > **Dragon\'s      | > PUBLIC face of Box Registry + Backlog        |
| > Hoard**           | > Manager. Slogan: \"Pile of Shame → Pile of   |
|                     | > Opportunity.\" Internal names unchanged.     |
+---------------------+------------------------------------------------+
| > **LuxEngine**     | > Vision lab --- image → dominant palette →    |
|                     | > IrisMatch (F3b image door).                  |
+---------------------+------------------------------------------------+
| > **TrueBlend**     | > Physical pigment-mixing engine, Stage 5.     |
|                     | > LICENSING NOTE: Mixbox (Secret Weapons) is   |
|                     | > CC BY-NC 4.0 --- non-commercial only.        |
|                     | > PaintForge is commercial from day one, so    |
|                     | > TrueBlend must either license Mixbox         |
|                     | > commercially or implement Kubelka--Munk      |
|                     | > independently (spec default).                |
+---------------------+------------------------------------------------+
| > **STRUCK**        | > ChromaMatch · MuseVoice · Firestarter · Box  |
|                     | > Wizard (as a name; the registry concept      |
|                     | > lives on under Project Wizard).              |
+---------------------+------------------------------------------------+

Pre-Launch Status

PaintForge is pre-launch. The inventory system is live and functional at
paintforge.io. Everything beyond Layer 1 is planned, not shipped. This
document treats unbuilt features as hypotheses with associated
validation criteria, not as commitments.

2\. Business Model

PaintForge\'s revenue model is affiliate-first. The primary revenue
mechanism is contextual affiliate commerce --- surfacing purchase
opportunities at moments of genuine intent throughout the painter\'s
workflow. Everything else is secondary and sequenced behind this.

> **✦** *None of the revenue streams below are live yet. This section
> documents the current strategic hypothesis. Assumptions should be
> treated as such until user behaviour validates them.*

Revenue Streams

+---------------------+------------------------------------------------+
| > **1 · Affiliate   | > Shopping list exports, substitution          |
| > Commerce          | > recommendations, low stock alerts, and       |
| > (PRIMARY, Layer   | > project planning gaps all resolve to         |
| > 4)**              | > retailer affiliate links routed by user      |
|                     | > region and retailer preference. Amazon       |
|                     | > Associates (JP / DE / UK --- separate        |
|                     | > accounts), Awin/Webgains for hobby           |
|                     | > specialist retailers (Element Games,         |
|                     | > Wayland, etc.). Typical commission: 3--5% on |
|                     | > €30--60 average orders. The volume driver is |
|                     | > the YouTube parsing pipeline and the         |
|                     | > availability-aware recommendation engine.    |
|                     | > Affiliate disclosures are a Day-0 legal      |
|                     | > requirement --- built into the UI from the   |
|                     | > start.                                       |
+---------------------+------------------------------------------------+
| > **2 · Premium     | > Gates access to AI features and additional   |
| > Subscription      | > project slots. Three pricing structures to   |
| > (Layer 3 gates)** | > be A/B tested: Lifetime €79 (early adopter,  |
|                     | > one-time), Monthly €3--5, Yearly €39--49.    |
|                     | > Annual-preferred --- the anchor option.      |
|                     | > Hormozi note: price against the cost of one  |
|                     | > ruined €40 mini or one €60 wrong-ecosystem   |
|                     | > panic buy; €3--4 entry is cheap while proof  |
|                     | > is zero; raise with testimonials and         |
|                     | > documented saves. Lifetime guard: lifetime   |
|                     | > buyers live under the same monthly AI token  |
|                     | > quota as yearly subscribers --- lifetime     |
|                     | > unlocks features permanently, never          |
|                     | > unlimited consumption. Free tier: 3 project  |
|                     | > slots (24h unvault cooldown), limited AI     |
|                     | > token quota. Premium: 10 project slots (no   |
|                     | > cooldown), monthly token quota. Additional   |
|                     | > slots beyond 10: micro-transaction, billed   |
|                     | > yearly.                                      |
+---------------------+------------------------------------------------+
| > **2b · Token      | > When a user exhausts their monthly AI token  |
| > Top-ups**         | > quota, a top-up purchase offers additional   |
|                     | > tokens --- a micro-transaction, not a wall.  |
|                     | > Priced small enough to feel fair (not a      |
|                     | > punishment) but enough to cover costs. This  |
|                     | > is a distinct revenue line from              |
|                     | > subscription: it monetizes heavy users       |
|                     | > without changing the tier structure.         |
|                     | > \'Unlimited\' is never offered at any price. |
+---------------------+------------------------------------------------+
| > **3 · Creator     | > Track A --- Affiliate share from parsed      |
| > Revenue Share     | > content: when a user parses a creator\'s     |
| > (two tracks,      | > YouTube tutorial and generates a shopping    |
| > pending)**        | > list, PaintForge shares a portion of         |
|                     | > affiliate revenue generated from that list   |
|                     | > with the creator. Creates a passive income   |
|                     | > stream for content they already made; turns  |
|                     | > them into motivated promoters. Requires      |
|                     | > YouTube parsing to be live first. Track B    |
|                     | > --- Premium referral: creators who drive     |
|                     | > premium signups earn a referral commission.  |
|                     | > Can launch independently of parsing. Both    |
|                     | > tracks require separate creator onboarding   |
|                     | > flows. Goodwill infrastructure precedes both |
|                     | > tracks: parsed recipe pages link to          |
|                     | > creator\'s Patreon, Ko-fi, personal store,   |
|                     | > and merch shop (extracted from video         |
|                     | > descriptions and channel profiles during     |
|                     | > parsing). Creator stores --- Squidmar        |
|                     | > brushes, Giraldez courses and airbrush,      |
|                     | > Miniac merch --- are linked as goodwill with |
|                     | > no formal affiliate arrangement initially.   |
|                     | > The goal: creators notice organic referral   |
|                     | > traffic from paintforge.io and come to us.   |
|                     | > Reciprocity before commercialisation.        |
|                     | > (pending development)                        |
+---------------------+------------------------------------------------+
| > **4 · Data        | > Aggregated, anonymised demand signals: which |
| > Intelligence      | > discontinued paints are still widely         |
| > (long-term,       | > tracked, regional availability gaps,         |
| > TOS-disclosed)**  | > backup-stock demand by SKU, substitution     |
|                     | > flows between brands. Sellable to            |
|                     | > manufacturers and retailers at meaningful    |
|                     | > scale (thousands of MAU minimum). Consent    |
|                     | > mechanism: the user profile is voluntary and |
|                     | > the TOS discloses that data willingly given  |
|                     | > may be used for aggregated marketing         |
|                     | > intelligence --- no separate opt-in popup    |
|                     | > required. Truly anonymous aggregate data     |
|                     | > (not re-identifiable) falls outside GDPR\'s  |
|                     | > scope; geography and demographics collected  |
|                     | > at individual level are anonymised before    |
|                     | > any external use. Privacy-first architecture |
|                     | > from day one. Not a near-term revenue stream |
|                     | > --- a long-term asset built by designing     |
|                     | > correctly early.                             |
+---------------------+------------------------------------------------+
| > **KILLED · Banner | > Removed from the model entirely. Revenue at  |
| > Ads**             | > our scale is negligible. The positioning is: |
|                     | > no ads, no third-party tracking, no personal |
|                     | > data sold. Note: PaintForge DOES track ---   |
|                     | > product analytics (PostHog), affiliate       |
|                     | > click-through (UTM), behavioural data for    |
|                     | > recommendations. What it does not do:        |
|                     | > display advertising, third-party ad pixels   |
|                     | > (Google/Meta), or sell personally            |
|                     | > identifiable data. Aggregated anonymous data |
|                     | > (Revenue Stream 4) is disclosed in TOS and   |
|                     | > is not personal data sale. Affiliate links   |
|                     | > are contextually useful and disclosed ---    |
|                     | > they are not ads.                            |
+---------------------+------------------------------------------------+
| > **KILLED ·        | > The marketplace (creators selling premium    |
| > Marketplace       | > recipe guides) is not the business model. If |
| > Commission**      | > it emerges organically from the creator      |
|                     | > revenue share programme, it can be           |
|                     | > formalised later. Zero engineering           |
|                     | > investment until there is evidence of        |
|                     | > demand.                                      |
+---------------------+------------------------------------------------+

Purchase Intent UX --- The Affiliate Layer in Practice

The affiliate commerce model only works if the hooks feel helpful rather
than commercial. The design principle: every affiliate link should
appear at a moment when the user is already thinking about buying
something. PaintForge\'s job is to make that moment frictionless and
correct --- pointing to the right product, in stock, from a retailer the
user can actually use.

> **▸** Shopping list export: the primary hook. Every missing paint or
> consumable in a recipe generates a regional affiliate link. The user
> was already going to buy these --- PaintForge just makes it one tap.
>
> **▸** Project planning gaps: (hypothesis, pending UX design) the
> system detects planning issues --- missing primer, wrong primer colour
> for the basecoat palette, consumables not added to project materials
> --- and surfaces them as contextual suggestions with purchase options.
> Example: \'You haven\'t added a primer to this project. You have
> Vallejo Black Primer in your inventory, but yellow and light skin
> tones on a black primer will require many more layers. Would you like
> to add a white primer? \[Add to My Set\] \[Shop\]\'
>
> **▸** Low Stock alerts: when owned backup count drops below the
> user\'s target, a restock suggestion with a buy link appears in
> context --- not as a notification, but as a data point in the
> inventory row.
>
> **▸** Substitution panel: when Delta E matching surfaces an
> alternative, the recommended substitute includes availability and a
> purchase link if the user doesn\'t own it.
>
> **✦** *Hypothesis: contextual purchase intent hooks outperform
> traditional affiliate placements by 3--5× in conversion. UTM tracking
> and click-through data on every affiliate link from day one. Chemistry
> and finish fields must be in the database at Supabase migration time.*

Re-engagement consent rule: nudges for new releases, restocks, or
faction-relevant products exist ONLY as explicit opt-in follows and
wishlists --- the user asks to be told. No surprise promotional pushes.
Default is OFF. The test for every hook is: is this helping, or is this
selling? Any hook that requires explaining why it\'s useful is in the
wrong place.

Pricing Hypotheses

+---------------------+------------------------------------------------+
| > **Lifetime ---    | > One-time purchase, all premium features      |
| > €79**             | > permanently. Hypothesis: converts best at    |
|                     | > launch when brand trust is low and users are |
|                     | > reluctant to commit to recurring payments    |
|                     | > for an unproven tool. Early adopter framing. |
|                     | > Risk: cannibalises long-term subscription    |
|                     | > revenue if the product proves its value      |
|                     | > quickly.                                     |
+---------------------+------------------------------------------------+
| > **Monthly ---     | > Low commitment, easy trial. Hypothesis:      |
| > €3--5**           | > converts risk-averse users who want to test  |
|                     | > premium before committing. Risk: churn is    |
|                     | > high if the capped AI features run out       |
|                     | > mid-month. Monthly pricing needs the cap     |
|                     | > thresholds to be generous enough to feel     |
|                     | > fair.                                        |
+---------------------+------------------------------------------------+
| > **Yearly ---      | > Best unit economics. Hypothesis: the natural |
| > €39--49**         | > home for committed painters who have         |
|                     | > validated the tool over a month or two of    |
|                     | > free use. Price anchored just above          |
|                     | > PaintVault Pro (€3/mo = €36/yr). Should feel |
|                     | > like the \'sensible\' choice relative to     |
|                     | > monthly.                                     |
+---------------------+------------------------------------------------+
| > **Test approach** | > Launch with all three options visible        |
|                     | > simultaneously. Let conversion data decide.  |
|                     | > Do not pre-commit to retiring any tier until |
|                     | > 90 days of data. Lifetime may be             |
|                     | > time-limited (e.g. \'early access pricing,   |
|                     | > ends at 500 subscribers\').                  |
+---------------------+------------------------------------------------+

Auxiliaries & Consumables --- Strategic Headline

Every competitor focuses obsessively on color. But hobbyists rarely
stress over running out of a mid-tone green --- they stress when they
realize mid-session that the plastic cement is empty, the airbrush
thinner is bone dry, or they grabbed the wrong chemistry of varnish.
PaintForge treats auxiliaries and consumables as first-class citizens:
tracked, restock-targeted, chemistry-aware.

Consumables are high-frequency repeat purchases --- the highest-intent,
highest-conversion affiliate category in the ecosystem. A painter
building a shopping list needs their cement, masking tape, and primer
alongside their paints. The more complete our catalog in this category,
the more of their basket we capture. See §19.6 for implementation
detail.

Cold Start --- Recipe Database

The recipe database cold start is not a problem, for two independent
reasons. First: users can use the recipe and project builder with their
own projects from day one. A painter documents their steps, vaults the
project, and the loop is complete with zero other users on the platform.
Second: once YouTube parsing ships, any tutorial URL becomes a personal
recipe immediately --- cross-referenced against the user\'s inventory,
substitutions ranked by what they own and can source locally. The parser
does not need a recipe library to exist. It builds one on demand, from
the world\'s largest existing repository of painting tutorials,
personalised to each user\'s collection. The common discovery feed is a
bonus that grows as a side effect of these two loops --- not a
prerequisite for anything.

The observed benefit: as more users build and vault projects, the public
recipe library grows organically from real painter workflows. Recipe
discovery (finding other people\'s recipes) naturally improves as the
database grows --- but that is a quality curve, not a feature
restriction. PaintForge does not wait for critical mass before letting
users access the recipe feature. They brought their own content.

> **✦** *Hypothesis: painters will vault their completed projects at a
> meaningful rate once they understand that vaulting (a) frees a project
> slot and (b) makes their work permanently discoverable and credited.
> The Vault mechanic needs clear in-app communication --- it should feel
> like publishing, not archiving.*

3\. Product Features

This section maps PaintForge\'s feature landscape across four states:
what is live today, what must be fixed before anything else is built,
what is in active development, and what is planned. Pre-launch features
are marked (pending development). Assumptions are treated as hypotheses
until user behaviour validates them.

Fable\'s code review summary, July 6 2026: \"a real product with two
honest bugs and a missing sensor.\" The section below acts on that
verdict.

3.1 Live --- July 2026

> **▸** Multi-brand paint inventory: 6,259 entries across 13 brands.
> Vallejo (full ecosystem including TMM, Mecha, Xpress, Game Color, FX,
> Inks, Washes), Army Painter Speedpaint 2.0, Citadel, Pro Acryl, Two
> Thin Coats, P3, Scale 75, Reaper, Green Stuff World, Tamiya (all 7
> lines, complete, official chip hex), Mr Hobby, AK Interactive, Indart
> Pigmentos Puros, Custom (500 user-defined slots).
>
> **▸** Owned / My Set / Backup target system: three independent states
> per paint. Owned = physically in hand. My Set = curated target
> collection. Backup target = bottle count goal with restock alert when
> stock falls below threshold.
>
> **▸** Hex color swatches: four visual states. Solid white border =
> verified chip data (manufacturer digital chips). Dashed white border =
> approximate (metallics, one-coat paints, clears, colorshift). \~
> inside dashed ring = colorshift/iridescent, no single hex can
> represent it. ? empty ring = no data or not applicable. Tamiya acrylic
> and enamel ranges use official chip-sampled hex.
>
> **▸** Hierarchy display: three collapsible levels (brand cyan / line
> amber / section violet). Each level shows ♦ purple My Set owned/total
> (amber missing) · teal Collection owned/total (amber missing)
> counters. Missing count omitted when zero.
>
> **▸** Manufacturer code column: shows the code printed on the physical
> bottle where one exists. Vallejo 72.034, AK AK11001, Tamiya X-1/XF-7,
> Indart 00. Internal slug IDs never shown.
>
> **▸** Brand Filter panel: slide-in, tri-state toggles at
> brand/line/section level. Hierarchy colors match inventory
> (cyan/amber/violet). Hidden sections drop out of both progress bars.
> All on / All off shortcuts.
>
> **▸** Content filters: All / Owned / Missing / My Set / Need Restock /
> Low Stock. Compound with search and brand filter.
>
> **▸** Search: filters by name or manufacturer code. Placeholder:
> \'Search... (names or codes)\'.
>
> **▸** Progress bars: My Set (purple, left, primary) · Collection
> (teal, right). Both respond to brand filter state in real time.
>
> **▸** Backup bottle system: five-pill groups (vertical capsule,
> bordered, group outline). Orange = current backup count. Teal = backup
> target. Amber +N badge when owned \< target.
>
> **▸** Shopping list export: all My Set paints not owned + all paints
> below backup target, with quantities. Auto-copied to clipboard.
>
> **▸** Inventory export: full owned inventory as text list. Auto-copied
> to clipboard.
>
> **▸** Preference persistence: all collapse states, hidden sections,
> backup counts, and targets saved to Supabase via 600ms debounced
> single write. Loads identically on any device. No save button.
>
> **▸** Schema hygiene: when a paint row reaches zero state (not owned,
> not in set, no backup data), the row is deleted from user_paints
> rather than storing zeros. Keeps the table lean.
>
> **▸** Auth: email + password, minimum 8 characters enforced
> client-side. Forgot password flow (Supabase reset email). Email
> confirmation before first login. Enter key submits. Session
> persistence across devices.
>
> **▸** How To Use modal: opens on first login. Dismiss with X. \'Don\'t
> show on startup\' checkbox saves preference to Supabase --- persists
> across devices and sessions. Logo in header, no ⚒.
>
> **▸** Responsive layout: max-width 980px on desktop with proportional
> font scaling. Barlow Condensed for paint names (more characters per
> line). Fully functional on mobile.
>
> **▸** Filter persistence: active content filter (All/Owned/Missing/My
> Set/Need Restock/Low Stock) saved to Supabase alongside all other
> preferences. First-time users default to All. Returning users restore
> last-used filter.
>
> **▸** Expand level controls: five buttons below the filter rows ---
> Custom (grey, restores saved Supabase collapse state), All
> (near-white, expand everything), Section (violet, collapse sections
> only), Line (amber, collapse lines and sections), Brand (cyan,
> collapse all brands). Implemented as computed effective states --- the
> saved custom collapse state is never modified by preset buttons.
> Switching back to Custom always restores exactly where the user left
> off. Search auto-activates All display mode without modifying the
> saved state.
>
> **▸** Search bar ✕ clear button: circular X appears inside the search
> bar when search has content. Clicking clears both raw and debounced
> search state instantly.
>
> **▸** Search debounced 300ms: split searchRaw (immediate input) and
> search (300ms debounced) states. Input remains responsive while
> filtering waits for the user to pause typing.
>
> **▸** React.memo on ColorRow: custom comparator prevents re-renders
> when only function prop references change. ColorRow only re-renders
> when its own paint data changes.
>
> **▸** Footer: © Hobby Atelier · PaintForge.

3.2 Fix First --- Critical Issues

> **✦** *These are not features. They are blocking issues that must be
> resolved before any further feature work. ΔE, YouTube parsing, or
> anything else built on top of these gaps will be built on sand.*

+---------------------+------------------------------------------------+
| > **✅ FIXED ---    | > Auth.jsx now listens for the                 |
| > Password Reset    | > PASSWORD_RECOVERY Supabase auth event on     |
| > Dead End (July 7, | > mount. When the reset link is clicked, Auth  |
| > 2026)**           | > switches to \'reset\' mode showing a         |
|                     | > two-field new password form (new password +  |
|                     | > confirm) and calls updateUser({ password }). |
|                     | > Redirect URL points to domain root. Email    |
|                     | > confirmation messaging updated. All four     |
|                     | > auth modes live: login / signup / forgot /   |
|                     | > reset.                                       |
+---------------------+------------------------------------------------+
| > **✅ FIXED ---    | > React.memo on ColorRow with a custom         |
| > Memoization (July | > comparator (only compares isChecked,         |
| > 7, 2026)**        | > inMySet, extraCount, targetCount, color.id   |
|                     | > --- ignores function refs to prevent         |
|                     | > cascading re-renders from handler            |
|                     | > recreation). Search input debounced at 300ms |
|                     | > via split searchRaw/search state. ColorRow   |
|                     | > now only re-renders when its own data        |
|                     | > changes. Ready for ΔE.                       |
+---------------------+------------------------------------------------+
| > **✅ FIXED ---    | > PostHog EU Cloud snippet in index.html.      |
| > PostHog Analytics | > Project token:                               |
| > (July 7, 2026)**  | > phc                                          |
|                     | _BVB8pFzUSedTuPMukUzibECLam63K5dX5oGHR3FtuvUA. |
|                     | > Endpoint: https://eu.i.posthog.com. Pageview |
|                     | > and pageleave capture enabled. match_run     |
|                     | > event to be added when ΔE panel ships. Stage |
|                     | > 1 hypothesis pass metrics now measurable.    |
+---------------------+------------------------------------------------+
| > **✅ FIXED ---    | > exportOwned() header updated from \'VALLEJO  |
| > Export Header     | > PAINT INVENTORY\' to \'PAINTFORGE ---        |
| > (July 7, 2026)**  | > INVENTORY\'. Separator length corrected to   |
|                     | > match. Shopping list was already correct.    |
|                     | > One string change, deployed in               |
|                     | > Inventory.jsx.                               |
+---------------------+------------------------------------------------+
| > **✅ FIXED ---    | > savePaint now wrapped in try/catch. Both     |
| > savePaint Error   | > delete and upsert branches capture res.error |
| > Handling (July 7, | > and throw. On failure: saveError state flips |
| > 2026)**           | > true, \'⚠ save failed --- check connection\' |
|                     | > renders in red next to the saving indicator, |
|                     | > auto-clears after 4 seconds.                 |
|                     | > setSaving(false) still runs cleanly after    |
|                     | > the try/catch block.                         |
+---------------------+------------------------------------------------+
| > **✅ FIXED ---    | > Full rewrite. Now creates both user_paints   |
| >                   | > and user_preferences with correct column     |
|  SETUP_SUPABASE.sql | > names (section_collapsed not collapsed,      |
| > Rewritten (July   | > JSONB arrays with defaults, seen_how_to_use  |
| > 7, 2026)**        | > boolean, active_filter text default          |
|                     | > \'all\'). RLS policies on both tables. Index |
|                     | > on user_paints(user_id) for paginated load   |
|                     | > performance. Email confirmation note moved   |
|                     | > to a dashboard comment --- it is a UI        |
|                     | > toggle, not SQL. File committed to repo root |
|                     | > as backup documentation; never executed      |
|                     | > against live database.                       |
+---------------------+------------------------------------------------+

3.3 In Active Development

> **▸** Supabase migration of paints.js: the paint database (\~500KB)
> currently ships as a client-side JS bundle. It must move to a Supabase
> paints table. This is a prerequisite for server-side search, Delta E
> LAB precomputation, the chemistry field, and the category flag (color
> vs auxiliary vs consumable). The migration rewrites search, filter,
> and the hierarchy rendering logic --- scoped as a dedicated sprint,
> not a half-day task. (in development --- planning phase)
>
> **▸** Delta E 2000 colour matching engine: RGB → LAB conversion, ΔE
> 2000 distance calculation, \'Find Similar\' panel on every paint row.
> Results filterable by: owned paints only / preferred brands / full
> database. Substitution ranking weighted by availability profile once
> that ships. Requires memoization fix and Supabase migration before it
> can ship cleanly. (in development --- blocked on Fix First items and
> migration)

3.4 Planned Feature Roadmap

> **✦** *All features below are (pending development). Ordering reflects
> current priority. Each is a hypothesis with associated validation
> criteria --- not a commitment.*
>
> **▸** Availability profile: onboarding quiz capturing which brands and
> retailers the user can actually access, ranked by preference. Weights
> every recommendation: substitutions surface preferred/available brands
> first. A Japan-based painter gets Vallejo/Mr Color answers; a UK
> painter gets Citadel/Army Painter answers --- from the same recipe.
> Also the regional demand intelligence data source (§2, Stream 4).
> (pending development)
>
> **▸** Affiliate link layer: contextual purchase intent hooks at
> moments of genuine decision. Shopping list exports link to regional
> retailers. Project planning gaps surface recommendations with buy
> links (example: \'You have no primer in this project. You own Vallejo
> Black Primer --- but white primer is recommended for yellows. Add to
> list? \[Shop\]\'). Low stock alerts carry restock links. Substitution
> panel includes purchase option when recommended alternative is not
> owned. Disclosure UI required from day one. (pending development)
>
> **▸** Recipe and project builder: create a project, attach paints per
> step, document technique notes. Vault mechanic: mark complete →
> structured recipe becomes public platform content (credited,
> permanent, indexed) → project slot freed. Free tier: 3 active slots.
> Premium: \~10 active slots. 24h unvault cooldown prevents slot cycling
> to circumvent the paywall. (pending development)
>
> **▸** YouTube tutorial parsing: user pastes any tutorial URL. The
> parse is user-initiated and user-requested --- PaintForge is acting as
> an agent for the user\'s own search, not independently scraping
> content. All YouTube access goes through the official YouTube Data API
> v3 (not direct scraping), which makes the access ToS-compliant and the
> \'user requested it\' legal framing clean. Pipeline: YouTube Data API
> fetch (metadata + description + captions) → fuzzy match against the
> paint database → LLM structuring pass → confidence-scored recipe
> object → user confirms/corrects → inventory cross-reference →
> substitution-aware shopping list → affiliate links. Factual data
> extracted (paint names, product codes, brand names) is not
> copyrightable --- facts are public domain. The structured recipe
> object generated from that data is user-generated content, licensed to
> PaintForge under the platform ToS. Parsed videos cached globally by
> video ID (the same tutorial parsed by multiple users is processed
> once, not repeatedly). Creator always credited by name and channel;
> source video always embedded or linked. API quota management required
> from day one --- YouTube Data API has daily quotas that cap at 10,000
> units/day on the free tier. (pending development --- requires
> affiliate layer and analytics first)
>
> **▸** Reference image swatching (premium, capped): upload a reference
> image. Client-side colour quantisation extracts dominant palette. Each
> swatch matched against owned inventory, then preferred brands, then
> full database via ΔE. Output: \'here is that reference page as a paint
> list --- here is what you own, here is the closest match at ΔE
> ranking.\' (pending development --- requires ΔE engine)
>
> **▸** Chemistry knowledge layer (hypothesis): not just colour
> similarity but chemical compatibility. Can these two products coexist?
> What thins what? What dissolves what under what? Answers informed by
> the user\'s actual owned inventory. Use cases: lacquer over acrylic
> warning, enamel thinner on bare plastic, oil wash over unvarnished
> acrylic. No competitor has shipped this. Requires chemistry field
> added at Supabase migration time. (pending development --- high
> confidence hypothesis, validate before full build)
>
> **▸** Shopping list PDF with QR code: branded printable sheet with
> tick boxes, quantities grouped by brand, QR code linking to the live
> mobile list. Physical brand ambassador --- the curious painter in a
> hobby shop scans it and lands on the product. (pending development)
>
> **▸** Shareable mobile live list: the shopping list as a shared web
> page with large tap targets, persistent ticks, accessible without
> login. Affiliate links for items the shop doesn\'t stock.
> Brick-and-mortar and affiliate revenue compound instead of compete.
> (pending development)
>
> **▸** Painting Mode --- TBD scope: the app experience when a recipe is
> actively open during a session. Minimum viable: current step visible,
> next step accessible, paint row for each step paint. Extended scope:
> layer cure timers, step completion tracking, session notes. Defined
> further once recipe builder ships and user feedback is available.
> (pending development --- scope TBD post recipe builder)
>
> **▸** Creator revenue share --- two tracks: Track A --- share
> affiliate revenue generated from lists derived from a creator\'s
> parsed video. Passive income for content they already made; turns them
> into motivated promoters. Requires parsing pipeline. Track B ---
> referral commission for premium signups a creator drives. Classic
> affiliate mechanic, can launch before parsing. Both tracks require
> separate creator onboarding flows. (pending development)
>
> **▸ Box Registry ---** Box Registry + Backlog Manager: two faces of
> one organism. Box Registry: pre-mapped palette profiles for retail
> boxes (Warhammer Combat Patrol, Kickstarter board game boxes, Gunpla
> Master Grade kits). User searches their BOX, not individual paints;
> PaintForge cross-references inventory, shows
> owned/substitutable/missing, and bundles the gap into a completion
> basket. Converts individual bottle commissions into €60-80 completion
> baskets --- the basket-value hypothesis is that these convert at ≥2×
> the rate and ≥3× the value of single-item affiliate clicks. Bootstrap
> path: YouTube parser generates box palettes nearly free by parsing 2-3
> tutorials for the same product and unioning the paint lists;
> manufacturers also publish official \'paints you need\' lists for
> starter products. Backlog Manager: every owned box enters the user\'s
> backlog with per-box status (unopened / assembled / primed / in
> progress / done). Profile setting for what the feature calls itself:
> \'Pile of Shame\' / \'Pile of Opportunity\' / \'Unpainted Backlog\'
> --- user picks, app uses that label everywhere. Small feature,
> disproportionate charm. (pending development)
>
> **▸ Box Wizard ---** Box Wizard --- AI-Assisted Project Planning:
> rather than a static palette lookup, the Box Wizard guides the user
> through building a custom project plan. Static path: for known
> universes (Warhammer 40k factions, Age of Sigmar, D&D dragon types),
> pre-loaded faction color canon provides instant defaults --- the
> wizard already knows chapter colors, faction metals, common skin
> tones. AI chat path: for everything else, an AI conversation asks the
> right questions --- how many factions, primary and secondary colors
> per faction, material types (metallics, leather, fur, skin, gems,
> bases), experience level, approach (one-coat paints recommended for
> beginners and large casts, TMM vs NMM flagged as advanced). Output:
> tiered --- minimum viable palette (primer, black/white/grey, one
> shade, base + highlight for each faction color, basic skin) and highly
> recommended additions (extra shades, OSL colors, faction-specific
> accents). Both tiers cross-referenced against owned inventory: \'you
> already own 7 of these 12.\' The AI chat generates data --- every
> planning conversation is a signal for expanding the static wizard.
> (pending development --- scope: Stage 2-3)
>
> **▸ Painter\'s Muse ---** Painter\'s Muse --- Voice Layer (two tiers):
> Tier 1 --- Voice Batch Entry: hands-free natural-language inventory
> logging (\'I just bought Game Color Scarlet Red, Xpress Nuclear
> Orange, and a Blue Ink\') → transcript runs through the same
> closed-vocabulary matcher as parsing → confirm grid. Client-side
> speech recognition, NOT an AI-token feature. Kills the #1 onboarding
> friction for large collections. Tier 2 --- Painting Mode Voice
> Commands: \'next step\', \'start timer\', \'mark done\', step
> navigation. Spoken chemistry and cure warnings read aloud while hands
> are wet. Premium-gated (paywalling Tier 1 would charge admission to
> your own front door --- Tier 1 is the onboarding friction killer).
> Default: voice OFF for both tiers; onboarding popup invites
> activation. Settings toggle to switch warnings back to visual-only.
> Analytics: voice_entry_used, voice_command_used. (pending development
> --- Tier 1 free, Stage 2; Tier 2 premium, Stage 3)
>
> **▸ Mix Ratio ---** Dynamic Mix Ratio Calculator: recipe steps log
> precise formulas (\'2 drops glaze medium, 1 drop ink, 1 drop water\')
> and the app scales the formula automatically when the batch multiplier
> changes --- one hero becomes a twelve-mini squad and the drops
> recompute. Fits the existing recipe-step schema. Pairs naturally with
> Painting Mode batch counters. Cheap to implement, deeply \'studio
> mentor\'. (pending development --- Stage 3)
>
> **▸ Auto-Pairing ---** Automated Paint Pairing: companion suggestions
> --- if base coat X, then wash Y and highlight Z. Deterministic where
> manufacturers publish system triads (Citadel base/shade/layer
> families); community-recipe frequency data enriches it later. Lives on
> top of the chemistry layer --- pairings respect the severity ladder
> automatically. Feeds \'complete the recipe\' suggestions and the
> affiliate layer. (pending development --- Stage 3)
>
> **▸ LuxEngine ---** LuxEngine --- Vision Lab: import 2D reference
> images or 3D files, drag-and-drop paint zone assignments, adjustable
> lighting vectors to preview how paint choices read under different
> conditions. Filed under post-gates R&D --- do NOT spec as near-term.
> Concept recorded so it isn\'t lost. Feature names live under the
> PaintForge brand (like \'Face ID\' under iPhone) --- never sub-brands.

3.5 Hypotheses to Validate Before Building

> **▸** Photo inventory capture: snap a rack, vision model reads visible
> labels, proposes matches, user confirms. Collapses the biggest
> switching cost in the category. Honest difficulty: dense storage
> (Jucoci boxes, drawers, sorted trays) defeats it. Vision costs per
> image are real at scale. Premium-gated from day one. Post-90-days
> territory --- validate UX viability with paper prototype before
> committing any API spend.
>
> **▸** Public recipe discovery: browsing and searching other users\'
> vaulted recipes. Grows naturally as users vault --- no artificial
> gate, no cold start problem. Quality of discovery improves with
> database size. Validate that users actually vault (not just build)
> before investing in discovery UI.
>
> **▸** Purchase intent capture specifics: the primer-warning example
> (§2) is one illustration of a broader hypothesis --- that contextual
> hooks outperform affiliate link lists by 3-5× in conversion. Needs UTM
> tracking and click-through measurement from day one (PostHog). Do not
> optimise the hooks before measuring them.

3.6 Platform Principles

> **▸** The inventory is free forever and has no size cap. This is the
> acquisition hook --- removing it at any tier would undermine the
> entire model.
>
> **▸** Everything that costs money per use (AI palette, YouTube
> parsing, vision model) is capped on free. \'Unlimited\' is a financial
> risk and will not be offered on any tier.
>
> **▸** Cross-hobby structurally from day one: the database already
> covers Tamiya, Mr Hobby, AK, scale and Gunpla communities. The feature
> set is hobby-agnostic. Marketing is miniature-painter-first at launch
> --- not the architecture.
>
> **▸** Chemistry and technique knowledge is cross-hobby:
> lacquer-over-acrylic warnings are as relevant to a Gunpla builder as
> to a Warhammer painter. The knowledge layer serves every painter
> regardless of what they paint.
>
> **▸** Affiliate hooks must feel like help, not advertising. Every link
> surfaces at a moment of genuine purchase intent --- shopping lists,
> planning gaps, low stock alerts, substitution panels. No banners. No
> popups. If a hook requires explaining why it\'s useful, it\'s in the
> wrong place.
>
> **▸** Analytics are non-negotiable from Week 1. Every hypothesis has a
> pass metric. Every feature has an event. If it isn\'t measured, it
> didn\'t happen.

4\. PaintForge --- What It Does

A functional walkthrough of the app as shipped at paintforge.io, July
2026. This section describes the product from a user perspective ---
what clicking things does, what each element means, how the system
behaves. For the feature roadmap and planned additions, see §3.

Getting Started

> **▸** Sign up with email and password (minimum 8 characters, enforced
> client-side). Supabase handles auth. Sessions persist across devices
> and browser refreshes without reinstallation.
>
> **▸** First login triggers the How To Use modal automatically. The
> modal explains every UI element, can be dismissed with X, and includes
> a \'Don\'t show on startup\' checkbox that saves to Supabase --- the
> preference persists across devices and sessions.
>
> **▸** Forgot password: enter email, receive Supabase reset link. The
> recovery flow shows a new password form on arrival and calls
> updateUser. (Note: as of July 2026, the recovery route is not yet
> implemented --- this is the top Fix First item in §3.2.)
>
> **▸** Email confirmation is required before first login. The signup
> confirmation message accurately reflects this.

The Paint Inventory

The core of PaintForge is a hierarchical, filterable paint inventory
covering 6,259 entries across 13 brands. Three collapsible levels:

> **▸** Brand header (e.g. VALLEJO, ARMY PAINTER) --- cyan (#36E2DD),
> uppercase, weight 800. Click to collapse the entire brand.
>
> **▸** Line header (e.g. Game Color, True Metal, Speedpaint 2.0) ---
> amber (#E8A838), sentence case, weight 600. Click to collapse a
> product line.
>
> **▸** Section header (e.g. BASE COLORS, METALLIC, INK) --- violet
> (#9B8FD0), uppercase, weight 700. Click to collapse individual
> sections.

Each level shows a counter: ♦ purple setOwned/setTotal (amber missing if
non-zero) · teal collectionOwned/total (amber missing if non-zero).
Missing count is hidden when zero --- clean at 100% completion.

The Paint Row

Every paint row contains, left to right:

> **▸** ♦ My Set toggle (purple rounded square): tap to add or remove
> from curated set.
>
> **▸** ✓ Owned toggle (green rounded square): tap to mark as physically
> owned.
>
> **▸** Hex swatch (18px circle, double-ring): solid white border =
> verified chip data. Dashed white border = approximate (metallics,
> one-coat, clears, colorshift paints). \~ inside dashed ring =
> colorshift or iridescent, no single hex is accurate. ? in plain ring =
> no color data or not applicable.
>
> **▸** Manufacturer code column (fixed 44px width, monospace): the code
> printed on the physical bottle. Vallejo 72.034 · Tamiya X-1/XF-7 · AK
> AK11001 · Indart 01. Blank for brands without official codes (Citadel,
> Army Painter). Internal database IDs never shown.
>
> **▸** Paint name (Barlow Condensed font, flex width): gets all
> remaining horizontal space. Barlow Condensed shows significantly more
> characters than a standard font at the same size --- chosen
> specifically to reduce name truncation on mobile.
>
> **▸** Amber +N badge: appears when owned backup count is below target.
> N = bottles needed.
>
> **▸** Orange pill group (5 vertical capsules, bordered, group outline
> box): current backup bottle count. Tap any pill to set.
>
> **▸** Teal pill group (5 vertical capsules, bordered, group outline
> box): backup target. Tap any pill to set.

Owned vs My Set --- The Core Distinction

PaintForge separates two states for every paint. Owned means it is
physically in your collection right now. My Set means it is part of your
curated target --- the paints you use or want in your workflow. A paint
can be: in both states (owned and wanted), in My Set only (want it,
don\'t have it yet --- drives the shopping list), owned but not in My
Set (you have it but it\'s not part of your current workflow), or
neither (exists in the database but you don\'t track it).

> **▸** My Set progress bar (purple, LEFT): owned paints as a percentage
> of My Set. This is the primary metric --- what you\'re actually
> tracking toward.
>
> **▸** Collection progress bar (teal, RIGHT): owned paints as a
> percentage of all visible paints. Secondary metric --- total
> collection breadth.
>
> **▸** Both bars respond to brand filter state in real time. Hiding a
> brand removes it from both counts.

Brand Filter Panel

The Brand Filter button (top filter row, outlined, shows count of hidden
sections when active) opens a slide-in panel from the right. Hierarchy
colors match the inventory: cyan ticks for brands, amber for lines,
violet for sections. Tri-state: ✓ fully visible / --- partially visible
/ ☐ fully hidden. All on / All off shortcuts. Hidden sections disappear
from the list and drop out of both progress bars. Title: \'Brands and
Product Line Filters\'.

Filter Rows

Three rows of controls beneath the search bar:

> **▸** Row 1 --- Tools: Shop 🛒 (bright orange outline --- primary
> action), Export (ghost), Brand Filter (outline, cyan when active with
> count).
>
> **▸** Row 2 --- Primary content filters: All / Owned ✓ / Missing.
>
> **▸** Row 3 --- Secondary content filters: My Set ♦ / Need Restock /
> Low Stock ⚠.

All filters compound: search + content filter + brand filter apply
simultaneously. Searching \'red\' while in Owned mode shows only owned
paints with \'red\' in name or code.

Color Swatches --- Data Sources

+---------------------+------------------------------------------------+
| > **Tamiya ---      | > All 7 product lines. Acrylics and enamels    |
| > Complete ✅**     | > use official Tamiya chip-sampled hex         |
|                     | > (physical bottle sampling, July 2026).       |
|                     | > Metallics, clears, fluorescents, and special |
|                     | > effects flagged approx (dashed ring).        |
|                     | > Iridescent PS-46 and PS-47 flagged           |
|                     | > colorshift: true for future gradient swatch  |
|                     | > treatment.                                   |
+---------------------+------------------------------------------------+
| > **Vallejo ---     | > Game Color, Mecha Color, Xpress Color (full  |
| > Complete ✅**     | > range including Intense), True Metal (all 3  |
|                     | > tiers across 10 colors), Game Color Ink,     |
|                     | > Wash, Special FX. Official Vallejo chip data |
|                     | > cross-referenced.                            |
+---------------------+------------------------------------------------+
| > **Army Painter    | > Speedpaint 2.0 (80 colors, gen-split from    |
| > --- Complete ✅** | > 1.0), Warpaints Fanatic, Washes, Air,        |
|                     | > Quickshade. Generation splitting implemented |
|                     | > --- SP1.0 and SP2.0 are separate entries.    |
+---------------------+------------------------------------------------+
| > **Indart --- 46+  | > Pigmentos Puros range. Spanish product names |
| > entries**         | > preserved (official brand language). Codes   |
|                     | > 00--61 where assigned. Codeless variants     |
|                     | > assigned internal IDs. One auxiliary.        |
+---------------------+------------------------------------------------+
| > **AK Interactive  | > Standard, AFV, Air, Figures, Inks,           |
| > --- Full 3rd      | > Metallics, Intense, Pastel ranges.           |
| > Gen**             | > Auxiliaries (mediums, retarder) correctly    |
|                     | > have no hex --- transparent products.        |
|                     | > Primers and Varnish in separate line.        |
|                     | > Weathering and diorama ranges noted as       |
|                     | > missing from community database.             |
+---------------------+------------------------------------------------+
| > **Citadel / GW**  | > Full community database. Discontinued ranges |
|                     | > in labelled subsections. \~443 entries.      |
+---------------------+------------------------------------------------+
| > **Custom --- 500  | > CUSTOM_001: Aron Alfa Pro (CA glue). Slots   |
| > slots**           | > 002--500 empty, user-definable.              |
+---------------------+------------------------------------------------+
| > **\~540 entries   | > Legitimately colorless auxiliaries           |
| > without hex**     | > (thinners, mediums, varnishes, flat base).   |
|                     | > Some actual colors flagged by code review    |
|                     | > (SZ Red 69.009, several washes) --- audit    |
|                     | > pending before ΔE launch to ensure the       |
|                     | > engine does not silently skip paintable      |
|                     | > colors.                                      |
+---------------------+------------------------------------------------+

Preference Persistence

Every user preference saves automatically to Supabase via a 600ms
debounced write --- no save button exists, and saves never pile up into
simultaneous calls. Preferences stored: hidden sections, brand collapse
state, line collapse state, section collapse state, How To Use startup
preference. Loads identically on any device at any subsequent login.

Schema hygiene: when a paint row reaches zero state (not owned, not in
My Set, no backup data), the row is deleted from user_paints rather than
storing zeros. Keeps the table lean at scale.

> **✦** *Known gap: savePaint upserts are optimistic with no error
> handling. A failed write on bad wifi shows success in the UI while
> data silently diverges. Fix tracked in §3.2 Fix First.*

Export Features

> **▸** Shopping List (Shop 🛒 button): all My Set paints not yet
> owned + all paints below backup target, with quantities. Auto-copied
> to clipboard. (Known issue: export header currently reads \'VALLEJO
> PAINT INVENTORY\' --- fix tracked in §3.2.)
>
> **▸** Inventory Export: full owned inventory as text list, sorted by
> SKU within each section. Auto-copied to clipboard.

How To Use Modal

\'How to use\' text link in the header (small caps, no ? button) opens a
modal covering: paint row anatomy, swatch system, manufacturer code
logic, pill system, hierarchy navigation, counter format, all content
filters, Brand Filter, Export and Shop, and preference persistence.
Opens automatically on first login. Dismissable with X. \'Don\'t show on
startup\' checkbox (saves to Supabase, persists across devices) sits in
the modal header --- bordered label, turns purple when checked for
visual confirmation.

Brands at Launch --- 14 Brands

Citadel · Vallejo · Army Painter · Pro Acryl · Two Thin Coats · P3 ·
Scale 75 · Reaper · Green Stuff World · Tamiya · Mr Hobby · AK
Interactive · Indart · Custom

Technical Notes

> **▸** Frontend: React 18, Vite, Supabase JS client. No external UI
> library. All styling inline.
>
> **▸** Supabase: user_paints (one row per tracked paint per user,
> zero-state rows deleted), user_preferences (collapse state, hidden
> sections, How To Use preference). Pagination: user_paints fetched in
> 1,000-row pages until exhausted --- the 6,259-entry database will
> never silently truncate a large collection.
>
> **▸** Fonts: Montserrat (primary, UI elements), Barlow Condensed
> (paint names, maximises readable characters per row).
>
> **▸** Deployment: Netlify (replaced Vercel --- account flagged on
> signup July 3, support unresponsive, migrated same day). Personal
> tier. Supabase backend.

5\. Brand Architecture --- The Atelier Model

The OneBookShelf Parallel

OneBookShelf runs DriveThruRPG, DMs Guild, Wargame Vault,
DriveThruCards, and DriveThruComics --- all on the same backend, same
payment rails, same submission system. Each community feels like they
have their own dedicated platform. OneBookShelf is invisible to end
users. This is the exact architecture PaintForge is built toward.

The parent company operates the infrastructure. Individual brand skins
--- each with their own visual identity, community, marketing, and SEO
strategy --- face the user. A Gunpla builder has no idea they are on the
same platform as a Warhammer painter. That is intentional.

The Parent: Hobby Atelier

The umbrella company operates under the Hobby Atelier brand. \'Atelier\'
is French for studio/workshop --- warm, craft-focused, immediately
understood across European and Japanese markets. The \'Hobby\' prefix
makes it approachable and removes any pretension. Deliberately neutral
across all hobby communities --- it does not bias toward any single
genre. The parent brand is largely invisible to end users but present in
legal, infrastructure, B2B, and physical product contexts.

+---------------------+------------------------------------------------+
| >                   | > Digital home of the parent company.          |
| **hobbyatelier.io** | > Infrastructure, about, B2B contact. Parked   |
|                     | > for now.                                     |
+---------------------+------------------------------------------------+
| > *                 | > Community umbrella --- pairs with .io.       |
| *hobbyatelier.org** | > Parked.                                      |
+---------------------+------------------------------------------------+
| > **h               | > Physical goods storefront. Future home of    |
| obbyatelier.store** | > Japan-sourced hobby materials, curated       |
|                     | > terrain kits, and imported products. This    |
|                     | > domain has a clear purpose --- it goes live  |
|                     | > when the physical product pipeline is ready. |
+---------------------+------------------------------------------------+

> **✦** *hobbyatelier.store is not just a defensive registration. It is
> the planned destination for the physical goods business line --- Japan
> sourcing, curated terrain materials, imported western hobby products
> for Japanese buyers. When that channel is ready, the domain is already
> waiting.*

Brand Skins --- Current & Pipeline

+---------------------+------------------------------------------------+
| > **PaintForge**    | > LAUNCHED --- Miniature painters, terrain     |
|                     | > builders, board game modelers. Warhammer,    |
|                     | > DnD, board games, Gunpla adjacent. Primary   |
|                     | > skin, first launch. paintforge.io            |
+---------------------+------------------------------------------------+
| > **\[TBD --- Scale | > PIPELINE --- Gunpla, military scale models,  |
| > Modeling\]**      | > historical dioramas. Different visual        |
|                     | > identity, same backend. Target: Japanese and |
|                     | > European scale modelers.                     |
+---------------------+------------------------------------------------+
| > **\[TBD ---       | > PIPELINE --- Modular terrain, display        |
| > Terrain &         | > dioramas, scenic bases. Cross-hobby (any     |
| > Diorama\]**       | > scale). Could be highest-volume niche after  |
|                     | > mini painting.                               |
+---------------------+------------------------------------------------+
| > **\[TBD --- Train | > PIPELINE --- Train modeling, military        |
| > & Military\]**    | > miniatures, historical wargaming. Older      |
|                     | > demographic, premium spending. Very          |
|                     | > different aesthetic than fantasy/sci-fi.     |
+---------------------+------------------------------------------------+
| > **\[TBD --- Craft | > FUTURE --- Broader craft coverage if         |
| > / General\]**     | > platform proves the model. Paper modeling,   |
|                     | > resin casting, prop making.                  |
+---------------------+------------------------------------------------+

> **✦** *Launch order: nail one skin first. PaintForge must be working,
> retaining users, and generating marketplace revenue before the second
> skin is built. The OneBookShelf team did not launch five platforms
> simultaneously.*

The DMs Guild Opportunity

DMs Guild succeeded partly because Wizards of the Coast blessed it with
official IP licensing --- creators could publish D&D-adjacent content
with official permission, and WotC received a revenue share. This
created enormous supply of high-quality, legitimately licensed content.

Long-term: explore partnership discussions with Games Workshop,
Privateer Press, CMON, or other major miniature publishers for an
official IP licensing tier on PaintForge. This is not a launch priority,
but worth keeping in the back of the mind as leverage grows.

6\. Domains & Digital Infrastructure

Infrastructure Management

+---------------------+------------------------------------------------+
| > **Platform**      | > Google Workspace --- all domains, email, and |
|                     | > admin managed here. Single billing           |
|                     | > relationship.                                |
+---------------------+------------------------------------------------+
| > **Domain          | > Squarespace (via Google Workspace domain     |
| > Provider**        | > flow --- Google sold domain business to      |
|                     | > Squarespace in 2023; Squarespace-branded     |
|                     | > dashboard is expected and normal)            |
+---------------------+------------------------------------------------+
| > **Primary Login** | > artificer@paintforge.io --- founder account, |
|                     | > primary admin access to all domains and      |
|                     | > Workspace                                    |
+---------------------+------------------------------------------------+
| > **Registration    | > July 3, 2026 --- PaintForge founding day     |
| > Date**            |                                                |
+---------------------+------------------------------------------------+

Technical Stack

+---------------------+------------------------------------------------+
| > **Version         | > GitHub --- hobbyatelier-lab org, paintforge  |
| > Control**         | > repo (public). Auto-deploys to Netlify on    |
|                     | > every push to main.                          |
+---------------------+------------------------------------------------+
| > **Hosting /       | > Netlify --- free tier. Auto-deploys from     |
| > Deployment**      | > GitHub. Current URL:                         |
|                     | > euphonious-croissant-fcc0a7.netlify.app. DNS |
|                     | > to paintforge.io pending.                    |
+---------------------+------------------------------------------------+
| > **Database &      | > Supabase --- free tier. User accounts, paint |
| > Auth**            | > inventory, preferences persistence. Tables:  |
|                     | > user_paints, user_preferences (with          |
|                     | > collapse + filter states).                   |
+---------------------+------------------------------------------------+
| > **Email**         | > Google Workspace --- artificer@, forge@,     |
|                     | > herald@, admin@ all on paintforge.io domain. |
+---------------------+------------------------------------------------+
| > **DNS**           | > Managed via Squarespace/Google Workspace DNS |
|                     | > panel. paintforge.io not yet pointed at      |
|                     | > Netlify --- PENDING (20-minute task).        |
+---------------------+------------------------------------------------+

> **✦** *MVP tech stack is deliberately free-tier across the board.
> Netlify + Supabase free tiers handle thousands of users before any
> cost kicks in. Vercel was the original plan but was abandoned Day 1
> after account flag --- Netlify was configured and deployed same day
> with no friction.*

Domain Portfolio --- Registered July 3, 2026

+-----------------------+-----------------------------------+-----------+
| > **Domain**          | > **Purpose**                     | > **P     |
|                       |                                   | riority** |
+-----------------------+-----------------------------------+-----------+
| > **paintforge.io**   | > PRIMARY --- PaintForge webapp.  | > **✅    |
|                       | > Points to Netlify. This is the  | > LIVE**  |
|                       | > one.                            |           |
+-----------------------+-----------------------------------+-----------+
| > **paintforge.org**  | > Defensive --- community         | > **✅    |
|                       | > connotation. Parked, redirects  | > OWNED** |
|                       | > to .io.                         |           |
+-----------------------+-----------------------------------+-----------+
| > **hobbyatelier.io** | > Parent company digital home --- | > **✅    |
|                       | > Hobby Atelier umbrella brand.   | > OWNED** |
|                       | > Parked.                         |           |
+-----------------------+-----------------------------------+-----------+
| >                     | > Community umbrella --- pairs    | > **✅    |
|  **hobbyatelier.org** | > with .io for the Atelier brand. | > OWNED** |
|                       | > Parked.                         |           |
+-----------------------+-----------------------------------+-----------+
| > *                   | > Physical products --- Japan     | > **✅    |
| *hobbyatelier.store** | > sourcing, terrain kits, curated | > OWNED** |
|                       | > boxes. Parked.                  |           |
+-----------------------+-----------------------------------+-----------+
| > **paintforge.com**  | > Squatted. \~\$1,200 USD asking. | > **⚪    |
|                       | > Monitor --- buy when platform   | > WATCH** |
|                       | > has real traction.              |           |
+-----------------------+-----------------------------------+-----------+
| > **paintforge.app**  | > Squatted. Leads nowhere.        | > **⚪    |
|                       | > Monitor for acquisition.        | > WATCH** |
+-----------------------+-----------------------------------+-----------+
| >                     | > Squatted. \~\$1,200 USD asking. | > **⚪    |
|  **hobbyatelier.com** | > Monitor --- buy when Atelier    | > WATCH** |
|                       | > brand is active.                |           |
+-----------------------+-----------------------------------+-----------+

Email Structure

+---------------------+------------------------------------------------+
| > **artifi          | > FOUNDER --- personal-brand-facing comms,     |
| cer@paintforge.io** | > primary admin login for all platforms. This  |
|                     | > is your email.                               |
+---------------------+------------------------------------------------+
| > **fo              | > GENERAL --- contact page, community,         |
| rge@paintforge.io** | > partnerships. Warmer than info@. On-brand.   |
+---------------------+------------------------------------------------+
| > **her             | > NEWSLETTER --- announcement sender address.  |
| ald@paintforge.io** | > Used for email campaigns.                    |
+---------------------+------------------------------------------------+
| > **ad              | > BACKEND --- Workspace admin, automated       |
| min@paintforge.io** | > receipts, system alerts. Never shown         |
|                     | > publicly.                                    |
+---------------------+------------------------------------------------+

> **✦** *Fantasy naming applies to human-facing addresses only. Systems
> stay mundane. The first email from artificer@paintforge.io is a brand
> statement --- use it intentionally.*

7\. Market & Positioning

Primary Target Audience

> **▸** Miniature painters --- Warhammer 40K / Age of Sigmar, DnD, board
> games (Zombicide, CMON, etc.), historical
>
> **▸** Tabletop hobbyists who buy large game boxes with unpainted minis
> and want to actually paint them properly
>
> **▸** Board game customizers: component upgrades, token painting,
> terrain printing
>
> **▸** Terrain and diorama builders --- all scales
>
> **▸** 3D printing hobbyists who print and paint their own minis (STL
> community)

Geographic Focus

European market first --- UK, Germany, France, Spain, Benelux. The
tabletop hobby market is proportionally larger in Europe than the US,
and the .io TLD reads as more credible in a European tech-adjacent
context. Spanish-language content is a secondary angle given the
founder\'s background and the growing LATAM tabletop community.

Japan is a secondary market with specific opportunities: Gunpla and
scale modeling are enormous, and English-language hobby resources for
non-Japanese speakers in Japan are extremely scarce. A Japan-specific
angle (possibly a dedicated skin) is a medium-term pipeline item.

Competitive Landscape

The miniature painting app space is more crowded than initially
assessed. As of July 2026, there are at least seven active competitors
with established user bases. Analysis below is based on direct research,
app store listings, and feature audits.

Tier 1 --- Established Market Leaders (Mobile)

+---------------------+------------------------------------------------+
| > **paintRack ★     | > Developer: Courageous Octopus. iOS +         |
| > Market leader**   | > Android. 27,000+ paints, 65+ brands --- the  |
|                     | > largest database in the space. Barcode       |
|                     | > scanner (bulk), color tools, paint           |
|                     | > sets/recipes, wishlist. Freemium: color      |
|                     | > tools and rapid scan behind paywall. Highly  |
|                     | > rated, long-established, active updates. The |
|                     | > app people recommend on r/minipainting. Key  |
|                     | > weakness: web-only UX, no creator            |
|                     | > marketplace, no cross-brand color matching   |
|                     | > (basic color tools only).                    |
+---------------------+------------------------------------------------+
| > **BrushRage ★     | > Developer: Hendarion (Germany). iOS +        |
| > Most              | > Android. Completely FREE. 27,000+ paints,    |
| >                   | > 50+ brands. Physical-based paint mixing via  |
|  feature-complete** | > Mixbox (far beyond basic RGB). Project       |
|                     | > tracking with timers and reminders. Photo    |
|                     | > color identification. Barcode scanner.       |
|                     | > How-To guides. Social sharing. Wear OS       |
|                     | > integration. Integrated ecommerce via        |
|                     | > Reachu.io. The most technically impressive   |
|                     | > free app in the space. Key weakness:         |
|                     | > overwhelmingly complex UX (reviewers note    |
|                     | > steep learning curve); mobile-only; no web;  |
|                     | > no creator marketplace.                      |
+---------------------+------------------------------------------------+
| > **BrushForge ★    | > Developer: Bas (solo). iOS + Android. 4,300+ |
| > Fastest-growing** | > paints. Delta E 2000 LAB color matching, AI  |
|                     | > recipe generator, lighting tool              |
|                     | > (zenithal/noir on photos), scheme analyzer.  |
|                     | > Mobile-only. 40-paint FREE tier limit. No    |
|                     | > iOS↔Android cross-sync. Ads on free.         |
|                     | > Freemium with paid subscription or lifetime  |
|                     | > purchase. Similar name to PaintForge ---     |
|                     | > noted.                                       |
+---------------------+------------------------------------------------+

Tier 2 --- Web-Based Competitors (DIRECT THREAT to PaintForge)

Two web-first competitors exist and are actively developed. These are
the most strategically relevant to PaintForge.

+---------------------+------------------------------------------------+
| > **PaintVault ⚠    | > Web app + Android. paint-vault.com. 20,000+  |
| > Most similar to   | > paints, 50+ brands. Delta E 2000 color       |
| > PaintForge**      | > matching. Inventory, recipes, projects,      |
|                     | > gradient generator, color harmony, PDF       |
|                     | > export. Pricing: Free (basic), Mobile €9.99  |
|                     | > one-time, Pro €3/month or €27/year with web  |
|                     | > access + sync. Cross-device sync on Pro. No  |
|                     | > creator marketplace. No commons model. More  |
|                     | > polished than PaintForge currently, but      |
|                     | > narrower model --- no ambition beyond        |
|                     | > tooling.                                     |
+---------------------+------------------------------------------------+
| > **PaintStash ⚠    | > Web app (PWA). paint-stash.com.              |
| > Direct web        | > Warhammer-focused. Paint tracking, color     |
| > competitor**      | > matching from photos, mixing, community      |
|                     | > painting guides. No app store install        |
|                     | > required. Actively developed. Appears to be  |
|                     | > solo/small team. Less mature than PaintVault |
|                     | > but in the same lane. No pricing details     |
|                     | > found publicly --- may be free or in early   |
|                     | > access.                                      |
+---------------------+------------------------------------------------+

Tier 3 --- Niche / Lower-Priority

+---------------------+------------------------------------------------+
| > **Miniature       | > Developer: Rick Fleuren. iOS + Android.      |
| > Painter Pro**     | > \~2,500 paints. Color picker from photos,    |
|                     | > paint mixer, brand comparison, gamut         |
|                     | > masking. Freemium. NOT a paint inventory app |
|                     | > --- it is a color matching tool. Significant |
|                     | > note: the open-source community database on  |
|                     | > their GitHub was the primary source for      |
|                     | > PaintForge\'s hex color data (Miniature      |
|                     | > Painter Pro released this data openly).      |
+---------------------+------------------------------------------------+
| > **MiniPaints**    | > iOS + Android. \~4,000 paints. Recipes via   |
|                     | > QR code system, paint mixer, photo color     |
|                     | > capture, analogous/complementary colors.     |
|                     | > French developer. Less actively updated than |
|                     | > competitors.                                 |
+---------------------+------------------------------------------------+
| > **PaintMyMinis**  | > iOS only. Project tracking, recipe sharing,  |
|                     | > paint lists. Very limited compared to        |
|                     | > others. Small audience.                      |
+---------------------+------------------------------------------------+
| > **Citadel/GW      | > GW\'s own app. Locked entirely to Citadel    |
| > App**             | > paints. Irrelevant to multi-brand painters.  |
|                     | > Not a real competitor.                       |
+---------------------+------------------------------------------------+
| > **YouTube /       | > Still the de facto recipe \'platform\' for   |
| > Reddit**          | > the majority of painters. Zero organization, |
|                     | > not searchable by what you own,              |
|                     | > non-monetized for creators. This is the real |
|                     | > incumbent --- not an app.                    |
+---------------------+------------------------------------------------+

Feature Comparison --- PaintForge vs Top Competitors

+---------------------+------------------------------------------------+
| > **Paint database  | > PaintForge: 3,495 (growing). paintRack:      |
| > size**            | > 27,000+. BrushRage: 27,000+. BrushForge:     |
|                     | > 4,300+. PaintVault: 20,000+. --- We are      |
|                     | > currently the smallest. This matters less    |
|                     | > than features and model.                     |
+---------------------+------------------------------------------------+
| > **Web / desktop   | > PaintForge: ✅ Web-first. PaintVault: ✅ Pro |
| > access**          | > tier only. PaintStash: ✅. Others: ❌ Mobile |
|                     | > only. --- This is a real differentiator for  |
|                     | > us.                                          |
+---------------------+------------------------------------------------+
| > **Free tier       | > PaintForge: ✅ No limits. BrushForge: ❌ 40  |
| > limits**          | > paints. PaintVault: ✅ Basic free.           |
|                     | > paintRack: partial (color tools paid).       |
|                     | > BrushRage: ✅ Fully free. --- Our unlimited  |
|                     | > free tier is a genuine differentiator.       |
+---------------------+------------------------------------------------+
| > **Delta E color   | > BrushForge: ✅. PaintVault: ✅. PaintForge:  |
| > matching**        | > 🔨 Building. Others: partial or none.        |
+---------------------+------------------------------------------------+
| > **Creator         | > PaintForge: 🔨 Phase 2. All others: ❌ None. |
| > marketplace**     | > --- This is our unique long-term moat.       |
+---------------------+------------------------------------------------+
| > **Recipe +        | > PaintForge: 🔨 Phase 2 (designed).           |
| > inventory         | > PaintStash: partial. Others: basic or none.  |
| > integration**     |                                                |
+---------------------+------------------------------------------------+
| > **Barcode         | > paintRack: ✅. BrushRage: ✅. PaintVault:    |
| > scanner**         | > ✅. BrushForge: ✅. PaintForge: ❌ Not       |
|                     | > built. --- A gap to close eventually.        |
+---------------------+------------------------------------------------+
| > **Physical paint  | > BrushRage: ✅ (Mixbox). PaintForge: ❌. ---  |
| > mixing**          | > Mixbox is genuinely impressive physics-based |
|                     | > mixing. Worth adding in Phase 2.             |
+---------------------+------------------------------------------------+
| > **Commons model / | > PaintForge: ✅ Unique. All others: ❌ None.  |
| > content           | > --- Nobody else has this structural          |
| > flywheel**        | > approach.                                    |
+---------------------+------------------------------------------------+

> **✦** *Key insight from this analysis: the market is real, proven, and
> active. Multiple solo developers are making sustainable products. The
> gap is not \"nobody has done this\" --- the gap is: nobody combines
> deep inventory, chemistry-aware recipe intelligence, and
> availability-aware substitution in a web-first platform on an
> affiliate-first model. That combination is the moat. Database size is
> a race we do not need to win; the business model and the knowledge
> layer are the differentiators. Against paintRack or BrushRage --- and
> we don\'t need to. Feature completeness is table stakes. The business
> model is the differentiator.*

Note: Miniature Painter Pro Data Attribution

The open-source community paint database on Rick Fleuren\'s Miniature
Painter Pro GitHub repo was used as the primary source for PaintForge\'s
hex color data (3,314 entries). This data was released openly and the
license permits reuse. However, as PaintForge grows, we should
acknowledge this contribution in our about/credits section. Building a
relationship with the community that generated this data is good
practice, not just legal obligation.

8\. Financial Targets & Timeline

Investment Envelope

+---------------------+------------------------------------------------+
| > **Initial         | > \$2,500 -- \$5,000 USD for infrastructure,   |
| > budget**          | > tooling, no-code platform, domain/hosting,   |
|                     | > design assets                                |
+---------------------+------------------------------------------------+
| > **Approach**      | > No-code / low-code MVP first. Validate       |
|                     | > before building custom. Subcontract dev as   |
|                     | > needed --- no employees.                     |
+---------------------+------------------------------------------------+
| > **Monthly         | > Minimal: Google Workspace \~\$12/mo, hosting |
| > overhead**        | > \~\$20--50/mo, no-code platform              |
|                     | > \~\$30--100/mo depending on stack chosen     |
+---------------------+------------------------------------------------+

Revenue Milestones

+---------------------+------------------------------------------------+
| > **Month 3**       | > Platform live. 200+ registered users. First  |
|                     | > paid subscriptions. Target: €500/month       |
+---------------------+------------------------------------------------+
| > **Month 6**       | > Marketplace live. First creator sales.       |
|                     | > Target: €2,000--3,000/month (subscription +  |
|                     | > commission + ads)                            |
+---------------------+------------------------------------------------+
| > **Month 9**       | > AI features live (premium tier). Target:     |
|                     | > €5,000/month                                 |
+---------------------+------------------------------------------------+
| > **Month 12**      | > Second skin in development (terrain/scale).  |
|                     | > Target: €8,000--10,000/month                 |
+---------------------+------------------------------------------------+
| > **Year 2**        | > Multi-skin live, Japan skin in planning,     |
|                     | > partnership discussions with publishers.     |
|                     | > Target: €15,000+/month                       |
+---------------------+------------------------------------------------+

> **✦** *The 6-month target of €5,000/month is achievable with a focused
> launch into the r/minipainting and Warhammer communities --- these are
> extremely active online, respond well to well-designed tools, and have
> proven willingness to pay for premium hobby software. The creator
> marketplace commission is the variable that can accelerate this
> significantly if even a handful of influential painters publish paid
> guides.*

9\. The Japan Angle

Non-Japanese Hobbyists in Japan

There is a completely underserved audience: international hobbyists
living in Japan who cannot navigate the Japanese hobby ecosystem.
Websites are in Japanese, product search is unreliable in English, shop
registration systems are complex, and the hobby community is largely
inaccessible without language skills. The founder is this person.

> **▸** A curated English-language directory and guide to hobby in Japan
> --- shops, products, seasonal events, Rakuten navigation --- costs
> nothing to produce and validates demand before any platform is built
>
> **▸** Newsletter monetization via affiliate links and sponsored
> listings from shops seeking English-speaking customers
>
> **▸** Concierge sourcing: find-and-ship service for specific Japanese
> hobby products (Tamiya exclusives, Mr. Hobby lines, craft store finds)
> --- pull-only, triggered by paid orders, no inventory held

Selling TO Japanese Hobbyists

Japan has high purchase power, loves hobbies, and already pays premium
for imports. The opportunity is sourcing western hobby products that
have poor Japanese distribution and bringing them in with premium
curation and packaging --- similar to how Volks and Yellow Submarine
import western products but with a narrower, more expertly curated
identity.

Possible angle: \'the brand that brings the western indie miniature
scene to Japan.\' Army Painter Speedpaint 2.0, specific indie STL packs,
western terrain materials. High margin, low volume, zero inventory risk
if done as pre-order batches.

> **✦** *The Japan angle is medium-term. It requires a clearer legal
> structure (import/export, business registration) that is premature at
> launch. However, the English-language directory/newsletter can begin
> immediately as a zero-cost demand validation exercise.*

10\. Open Questions & Next Steps

Foundation --- COMPLETED ✅ (July 3, 2026)

> **▸** ✅ Register paintforge.io, paintforge.org --- July 3
>
> **▸** ✅ Register hobbyatelier.io, hobbyatelier.org,
> hobbyatelier.store --- July 3
>
> **▸** ✅ Google Workspace configured --- four email addresses live
> (artificer@, forge@, herald@, admin@)
>
> **▸** ✅ GitHub account created (hobbyatelier-lab), paintforge repo
> initialised and pushed
>
> **▸** ✅ Supabase account created, auto-linked to GitHub as
> hobbyatelier-lab Org
>
> **▸** ✅ Vercel blocked --- pivoted to Netlify. App deployed
> successfully via Netlify + GitHub auto-deploy
>
> **▸** ✅ Supabase database schema deployed (user_paints table, RLS
> policy, index)
>
> **▸** ✅ Supabase preferences schema deployed (user_preferences table
> with hidden_sections, brand/line/section collapse states)
>
> **▸** ✅ MVP app live at: euphonious-croissant-fcc0a7.netlify.app
>
> **▸** ✅ Legal entity confirmed: AYT International SC (Mexico) ---
> personal holding company, operating entity at launch

Database & Hex --- COMPLETED ✅ (July 4, 2026)

> **▸** ✅ Paint database: 3,495 entries across 14 brands --- Citadel,
> Vallejo (full), Army Painter (full), Pro Acryl, Two Thin Coats, P3,
> Scale 75, Reaper, Green Stuff World, Tamiya, Mr Hobby, AK Interactive,
> Indart, Misc
>
> **▸** ✅ Hex color data: 3,314 entries with hex swatch data. Community
> database (Miniature Painter Pro GitHub) used as primary source.
> Cross-brand contamination stripped and corrected.
>
> **▸** ✅ TMM all four tiers (Light/Base/Shade/Airbrush) populated ---
> Airbrush approximated from color chart image, Light/Shade derived
> mathematically
>
> **▸** ✅ Discontinued sections pattern established --- Game Color
> discontinued (30 entries), Wash discontinued (2 entries), Citadel
> Foundation discontinued (91 entries)
>
> **▸** ✅ Speedpaint 2.0: original 47 tracked IDs (APSP01--46) intact
> with hex now added; full 90-entry range browsable as separate section

Immediate --- PENDING

> **▸** ⏳ Point paintforge.io DNS to Netlify --- DNS records in
> Squarespace panel. \~20 minute task. Has been deferred too many times.
>
> **▸** ⏳ Draft Terms of Service --- platform license clause for free
> user content. One-time legal task.
>
> **▸** ⏳ Newsletter: set up ConvertKit free tier for
> herald@paintforge.io
>
> **▸** ⏳ Seed first 10--15 recipe guides --- existing recipe
> documentation (DMD, HZD) ready to format
>
> **▸** ⏳ Delta E LAB color matching feature --- cross-brand
> equivalents using hex data we already have (see Feature Pipeline)
>
> **▸** ⏳ Custom Brand feature --- rename Misc → Custom, 3×150 editable
> slots, user_preferences storage

Open Questions

> **▸** Which community to seed first for launch: r/minipainting,
> Warhammer subreddits, or Discord servers?
>
> **▸** Pricing: €4.99 vs €7.99 vs €9.99/month. Annual discount
> strategy.
>
> **▸** Marketplace commission rate: 20% vs 25% vs 30%.
>
> **▸** Long-term IP ownership structure under AYT International SC ---
> tax review when revenue grows.
>
> **▸** Brand name for terrain/scale modeling skin: TBD once PaintForge
> has traction.

11\. Platform & Account Registry

Living log of every platform, tool, and account used to build and run
PaintForge. Update whenever a new account is created.

+---------------------+------------------------------------------------+
| > **Google          | > Email, admin, domain management. Primary     |
| > Workspace**       | > login: artificer@paintforge.io. ✅ ACTIVE    |
+---------------------+------------------------------------------------+
| > **Squarespace**   | > Domain registrar (via Google Workspace       |
|                     | > flow). All five domains registered here. ✅  |
|                     | > ACTIVE                                       |
+---------------------+------------------------------------------------+
| > **GitHub**        | > Version control. Username: hobbyatelier-lab. |
|                     | > Repo: paintforge (public). ✅ ACTIVE         |
+---------------------+------------------------------------------------+
| > **Supabase**      | > Database + user auth. Org: hobbyatelier-lab. |
|                     | > Auto-linked to GitHub. Project URL:          |
|                     | > cxpydnchumwvemvhyetm.supabase.co. ✅ ACTIVE  |
+---------------------+------------------------------------------------+
| > **Netlify**       | > Hosting + auto-deploy from GitHub. URL:      |
|                     | > euphonious-croissant-fcc0a7.netlify.app.     |
|                     | > Login: artificer@paintforge.io. ✅ ACTIVE    |
+---------------------+------------------------------------------------+
| > **Vercel**        | > ABANDONED --- account flagged on signup July |
|                     | > 3. Support unresponsive. Replaced by Netlify |
|                     | > same day.                                    |
+---------------------+------------------------------------------------+

> **✦** *Keep this table updated. Platform sprawl is a real risk ---
> document before you forget which email you used.*

12\. MVP --- Features Shipped

Live at euphonious-croissant-fcc0a7.netlify.app as of July 3--4, 2026.
Continuously iterated since launch.

Authentication

> **▸** Email + password signup and login via Supabase Auth
>
> **▸** Session persistence across devices and browser refreshes

Paint Database --- Current State

6,259 entries across 13 brands. Hex color swatch data for the majority
of paint entries. Brand order: Citadel → Vallejo → Army Painter → Pro
Acryl → Two Thin Coats → P3 → Scale 75 → Reaper → Green Stuff World →
Tamiya → Mr Hobby → AK Interactive → Indart → Misc.

+---------------------+------------------------------------------------+
| > **Citadel**       | > Base (57), Layer (93), Shade (16), Contrast  |
|                     | > (35), Dry (31), Technical (26), Air (78),    |
|                     | > Spray (12), Glaze (4), Foundation            |
|                     | > discontinued (91) --- 443 total. Full hex    |
|                     | > data.                                        |
+---------------------+------------------------------------------------+
| > **Vallejo**       | > Game Color active (81) + discontinued (30),  |
|                     | > Wash active (8) + discontinued (2), Game Air |
|                     | > (100), Mecha Color (80 incl.                 |
|                     | > Fluo/Metallic/Weathering/Aux/Primer), Xpress |
|                     | > Color + Intense (60), Model Color (222),     |
|                     | > Model Air (235), Metal Color (18), True      |
|                     | > Metal L/B/S/A (80), Wash FX (18), Weathering |
|                     | > FX (26), Premium Airbrush Color (60), Liquid |
|                     | > Gold (8), Surface Primer (25). Total: 1,094. |
+---------------------+------------------------------------------------+
| > **Army Painter**  | > ✅ CATALOG REVIEWED IN FULL (July 5--6).     |
|                     | > Warpaints Fanatic (180), Fanatic Wash (32),  |
|                     | > Warpaints (111), Warpaints Air (126),        |
|                     | > Quickshade (11), Warpaints Tone (10),        |
|                     | > Warpaints Wash (2), Metallic Colours (10),   |
|                     | > Skin Tones (13 + 3 Wash), Speedpaint 2.0 (80 |
|                     | > base + 10 metallic), Speedpaint 1.0 (24),    |
|                     | > D&D Nolzurs Marvelous Pigments (61 base + 4  |
|                     | > wash + 1 primer), Primer (26). Total: 643.   |
+---------------------+------------------------------------------------+
| > **Pro Acryl**     | > Base (75), Signature Series (42), Wash (3),  |
|                     | > Primer (11) --- 131 total                    |
+---------------------+------------------------------------------------+
| > **Two Thin        | > Wave 1 (60), Wave 2 (60), Wave 3 (60) ---    |
| > Coats**           | > 180 total, full range                        |
+---------------------+------------------------------------------------+
| > **P3**            | > Formula P3 (126), Wash (5) --- 131 total     |
+---------------------+------------------------------------------------+
| > **Scale 75**      | > Scale Color (63), Fantasy & Games (48),      |
|                     | > Instant Colors (48), Inktensity (8), Metal N |
|                     | > Alchemy (24), Artist Range (78) --- 269      |
|                     | > total                                        |
+---------------------+------------------------------------------------+
| > **Reaper**        | > Core Colors (274), Wash (6), Bones (99),     |
|                     | > Pathfinder (56) --- 435 total                |
+---------------------+------------------------------------------------+
| > **Green Stuff     | > Acrylic Colors (104), Metallic (19), Dipping |
| > World**           | > Inks (36), Intensity Ink (12), Wash Ink (8), |
|                     | > Chameleon Colorshift (18), Candy Ink (8),    |
|                     | > Fluor Metallic (9) --- 214 total             |
+---------------------+------------------------------------------------+
| > **AK              | > ✅ EXPANDED (July 6). 3rd Generation:        |
| > Interactive**     | > Standard (177), AFV (80), Air (120), Figures |
|                     | > (40), Inks (12), Metallics (21), Intense     |
|                     | > (11), Pastel (6), Auxiliary (6). Legacy      |
|                     | > Ranges: AFV (148), Figures (90), General     |
|                     | > (29), Naval (19). Primer 3rd Gen (13),       |
|                     | > Primers 100ml (10), Misc (1). Total: 783.    |
+---------------------+------------------------------------------------+
| > **Tamiya**        | > ✅ CATALOG REVIEWED IN FULL. Acrylics Flat   |
|                     | > XF (71), Acrylics Gloss X (33), Lacquer      |
|                     | > Paint (83), Color for Aircraft (32), Color   |
|                     | > Spray (101), Accent Color (9), Weathering    |
|                     | > Stick (4), Weathering Master A--H (8),       |
|                     | > Finishing (4), Cement & Putty (24), Masking  |
|                     | > (15), Crafting & Preparation (15). Missing   |
|                     | > --- not in community database, needs manual  |
|                     | > entry: Enamel Paint (full range), Spray for  |
|                     | > Polycarbonate (PS series), Paint Markers.    |
+---------------------+------------------------------------------------+
| > **Mr Hobby**      | > Weathering Liner PL01--09 (9), Gundam Marker |
|                     | > (5)                                          |
+---------------------+------------------------------------------------+
| > **Indart**        | > Pigments (15), Auxiliaries (1)               |
+---------------------+------------------------------------------------+
| > **Misc**          | > CA Glue --- Aron Alfa Pro                    |
+---------------------+------------------------------------------------+

> **✦** *Hex data sourced from Miniature Painter Pro open-source
> community database (GitHub). Cross-brand contamination stripped ---
> only SKU-matched or name-matched-within-brand values retained. TMM all
> four tiers populated via image approximation (Airbrush) with
> Light/Shade derived mathematically (+28% white / −35% black from
> Base). Tamiya Weathering and Mr Hobby Liner have no hex (stripped
> contamination, no clean source yet).*

Discontinued Section Pattern

> **▸** Discontinued paints separated into clearly labelled subsections
> --- e.g. \'Game Color Base (Discontinued)\', \'Game Color Wash
> (Discontinued)\'
>
> **▸** Names in discontinued sections are clean --- no
> \'(discontinued)\' suffix; the section header carries that meaning
>
> **▸** Pattern established for Vallejo Game Color (30 entries: Heavy
> range, old blues/greens, blood/rust effects) and Wash (73.202 Pale
> Grey, 73.205 Green)
>
> **▸** Applies equally to Citadel Foundation discontinued (91 entries)
> already separated into its own section
>
> **✦** *Design principle: discontinued paints are present for recipe
> documentation and backward compatibility, but should never clutter
> active collection views. Hide via Brand Filter or collapse the section
> header.*

Paint Row UI

> **▸** Fixed-width left cluster: ♦ My Set · ✓ Owned · Role badge slot ·
> Hex swatch slot --- all fixed width, name column always aligns
>
> **▸** Hex swatch: filled colored circle when known · empty ring with ?
> when no data --- consistent width either way
>
> **▸** L/B/S/A role badges on True Metal paints
> (Light/Base/Shade/Airbrush)
>
> **▸** Low stock badge (+N), orange backup dots (1--5), teal target
> dots (1--5)

Navigation & Organisation

> **▸** Three-level hierarchy: Brand → Line → Section, all independently
> collapsible
>
> **▸** Section headers show owned/total count
>
> **▸** Search bar across all visible sections by name or SKU

Brand Filter Panel

> **▸** Slide-in panel --- toggle visibility at brand, line, or section
> level
>
> **▸** Tri-state checkboxes: ✓ / --- / ☐. All on / All off buttons
>
> **▸** Brands button shows red badge with hidden section count

Preference Persistence

> **▸** All preferences auto-saved to Supabase (600ms debounce): hidden
> sections, brand/line/section collapse states
>
> **▸** Restores exactly on every login, every device

Progress Bars

> **▸** Collection % and My Set % bars both count only currently visible
> sections --- respects brand filter
>
> **▸** If Citadel is hidden via Brand Filter, those 443 entries drop
> out of both the total count and owned count
>
> **▸** Bars reflect exactly what you are browsing, nothing more

Content Filters & Export

> **▸** Filters: All, Owned ✓, Missing, My Set ♦, Need Restock, Low
> Stock ⚠
>
> **▸** Export inventory (text, auto-copied), Shopping list 🛒 with
> quantities
>
> **▸** How to Use ? modal --- full documentation including hierarchy,
> brand filters, row anatomy, preference persistence

13\. Feature Pipeline & Product Backlog

Planned features in rough priority order. Priorities will shift based on
user feedback.

Data --- Brand Catalog Review Strategy

Going brand by brand through each manufacturer\'s official catalog to
ensure complete product line coverage. Rationale: every additional
product in the database is a potential affiliate link touchpoint. A
painter looking for their varnish, cement, primer, or masking tape
should find it here --- not just their paints. Consumables in particular
are repeat purchases and the highest-value affiliate targets. Status
below is updated as each brand is reviewed.

+---------------------+------------------------------------------------+
| > **Army Painter**  | > ✅ REVIEWED IN FULL --- All known product    |
|                     | > lines in database. Warpaints Fanatic,        |
|                     | > Classic, Air, Tone, Metallics, Skin Tones,   |
|                     | > Speedpaint 1.0 & 2.0 (with full D&D          |
|                     | > Nolzur\'s range), Primer.                    |
+---------------------+------------------------------------------------+
| > **Tamiya**        | > ✅ REVIEWED IN FULL --- All                  |
|                     | > community-database lines added: Acrylics     |
|                     | > (XF/X), Lacquer, Aircraft Spray, Color       |
|                     | > Spray, Accent Color, Weathering              |
|                     | > Stick/Master, Finishing, Cement & Putty,     |
|                     | > Masking, Crafting & Preparation. ⚠ NOT IN    |
|                     | > COMMUNITY DB (manual entry needed): Enamel   |
|                     | > Paint (full range), Spray for Polycarbonate  |
|                     | > (PS series), Paint Markers.                  |
+---------------------+------------------------------------------------+
| > **Vallejo**       | > ⏳ Partially reviewed. Game Color, Mecha,    |
|                     | > Xpress, Model Color/Air, Game Air, True      |
|                     | > Metal, Surface Primer, Metal Color, Wash FX, |
|                     | > Weathering FX in database. Not yet reviewed: |
|                     | > full auxiliaries catalog, varnish lines      |
|                     | > beyond what we have.                         |
+---------------------+------------------------------------------------+
| > **Citadel**       | > ⏳ All paint lines added. Consumables (spray |
|                     | > cans, etc.) not systematically reviewed.     |
+---------------------+------------------------------------------------+
| > **Army Painter**  | > ⏳ Bases and basing materials not reviewed   |
|                     | > --- could be relevant for terrain/diorama    |
|                     | > users.                                       |
+---------------------+------------------------------------------------+
| > **Mr Hobby**      | > ⏳ Mr Color, Aqueous, Acrysion, Gundam Color |
|                     | > in database. Full consumables catalog (Mr    |
|                     | > Color Thinner, Mr Surfacer, Mr Mark Softer,  |
|                     | > etc.) not yet reviewed.                      |
+---------------------+------------------------------------------------+
| > **AK              | > ⏳ 3rd Gen full range in database. Legacy    |
| > Interactive**     | > ranges (AFV, Air, Figures non-3rd-gen) and   |
|                     | > consumables not yet reviewed.                |
+---------------------+------------------------------------------------+
| > **MIG Ammo**      | > ⏳ Not yet added. 252 entries in community   |
|                     | > database --- Acrylics (228), Primers (12),   |
|                     | > Washes (12). Weathering/scale crossover      |
|                     | > audience.                                    |
+---------------------+------------------------------------------------+
| > **Warcolours**    | > ⏳ Not yet added. 178 entries --- Layer      |
|                     | > paints, Inks, Metallics.                     |
+---------------------+------------------------------------------------+
| > **Kimera Kolors** | > ⏳ Not yet added. 39 entries --- Pure        |
|                     | > Pigments, Signature Sets.                    |
+---------------------+------------------------------------------------+
| > **Turbo Dork**    | > ⏳ Not yet added. 40 entries --- Colorshift  |
|                     | > specialty paints.                            |
+---------------------+------------------------------------------------+
| > **Scale 75**      | > ⏳ Main ranges in database. Soil Works (14)  |
|                     | > not yet added.                               |
+---------------------+------------------------------------------------+
| > **Reaper**        | > ⏳ Core Colors, Bones, Pathfinder, Wash in   |
|                     | > database. Primer (3) not yet added.          |
+---------------------+------------------------------------------------+

> **✦** *The strategic reason to be thorough: affiliate links trigger at
> purchase intent --- a painter building a shopping list needs their
> cement, masking tape, and primer alongside their paints. The more
> complete our catalog, the more of their basket we capture. This is
> especially true for Tamiya and Mr Hobby where consumables are central
> to the modeler workflow.*

Data --- Hex Completion Remaining

> **▸** ✅ TMM all four tiers --- DONE. Airbrush tier read from Vallejo
> color chart image; Light/Shade derived mathematically. Approximate but
> coherent.
>
> **▸** ✅ Speedpaint 2.0 --- DONE. Full 90-entry range (80 base + 10
> metallic) in database with hex, properly split into sections.
>
> **▸** ✅ Army Painter --- DONE. All sections have hex from community
> database via name/SKU matching.
>
> **▸** ⏳ Tamiya weathering/accent products --- no hex. These are
> enamel-based tools, not pigment colors; hex is less meaningful here.
> Empty rings are honest.
>
> **▸** ⏳ Tamiya Enamel Paint, Polycarbonate Spray, Paint Markers ---
> not in community database. Manual entry needed before hex is even
> possible.
>
> **▸** ⏳ Mr Hobby consumables --- similar situation; tools and
> thinners have no meaningful hex.

Near Term --- Custom Brand

> **▸** Rename \'Misc\' brand header to \'Custom\'
>
> **▸** 3 preset section headers × 150 entries each = 450 total custom
> slots
>
> **▸** Preset SKU IDs (CUSTOM_01_001 through CUSTOM_03_150) ---
> hardcoded to prevent DB schema chaos
>
> **▸** Custom names stored in user_preferences JSON blob --- no new DB
> table needed
>
> **▸** Inline pencil-icon editing for section headers and individual
> entries
>
> **✦** *Design constraint: all custom SKUs are pre-built as empty
> slots. Users fill in names but cannot create new DB rows. Keeps the
> data model clean.*

Phase 2 --- Recipe & Workflow Builder

> **▸** Step-by-step workflow: photos, technique tags, YouTube
> timestamps, notes
>
> **▸** Recipe cross-references owned inventory --- shows which paints
> you have vs. need
>
> **▸** Public by default on free tier (commons model); private on paid
> tier
>
> **▸** Technique-first search --- chipping, NMM, blending --- not
> game-first

Phase 2 --- Creator Marketplace

> **▸** Paid recipe and guide listings --- creators set prices, platform
> takes 20--30% commission
>
> **▸** Marketplace × inventory integration --- buy a guide, instantly
> see which paints you own
>
> **▸** Creator analytics: views, sales, conversion rates
>
> **▸** Upgrade flywheel: free users create public recipes → get
> engagement → upgrade to sell

Phase 3 --- AI Features (Premium Tier)

> **▸** Palette suggestion from reference image --- calibrated against
> owned inventory
>
> **▸** Colour blocking on mini photo --- paint colour zones with a
> finger, get recipe suggestions per zone
>
> **▸** Auto-suggest missing paints based on recipe browsing and
> collection

Near Term --- Delta E LAB Color Matching ⭐ New Priority

We now have hex color data for 3,314 paints across 14 brands. Delta E
2000 is the perceptual color difference formula used professionally in
color science --- it measures how different two colors look to human
eyes, not just how different the RGB numbers are. This is what
BrushForge uses as their flagship differentiator. We can build it with
what we already have.

> **▸** Implementation: RGB → LAB color space conversion + Delta E 2000
> formula, both pure JavaScript --- no API, no external service, runs
> entirely in the browser
>
> **▸** Feature: \'Find Similar\' panel --- select any paint, instantly
> see the 10 closest matches across all brands in your inventory, then
> across all brands in the database
>
> **▸** Feature: cross-brand equivalent finder --- \'What is the closest
> Vallejo to Citadel Agrax Earthshade?\' answered instantly with ΔE
> distance score
>
> **▸** Feature: \'Colors I already own\' --- when viewing a recipe that
> calls for Citadel Mephiston Red, show the closest thing in your actual
> owned collection
>
> **▸** No new data needed --- the hex data is already built. This is a
> pure logic feature on top of existing infrastructure
>
> **✦** *This is the single most impactful near-term feature given our
> current data position. BrushForge built it from scratch with a
> dedicated dataset. We can ship it in one session using what we already
> have. Estimated build time: 3--5 hours including UI.*

Near Term --- Competitive Response to BrushForge

BrushForge (brushforgeapp.com) is a mobile-native solo-developer app
with real traction. Their strengths are Delta E color matching, AI
recipe generation, and mobile polish. Their weaknesses are the 40-paint
free limit, mobile-only (no web), no iOS↔Android sync, and ads on free.
PaintForge\'s structural response:

> **▸** Web-first = universal. No install, works on every device, same
> URL everywhere. This is a bigger deal than it sounds --- mobile apps
> require App Store approval for every update; we ship instantly.
>
> **▸** No paint limit on free tier --- ever. 40 paints is insulting to
> a real painter. Our commons model is more generous by design, not
> accident.
>
> **▸** Delta E matching --- build it now, it\'s not proprietary. They
> don\'t own the math.
>
> **▸** Creator marketplace is our long-game differentiator ---
> BrushForge has no monetization path for creators. We do.
>
> **▸** Do not build a mobile app in response. Web-first is the right
> call. Focus on what web does better: instant updates, SEO, shareable
> URLs, desktop workflows.

Infrastructure

> **▸** ⏳ Connect paintforge.io DNS to Netlify --- OVERDUE. DNS records
> in Squarespace panel, \~20 min propagation. Do this first thing
> tomorrow.
>
> **▸** Set up newsletter sending for herald@paintforge.io (ConvertKit
> free tier recommended)
>
> **▸** Citadel/GW IP licensing tier --- DMs Guild model --- explore
> once platform has real traction
>
> **▸** Second brand skin (terrain/scale modeling) --- when PaintForge
> has stable revenue

14\. Session Roadmap --- Next Steps

Concrete plan for the next two sessions. Ordered by priority.

Completed --- July 7

+---------------------+------------------------------------------------+
| > **✅ Password     | > Auth.jsx: PASSWORD_RECOVERY event listener,  |
| > Reset**           | > two-field reset form, updateUser({ password  |
|                     | > }). Dead-end bug eliminated.                 |
+---------------------+------------------------------------------------+
| > **✅ PostHog      | > EU Cloud snippet in index.html.              |
| > Analytics**       | > phc                                          |
|                     | _BVB8pFzUSedTuPMukUzibECLam63K5dX5oGHR3FtuvUA. |
|                     | > Pageview + pageleave. match_run event        |
|                     | > pending ΔE.                                  |
+---------------------+------------------------------------------------+
| > **✅              | > React.memo on ColorRow with custom           |
| > Memoization**     | > comparator. 300ms debounced search.          |
|                     | > ΔE-ready.                                    |
+---------------------+------------------------------------------------+
| > **✅ Filter       | > active_filter saved to Supabase              |
| > persistence**     | > (ADD_ACTIVE_FILTER.sql migration).           |
|                     | > First-time default: All. Returns to          |
|                     | > last-used state.                             |
+---------------------+------------------------------------------------+
| > **✅ Expand level | > Five buttons: Custom / All / Section / Line  |
| > controls**        | > / Brand. Effective collapse computed ---     |
|                     | > custom state never overwritten by presets.   |
|                     | > Search auto-expands visually without state   |
|                     | > mutation.                                    |
+---------------------+------------------------------------------------+
| > **✅ Search ✕     | > Circular X inside search bar, clears         |
| > clear button**    | > instantly on click.                          |
+---------------------+------------------------------------------------+
| > **✅ How-to-use   | > HowToUse.jsx fully controlled component.     |
| > checkbox**        | > seenHowToUse in main debounced upsert.       |
|                     | > Auto-show fires once on load via             |
|                     | > useEffect(\[loaded\]).                       |
+---------------------+------------------------------------------------+
| > **✅ AK           | > Auxiliaries and Varnish under Primers line.  |
| > taxonomy**        | > Standard Clear section (AK11213--18). Ghost  |
|                     | > sections removed. Varnish hex stripped       |
|                     | > (transparent).                               |
+---------------------+------------------------------------------------+
| > **✅ Indart       | > Unreliable catalog --- names on bottles do   |
| > removed**         | > not match official listings. Diluyente moved |
|                     | > to CUSTOM_002. Grand total: 6,201 entries /  |
|                     | > 13 brands.                                   |
+---------------------+------------------------------------------------+
| > **✅ Custom       | > CUSTOM_001: CA Glue - Aron Alfa Pro (20g).   |
| > entries**         | > CUSTOM_002: Diluyente para Acrílicos -       |
|                     | > Pintart (125ml).                             |
+---------------------+------------------------------------------------+

Completed --- July 5--6

+---------------------+------------------------------------------------+
| > **✅ DNS**        | > paintforge.io live on Netlify. A record +    |
|                     | > CNAME configured via Squarespace.            |
+---------------------+------------------------------------------------+
| > **✅ Brand        | > Logo SVG (clean, no background) on login     |
| > Identity**        | > splash and app header. Montserrat font       |
|                     | > system-wide. Wordmark: \'Paint\' cyan        |
|                     | > (#36E2DD) / \'forge\' muted teal-grey        |
|                     | > (#8AABAB). Loading screen logo.              |
+---------------------+------------------------------------------------+
| > **✅ Design       | > Full design system documented (Section 15).  |
| > Language**        | > Unified hierarchy colors: Brand #36E2DD /    |
|                     | > Line #2BABA8 / Section #6B9898. Crimson      |
|                     | > #e94560 retired.                             |
+---------------------+------------------------------------------------+
| > **✅ Database     | > 5,514 entries (from 3,495). Full completion  |
| > Expansion**       | > pass: Army Painter reviewed in full, Tamiya  |
|                     | > reviewed in full, AK Interactive legacy      |
|                     | > ranges (AFV 148, Figures 90, General 29,     |
|                     | > Naval 19), Vallejo Liquid Gold + Premium     |
|                     | > Airbrush, Mr Hobby specialty metallics/clear |
|                     | > lines, Scale 75 Soil Works, Reaper Primer.   |
+---------------------+------------------------------------------------+
| > **✅ Database     | > Zero empty IDs, zero duplicate IDs. D&D      |
| > Cleanup**         | > restructured (all under Nolzurs line).       |
|                     | > wash/washDisc moved to proper top-level. AK  |
|                     | > legacy TAXONOMY fixed.                       |
+---------------------+------------------------------------------------+
| > **✅ Speedpaint   | > Split into base (80) and metallic (10). Old  |
| > 2.0**             | > APSP tracked IDs retired after user          |
|                     | > migration.                                   |
+---------------------+------------------------------------------------+
| > **✅ Tamiya**     | > Full catalog: Acrylics XF/X, Lacquer,        |
|                     | > Aircraft Spray, Color Spray, Accent Color,   |
|                     | > Weathering Stick/Master, Finishing, Cement & |
|                     | > Putty, Masking, Crafting & Preparation.      |
+---------------------+------------------------------------------------+

Next Session --- Feature Backlog (Prioritized)

+---------------------+------------------------------------------------+
| > **Delta E LAB     | > Cross-brand equivalents using existing hex   |
| > color matching**  | > data. Pure JS --- RGB→LAB + ΔE2000. \'Find   |
|                     | > Similar\' panel from any paint row. 3--4     |
|                     | > hours estimated. This is the most impactful  |
|                     | > near-term feature.                           |
+---------------------+------------------------------------------------+
| > **Custom Brand**  | > Rename Misc → Custom. 3 section headers ×    |
|                     | > 150 editable slots. Labels in                |
|                     | > user_preferences JSON. No new DB tables.     |
+---------------------+------------------------------------------------+
| > **ConvertKit      | > herald@paintforge.io. Free tier setup,       |
| > newsletter**      | > domain verification, basic welcome sequence. |
|                     | > \~45 minutes.                                |
+---------------------+------------------------------------------------+
| > **Warcolours +    | > 178 + 39 entries in hand. Small, fast, adds  |
| > Kimera Kolors**   | > credibility with serious painters.           |
+---------------------+------------------------------------------------+

UI Improvements --- Queued

+---------------------+------------------------------------------------+
| > **Rename          | > \'Brands\' → \'Brand Filter\'. More accurate |
| > \'Brands\'        | > --- it\'s a filter panel, not a brand        |
| > button**          | > directory. One-line change.                  |
+---------------------+------------------------------------------------+
| > **Level counters  | > Add owned/total counters to Brand and Line   |
| > with missing      | > headers (currently only on Section level).   |
| > items**           | > Add a (N missing) indicator in parentheses   |
|                     | > after each count. The completionist brain    |
|                     | > needs this number --- it\'s also an          |
|                     | > engagement mechanism that drives tracking    |
|                     | > behavior. Must respect brand filter state    |
|                     | > (count only visible sections, consistent     |
|                     | > with the progress bars).                     |
+---------------------+------------------------------------------------+
| > **Auth: email     | > Enable Supabase email confirmation on signup |
| > confirmation +    | > (Supabase dashboard setting + UI feedback in |
| > password          | > Auth.jsx). Add \'Forgot password\' flow:     |
| > recovery**        | > input email → trigger Supabase password      |
|                     | > reset → confirm message. Now that the app is |
|                     | > live and public, troll prevention and        |
|                     | > account recovery are real concerns.          |
+---------------------+------------------------------------------------+
| > **How to Use      | > Show the How to Use modal automatically on   |
| > popup on          | > first login and after major version updates. |
| > startup**         | > Add a checkbox: \'Don\'t show this on        |
|                     | > startup\' (stored in user_preferences).      |
|                     | > Override: major updates re-show regardless   |
|                     | > of preference. Add subtle text left of the ? |
|                     | > button: something like \'How to use          |
|                     | > PaintForge\' --- small, not obtrusive,       |
|                     | > discoverable. Helps new users who don\'t     |
|                     | > know the ? button exists.                    |
+---------------------+------------------------------------------------+

> **✦** *The guiding principle stays: a useful tool beats a complete
> dataset. Delta E first --- then brands. The UI improvements above are
> all low-complexity, high-impact UX changes that make the app feel more
> finished without requiring new infrastructure.*

15\. Brand & Design Language

PaintForge\'s visual identity is finalized as of July 5, 2026. This
section is the authoritative design reference for all digital and print
applications.

Logo

The PaintForge mark is an anvil silhouette with liquid paint flowing
over the top edge and dripping from the horn --- forge and paint fused
into one shape that illustrates the name itself. The canonical file is
logo.svg --- a clean, no-background SVG with transparent alpha. This
version works on any background color. The earlier 6-color flat version
with dark fill background is retired for app use. Neon glow version
retained for web hero contexts only.

> **✦** *Logo file: logo.svg (clean, no-background, transparent alpha)
> is the canonical master. Stored in src/assets/logo.svg. Always use SVG
> for web. Export PNG at 192×192 and 512×512 for PWA manifest. Do not
> use the glow version below 64px. Four-pointed star: resolved and
> removed --- see §28.*

Wordmark

The wordmark pairs the logo with the product name in two-color
treatment: \'Paint\' in brand cyan (#36E2DD), bold weight 800; \'forge\'
in muted teal-grey (#8AABAB), weight 600. No space between the words.
Always lowercase \'forge\'. Note: the previous charcoal #2E3A3A was
near-invisible on dark backgrounds --- #8AABAB reads clearly while
remaining subordinate to the cyan. The visual effect --- \'forge\'
fading into the dark background while \'Paint\' glows --- is intentional
and defines the brand personality.

Color Palette

+---------------------+------------------------------------------------+
| > **Brand Cyan      | > PRIMARY. The liquid paint, the glow, the     |
| > #36E2DD**         | > \'Paint\' wordmark. Brand headers, CTAs,     |
|                     | > active states. Never used as a background at |
|                     | > large scale.                                 |
+---------------------+------------------------------------------------+
| > **Warm Teal       | > SECONDARY. Sub-brand usage, secondary        |
| > #2BABA8**         | > interactive elements. Deprecated for line    |
|                     | > headers (now Amber).                         |
+---------------------+------------------------------------------------+
| > **Amber #E8A838** | > LINE HEADERS. Product line level in          |
|                     | > hierarchy. Warm gold --- distinct from cyan, |
|                     | > readable on dark.                            |
+---------------------+------------------------------------------------+
| > **Soft Violet     | > SECTION HEADERS. Third tier in hierarchy.    |
| > #9B8FD0**         | > Clearly tertiary --- no confusion with cyan  |
|                     | > or amber.                                    |
+---------------------+------------------------------------------------+
| > **Muted Teal      | > TERTIARY. Section headers, labels, captions. |
| > #6B9898**         | > Reads as functional, not brand.              |
+---------------------+------------------------------------------------+
| > **Logo Charcoal   | > LOGO BACKGROUND. Darkest SVG tone. Used for  |
| > #21211F**         | > the \'forge\' wordmark text.                 |
+---------------------+------------------------------------------------+
| > **App Dark        | > APP BACKGROUND. Main surface. Warm           |
| > #141414**         | > near-black.                                  |
+---------------------+------------------------------------------------+
| > **Header Dark     | > STICKY HEADER. Slight elevation above app    |
| > #171B1B**         | > background.                                  |
+---------------------+------------------------------------------------+
| > **Card Dark       | > MODALS & PANELS. Filter panel, export        |
| > #1E2428**         | > windows, auth card.                          |
+---------------------+------------------------------------------------+
| > **Border          | > BORDERS. Subtle structure --- invisible at   |
| > #2A3035**         | > glance, visible on focus.                    |
+---------------------+------------------------------------------------+
| > **Text Primary    | > PRIMARY TEXT. Near-white with a cool-teal    |
| > #F0F4F4**         | > tint.                                        |
+---------------------+------------------------------------------------+
| > **Text Muted      | > SECONDARY TEXT. Labels, captions,            |
| > #6B8080**         | > placeholders.                                |
+---------------------+------------------------------------------------+
| > **Retired Red     | > RETIRED. The original crimson. Zero          |
| > #e94560**         | > remaining uses in codebase as of July 5.     |
+---------------------+------------------------------------------------+

Typography

+---------------------+------------------------------------------------+
| > **Montserrat**    | > PRIMARY. All UI --- wordmark, headings,      |
|                     | > buttons, labels, body. Google Fonts, free    |
|                     | > commercial. Weights in use: 400, 500, 600,   |
|                     | > 700, 800. The geometric construction matches |
|                     | > the angular quality of the anvil mark.       |
+---------------------+------------------------------------------------+
| > **Poppins**       | > ALTERNATE. Softer, rounder. Consumer-facing  |
|                     | > pages, onboarding.                           |
+---------------------+------------------------------------------------+
| > **Lato**          | > FALLBACK. System CSS font stack only.        |
+---------------------+------------------------------------------------+
| > **Monospace**     | > FUNCTIONAL. SKU codes, export text,          |
|                     | > technical fields only. Not a brand font.     |
+---------------------+------------------------------------------------+

UI Hierarchy --- Three-Level Color System

The Brand → Line → Section hierarchy uses one color per level across all
brands. Per-brand rainbow colors are retired.

+---------------------+------------------------------------------------+
| > **Brand headers   | > #36E2DD Brand Cyan. Uppercase, weight 800,   |
| > (Level 1)**       | > 0.08em tracking. Most prominent --- identity |
|                     | > level.                                       |
+---------------------+------------------------------------------------+
| > **Line headers    | > #2BABA8 Warm Teal. Sentence case, weight     |
| > (Level 2)**       | > 600. Clearly subordinate --- product line    |
|                     | > level.                                       |
+---------------------+------------------------------------------------+
| > **Section headers | > #6B9898 Muted Teal. Uppercase, weight 700,   |
| > (Level 3)**       | > smallest size. Reads as data label ---       |
|                     | > organizational level.                        |
+---------------------+------------------------------------------------+

> **✦** *All three tones share the same hue family (teal-cyan) but
> differ in brightness and saturation. A painter scanning 5,000 paints
> knows instantly what level they are looking at without reading the
> text.*

What Changed --- July 5, 2026

> **▸** Logo SVG on login splash and app header --- replaces the ⚒
> hammer emoji placeholder
>
> **▸** Montserrat replaces Inter as the app typeface across all
> components
>
> **▸** Crimson #e94560 fully retired --- zero remaining references in
> source
>
> **▸** AK Interactive: removed duplicate Primers (100ml) and Misc
> sections; split Primer 3rd Gen (10) and Varnish (3) cleanly
>
> **▸** Misc brand renamed to Custom with 5 × 100 placeholder slots
> (CUSTOM_001--500) for future Custom Brand feature
>
> **▸** Logo updated: canonical file is now logo.svg --- clean
> no-background transparent SVG
>
> **▸** Brand/Line/Section hierarchy: three unified teal tones replace
> per-brand rainbow
>
> **▸** Sticky header: charcoal #171B1B --- purple gradient removed
>
> **▸** Progress bars: cyan gradient (Collection), teal gradient (My
> Set)
>
> **▸** Login screen: full redesign --- logo, wordmark, dark card,
> brand-consistent form

16\. Inventory Contents Annex

Complete listing of all brands, lines, and sections in the inventory as
of July 6, 2026. Counts in parentheses. Structure mirrors the Brand
Filter panel in the app.

ADDED --- In Database

+---------------------+------------------------------------------------+
| > **CITADEL (450)** | > Paint Range: Base (57), Layer (93), Shade    |
|                     | > (16), Contrast (35), Dry (31), Technical     |
|                     | > (26), Glaze (4) --- Spray & Air: Air (78),   |
|                     | > Spray (12) --- Discontinued: Foundation      |
|                     | > (90), Foundation Wash (8)                    |
+---------------------+------------------------------------------------+
| > **VALLEJO         | > Game Color: Base (81), Metallic (9), Ink     |
| > (1,094)**         | > (12), Fluo (8), Special FX (12), Wash (8),   |
|                     | > Base Discontinued (30), Wash Discontinued    |
|                     | > (2) --- Mecha Color: Base (42), Fluo (4),    |
|                     | > Metallic (11), Weathering (11), Auxiliaries  |
|                     | > (7), Primer (5) --- Game Air (100) ---       |
|                     | > Xpress Color: Standard (52), Intense (8) --- |
|                     | > Model Color (222) --- Model Air (235) ---    |
|                     | > Metal Color (18) --- True Metal: Light (20), |
|                     | > Base (20), Shade (20), Airbrush (20) --- FX  |
|                     | > & Wash: Wash FX (18), Weathering FX (26) --- |
|                     | > Premium Airbrush Color (60) --- Liquid Gold  |
|                     | > (8) --- Surface Primer (25)                  |
+---------------------+------------------------------------------------+
| > **ARMY PAINTER    | > Warpaints Fanatic: Fanatic (180), Fanatic    |
| > (643)**           | > Wash (32) --- Warpaints: Warpaints (111),    |
|                     | > Air (126), Quickshade (11), Tone (10), Wash  |
|                     | > (2), Metallic Colours (10), Skin Tones (13), |
|                     | > Skin Tones Wash (3) --- Speedpaint 2.0: Base |
|                     | > (80), Metallic (10) --- Speedpaint 1.0 (24)  |
|                     | > --- D&D Nolzurs: Marvelous Pigments (61),    |
|                     | > Wash (4), Primer (1) --- Primer (26)         |
+---------------------+------------------------------------------------+
| > **PRO ACRYL       | > Base (75), Signature Series (42), Wash (3),  |
| > (131)**           | > Primer (11)                                  |
+---------------------+------------------------------------------------+
| > **TWO THIN COATS  | > Wave 1 (60), Wave 2 (60), Wave 3 (60)        |
| > (180)**           |                                                |
+---------------------+------------------------------------------------+
| > **P3 (131)**      | > Formula P3 (126), Wash (5)                   |
+---------------------+------------------------------------------------+
| > **SCALE 75        | > Paint Ranges: Scale Color (63), Fantasy &    |
| > (358)**           | > Games (48), Instant Colors (48), Warfront    |
|                     | > (64), Artist Range (78) --- Special:         |
|                     | > Inktensity (8), Metal N Alchemy (24), FX     |
|                     | > Range (8), Primers (3), Soil Works (14)      |
+---------------------+------------------------------------------------+
| > **REAPER (438)**  | > Master Series: Core Colors (274), Wash (6),  |
|                     | > Bones (99), Pathfinder (56), Primer (3)      |
+---------------------+------------------------------------------------+
| > **GREEN STUFF     | > Paints: Acrylic Colors (104), Metallic       |
| > WORLD (220)**     | > Colors (19) --- Inks & Effects: Dipping Inks |
|                     | > (36), Intensity Ink (12), Wash Ink (8),      |
|                     | > Chameleon Colorshift (18), Candy Ink (8),    |
|                     | > Fluor Metallic (9) --- Surface (6)           |
+---------------------+------------------------------------------------+
| > **TAMIYA (555)**  | > Enamel Paint: Gloss (14), Flat (45),         |
|                     | > Metallic (13), Satin (1), Auxiliaries &      |
|                     | > Clear (10) --- Acrylics: Gloss (14), Flat    |
|                     | > (67), Metallic (13), Satin (1), Clear (9),   |
|                     | > Auxiliaries (5) --- Lacquer Paint (83) ---   |
|                     | > Spray: Color for Aircraft (32), Color Spray  |
|                     | > (101), Spray for Polycarbonate PS series     |
|                     | > (62) --- Paint Markers (6) --- Weathering &  |
|                     | > Accents: Accent Color (9), Weathering Stick  |
|                     | > (4), Weathering Master (8) --- Consumables & |
|                     | > Tools: Finishing (4), Cement & Putty (24),   |
|                     | > Masking (15), Crafting & Preparation (15).   |
|                     | > ✅ ALL 7 LINES COMPLETE with official chip   |
|                     | > hex data                                     |
+---------------------+------------------------------------------------+
| > **MR HOBBY        | > Mr Color Lacquer: Mr Color (219), GX (8),    |
| > (609)**           | > Gundam Color (16), Modulation Set (16),      |
|                     | > Gundam Color for Builders (4), Gundam Color  |
|                     | > Spray (15) --- Specialty Metallics: Metallic |
|                     | > Color GX (17), Metal Color (9), Super        |
|                     | > Metallic 2 (6), Super Metallic (1) --- Clear |
|                     | > & Effects: Clear Color GX (11), Crystal      |
|                     | > Color (8), Primary Color Pigments (3) ---    |
|                     | > Aqueous / Acrysion: Aqueous Hobby Color      |
|                     | > (172), Acrysion (90) --- Tools & Markers:    |
|                     | > Weathering Liner (9), Gundam Marker (5)      |
+---------------------+------------------------------------------------+
| > **AK INTERACTIVE  | > 3rd Generation: Standard (171 --- Clear      |
| > (768)**           | > Red/Blue/Green/Smoke/Yellow/Orange moved to  |
|                     | > Standard Clear), Standard Clear (6:          |
|                     | > AK11213--AK11218), AFV (80), Air (120),      |
|                     | > Figures (40), Inks (12), Metallics (21),     |
|                     | > Intense (11), Pastel (6) --- Primers,        |
|                     | > Varnish & Aux: Primer 3rd Gen (10), Varnish  |
|                     | > (3: Gloss/Matt/Satin --- hex stripped,       |
|                     | > transparent product), Mediums & Auxiliaries  |
|                     | > (6) --- Legacy Ranges: AFV (148), Figures    |
|                     | > (90), General (29), Naval (19). Auxiliaries  |
|                     | > and Varnish correctly under Primers line     |
|                     | > (not 3rd Gen).                               |
+---------------------+------------------------------------------------+
| > **CUSTOM (500)**  | > 5 sections × 100 placeholder slots.          |
|                     | > CUSTOM_001: CA Glue - Aron Alfa Pro (20g).   |
|                     | > CUSTOM_002: Diluyente para Acrílicos -       |
|                     | > Pintart (125ml). CUSTOM_003--500: empty,     |
|                     | > user-definable. Custom Brand feature (Phase  |
|                     | > 2) will add inline editing.                  |
+---------------------+------------------------------------------------+

⚠ FROZEN HISTORICAL SNAPSHOT (July 6, 2026) --- counts in this annex
are pre-inventory-close and preserved as a point-in-time record.
CURRENT authoritative total: 6,259 entries / 13 brands (see Status
Log). Do not patch this annex; the Status Log is the living record.

GRAND TOTAL (July 6 snapshot): 6,250 entries across 14 brands (includes 500 Custom
placeholder slots). ✅ Tamiya complete across all 7 product lines.
Official Tamiya chip hex data for acrylics and enamels.

SKIPPED --- Not Added & Why

+---------------------+------------------------------------------------+
| > **Vallejo Arte    | > Craft paint line --- not miniature painting. |
| > Deco (136)**      | > Marketed for ceramics, fabric, general       |
|                     | > craft. No meaningful crossover audience for  |
|                     | > PaintForge.                                  |
+---------------------+------------------------------------------------+
| > **Vallejo Arte    | > Same reasoning as Arte Deco above. Craft     |
| > Deco Fluorescents | > product, not hobby paint.                    |
| > (7)**             |                                                |
+---------------------+------------------------------------------------+
| > **Vallejo         | > Niche bust painting brand under the Vallejo  |
| > Nocturna Models   | > umbrella. Very small crossover audience.     |
| > (32)**            | > Revisit if bust painters become a tracked    |
|                     | > segment.                                     |
+---------------------+------------------------------------------------+
| > **Vallejo Panzer  | > Military figure painting --- highly niche.   |
| > Aces (48)**       | > Overlaps with scale modeling lateral         |
|                     | > audience but too specialized for initial     |
|                     | > database.                                    |
+---------------------+------------------------------------------------+
| > **Vallejo Hobby   | > Generic hobby craft line. Not specific to    |
| > Paint (31)**      | > miniature painting workflow. Differs from    |
|                     | > the Game Color / Model Color lines in        |
|                     | > intended application.                        |
+---------------------+------------------------------------------------+
| > **Mr Hobby        | > Adult figure paint range. Not appropriate    |
| > Lascivus (5)**    | > for the platform audience or brand identity. |
+---------------------+------------------------------------------------+
| > **Mr Hobby        | > Single unidentified entry in community       |
| > \'241\' (1)**     | > database with no context. Skipped pending    |
|                     | > identification.                              |
+---------------------+------------------------------------------------+
| > **Citadel         | > One discontinued entry. Redundant alongside  |
| > Foundation Primer | > the 90-entry Foundation discontinued section |
| > (1)**             | > already present.                             |
+---------------------+------------------------------------------------+
| > **MIG Ammo        | > Not yet added. Community database files      |
| > (252)**           | > available. Acrylics (228), Primers (12),     |
|                     | > Washes (12). Parked for future session.      |
+---------------------+------------------------------------------------+
| > **Warcolours      | > Not yet added. Community database files      |
| > (178)**           | > available. Parked.                           |
+---------------------+------------------------------------------------+
| > **Kimera Kolors   | > Not yet added. Community database files      |
| > (39)**            | > available. Parked.                           |
+---------------------+------------------------------------------------+
| > **Turbo Dork      | > Not yet added. Community database files      |
| > (40)**            | > available. Colorshift specialty paints.      |
|                     | > Parked.                                      |
+---------------------+------------------------------------------------+

> **✦** *The skip list above is a living document. \'Parked\' means the
> data exists and adding it is a \~30-minute task. \'Manual entry
> required\' means the community database has no data and the catalog
> must be sourced and entered by hand. \'Not appropriate\' means a
> deliberate editorial decision, not a data gap.*

17\. Competitor Landscape --- July 6 Research Update

> **✦** *This section supersedes the earlier competitive analysis in
> Section 7 where they conflict. Reflects July 4--6, 2026 direct
> research.*

Key Corrections from Initial Analysis

PaintVault is further ahead than initially assessed. Their own pricing
page states 14,000+ paint references. The barcode scanner is FREE tier
--- not paid. Recipes and projects are already shipped: reference image
upload, color picking on photos, paints attached to build recipes. Most
critically: they are already running the affiliate playbook --- SEO
landing pages for every brand plus cross-brand Delta E conversion charts
with affiliate links embedded. They are monetizing organic search
traffic today.

The recipe-inventory cross-reference is NOT a moat. PaintVault already
has both inventory and recipes. Connecting them is a small feature
release for them. Our defensibility must come from the YouTube parsing
layer, availability-aware substitution, and workflow depth --- not from
this single feature.

New entrant: WarpaintVault (warpaintvault.com). Recipe-sharing community
with step-by-step recipes, zones, exact colors, audience-building, and
stated plans for premium creator content. Currently \~35 painters. Not a
threat at current scale, but proof the creator-recipe gap is visible to
others. Monitor quarterly.

Competitor Matrix --- Current State

+---------------------+------------------------------------------------+
| > **paintRack ★**   | > Mobile (iOS+Android). Market leader. 27,000+ |
|                     | > paints, 65+ brands, bulk barcode scan.       |
|                     | > Freemium (color tools + rapid scan paid).    |
|                     | > Strengths: largest database, trust,          |
|                     | > longevity. Weaknesses: no web, no Delta E,   |
|                     | > no recipe ecosystem.                         |
+---------------------+------------------------------------------------+
| > **BrushRage ★**   | > Mobile (iOS+Android). Fully free. 27,000+    |
|                     | > paints. Mixbox physics-based mixing, photo   |
|                     | > color ID, barcode, project timers,           |
|                     | > integrated ecommerce. Strengths: most        |
|                     | > technically impressive free app. Weaknesses: |
|                     | > complex UX, mobile-only, no creator layer.   |
+---------------------+------------------------------------------------+
| > **BrushForge ★**  | > Mobile (iOS+Android). 4,300+ paints. Delta E |
|                     | > 2000, AI recipe generator, lighting tool.    |
|                     | > Freemium, 40-paint free cap, ads. Solo       |
|                     | > developer. Strengths: fastest feature        |
|                     | > velocity, AI positioning. Weaknesses: harsh  |
|                     | > free tier, no web, small database. Name      |
|                     | > collision with PaintForge --- monitor, do    |
|                     | > not provoke.                                 |
+---------------------+------------------------------------------------+
| > **PaintVault ⚠**  | > Web + Android. \~14,000+ paints. Delta E     |
|                     | > 2000, recipes, projects, photo picking,      |
|                     | > barcode (FREE), gradient/harmony, PDF        |
|                     | > export. Pro €3/mo or €27/yr. Already         |
|                     | > executing affiliate + SEO playbook. Closest  |
|                     | > analog to us --- further along than          |
|                     | > initially assessed.                          |
+---------------------+------------------------------------------------+
| > **PaintStash ⚠**  | > Web PWA. Warhammer-focused. Tracking, photo  |
|                     | > color matching, mixing, community guides.    |
|                     | > Monetization unclear. Low polish, small      |
|                     | > team, narrow GW focus.                       |
+---------------------+------------------------------------------------+
| > **WarpaintVault** | > NEW. Web. Recipe-sharing community with      |
|                     | > zones/exact colors, audience-building,       |
|                     | > planned premium creator content. \~35        |
|                     | > painters. No inventory layer. Monitor        |
|                     | > quarterly.                                   |
+---------------------+------------------------------------------------+
| > **Miniature       | > Mobile. \~2,500 paints. Color matching tool, |
| > Painter Pro**     | > not inventory. Our hex database derives from |
|                     | > their open-source community data ---         |
|                     | > maintain attribution and goodwill, treat as  |
|                     | > ally not rival.                              |
+---------------------+------------------------------------------------+

July 9--10 Additions (verified via store listings, app legal pages, and
direct site inspection)

+---------------------+------------------------------------------------+
| > **BrushRage ---   | > FREE passion project, no monetization of any |
| > dossier           | > kind (developer: Sebastian Kohl,             |
| > correction**      | > \"Hendarion,\" Leipzig DE --- exclude from   |
|                     | > creator outreach). iOS + Android + Wear OS   |
|                     | > (earlier \"Android only\" note corrected).   |
|                     | > 15,000+ paints / \~60 brands, bulk barcode   |
|                     | > scan, project timers, Mixbox physical        |
|                     | > mixing, photo→paint reference. Architecture: |
|                     | > local-first; sole backup path is manual      |
|                     | > export to server/Drive (24h password link)   |
|                     | > --- structurally no cloud sync, no           |
|                     | > multi-device state. Legacy 2014-era native   |
|                     | > stack (Realm/AndroidAnnotations/Glide) caps  |
|                     | > modernization speed. Beloved community       |
|                     | > standing --- never punch at it publicly.     |
|                     | > Competes on tracking breadth; structurally   |
|                     | > uninterested in commerce / availability /    |
|                     | > data-intelligence territory.                 |
+---------------------+------------------------------------------------+
| > **Scalemates**    | > Kit-first scale-modeling database (claims    |
|                     | > 90k+ modelers): kit DB + paint pages with    |
|                     | > single hex + curated \"similar colors\"     |
|                     | > lists + stash manager + shop links.          |
|                     | > Incumbent for the Stage 4B scale-model       |
|                     | > segment. Equivalence is name-level and       |
|                     | > curated: no distance metric, no ranking, no  |
|                     | > role/chemistry awareness (lists a Shade as   |
|                     | > \"similar\" to an opaque base). Their shop  |
|                     | > links validate niche shop-link monetization  |
|                     | > (F6 evidence). Their data is theirs --- use  |
|                     | > only as occasional sanity reference, never   |
|                     | > as a source.                                 |
+---------------------+------------------------------------------------+
| > **Hobby Color     | > Android app by Spanish dev 27Pulgadas,       |
| > Converter**       | > reported 100k+ installs \[UNVERIFIED\].     |
|                     | > Legacy cross-brand equivalence               |
|                     | > (Tamiya/Vallejo/Citadel/AK/RAL) + basic      |
|                     | > inventory. First Spanish-native overlap with |
|                     | > the substitution wedge --- gates Stage 4A    |
|                     | > entry analysis.                              |
+---------------------+------------------------------------------------+
| > **KitColorsPro**  | > (AppsForge) claims 20k+ paints, 40+ brands,  |
|                     | > full Spanish localization, AI-visualizer     |
|                     | > features \[UNVERIFIED\]. Map before Stage   |
|                     | > 4A greenlight.                               |
+---------------------+------------------------------------------------+

Market Size Reality Check

No player in this category has meaningful scale. Verified download data
(PaintVault: hundreds of installs; even the market leader\'s numbers are
modest for a multi-year app) implies the entire tooling category serves
tens of thousands of users at most, with paying users in the low
thousands across ALL apps combined.

The real incumbent is YouTube + Reddit, where the overwhelming majority
of painters get recipes for free in unstructured form. We win by
attaching to that incumbent (parsing its content into structured,
personalized, purchasable form) --- not by fighting six small apps for a
small pond.

Honest ceiling: if the realistic paying pool is 2,000--3,000 users at
€3--4/month plus affiliate volume, this is a solid profitable niche
business (€5--10k/month at maturity), not a venture-scale outcome. The
Hobby Atelier multi-skin vision remains parked until PaintForge
disproves this ceiling.

18\. Revenue Model v2 --- Affiliate-First

> **✦** *SUPERSEDES the Revenue Streams table in Section 2 and the
> milestone assumptions in Section 8. The commons/marketplace flywheel
> is demoted from business model to Phase 3 experiment. The core loop is
> now: help people paint with what they already own; when they must buy,
> hand them the link.*

The Core Loop

Recipe in (YouTube link, reference image, or manual entry) → matched
against user inventory → Delta E substitutions ranked by the user\'s
preferred and locally-available brands → shopping list for what\'s
genuinely missing → region-aware affiliate link at the exact moment of
purchase intent. Every feature feeds the next step; monetization is a
by-product of being useful, not a gate.

Revenue Streams --- Revised

+---------------------+------------------------------------------------+
| > **1 · Affiliate   | > Shopping lists, substitution recommendations |
| > Commerce          | > and parsed recipes resolve to retailer       |
| > (PRIMARY)**       | > affiliate links, routed by user region and   |
|                     | > retailer preference (Amazon JP/DE/UK,        |
|                     | > Element Games, Wayland Games, Firestorm-type |
|                     | > retailers via Awin/Webgains). 3--5%          |
|                     | > commission on €30--60 average orders = €1--3 |
|                     | > per converted list. Volume game --- but the  |
|                     | > volume driver (YouTube parsing) is also the  |
|                     | > growth engine.                               |
+---------------------+------------------------------------------------+
| > **2 · Creator     | > Every parsed video is credited and embedded  |
| > Revenue Share**   | > --- creator is the hero. Later: share        |
|                     | > affiliate revenue generated from lists       |
|                     | > derived from a creator\'s videos. Creators   |
|                     | > link \'get the paint list on PaintForge\' in |
|                     | > their descriptions and become our            |
|                     | > distribution channel. No marketplace         |
|                     | > cold-start --- creators earn from videos     |
|                     | > they were already making.                    |
+---------------------+------------------------------------------------+
| > **3 · Premium     | > €3--4/month or €29--39/year --- anchored at  |
| > Subscription      | > or just above PaintVault Pro (€3/mo). Free   |
| > (SECONDARY)**     | > tier: limited monthly YouTube parse quota, 3 |
|                     | > project slots. Premium tier: higher parse    |
|                     | > quota (cap TBD pending cost modelling), 10   |
|                     | > project slots, reference-image swatching,    |
|                     | > photo inventory capture, advanced            |
|                     | > substitution filters. Top-up purchases       |
|                     | > available when quota runs out. Additional    |
|                     | > project slots beyond 10 purchasable as       |
|                     | > yearly micro-transaction. \'Unlimited\' is   |
|                     | > never offered for any AI feature. Inventory  |
|                     | > itself is unlimited and free forever ---     |
|                     | > that is the acquisition differentiator.      |
|                     | > Lifetime option (€79) lives under same       |
|                     | > monthly AI token quota as yearly tier.       |
+---------------------+------------------------------------------------+
| > **4 ·             | > Aggregated, anonymized demand intelligence:  |
| > Manufacturer &    | > what painters own, backup-stock demand by    |
| > Retailer Data     | > SKU, which discontinued paints are still     |
| > (LONG-TERM)**     | > tracked, substitution flows, regional        |
|                     | > availability gaps. Sellable to manufacturers |
|                     | > and retailers at scale (thousands of MAU     |
|                     | > minimum). Requires privacy-first design and  |
|                     | > explicit opt-in from day one.                |
+---------------------+------------------------------------------------+
| > **5 · Japan /     | > hobbyatelier.store pipeline,                 |
| > Physical**        | > English-language Japan hobby directory,      |
|                     | > concierge sourcing. Medium-term as per       |
|                     | > Section 9 (Japan Angle). Zero-cost           |
|                     | > newsletter validation can begin any time.    |
+---------------------+------------------------------------------------+
| > **KILLED · Banner | > Removed entirely. Revenue at our scale is    |
| > Ads**             | > pocket change; reputational cost in a        |
|                     | > community where \'no ads, no tracking\' is a |
|                     | > competitor selling point is real. Free tier  |
|                     | > monetized by affiliate links (disclosed),    |
|                     | > not banners.                                 |
+---------------------+------------------------------------------------+
| > **DEMOTED ·       | > Phase 3 experiment, not the business model.  |
| > Marketplace       | > If creator revenue share (stream 2) produces |
| > Commission**      | > creators who want to sell structured premium |
|                     | > guides natively, the marketplace builds      |
|                     | > itself on proven demand. Zero engineering    |
|                     | > investment until then.                       |
+---------------------+------------------------------------------------+

Why Affiliate-First Wins Here

It monetizes free users from day one without paywalls, privacy trades,
or a two-sided marketplace cold start. Match quality and conversion rate
become the same optimization once substitution is filtered by
locally-available brands. PaintVault has validated the mechanic --- they
already earn affiliate revenue from static SEO charts. Ours triggers at
a moment of far higher intent: a personalized shopping list for a
project the user is about to start.

> **✦** *ACTION WITH LAG: affiliate program approvals take days to
> weeks. Amazon Associates requires separate JP/DE/UK accounts and
> qualifying sales within 180 days. Applications are a Day-0 task ---
> the long pole of the 30-day roadmap is paperwork, not code.*

19\. Recipe Intelligence Layer

Four features that convert PaintForge from an inventory tracker into the
tool that makes any recipe paintable with what you own.

19.1 YouTube Tutorial Parsing --- Flagship Launch Feature

User pastes any painting tutorial URL. Pipeline: (1) fetch video
metadata and description via YouTube Data API --- many creators list
paints in the description, parsed first for free accuracy; (2) fetch
transcript server-side; (3) extract paint mentions by matching against
our database as a closed vocabulary --- auto-captions mangle names but
fuzzy-matching against \~15,000 known SKUs resolves most noise; (4) LLM
structuring pass assembles steps, zones and paints into a recipe object
with confidence scores; (5) user confirms/corrects; (6) recipe
cross-referenced against inventory: owned, substitutable (Delta E within
preferred/available brands), missing → shopping list → affiliate links.

Parse once, serve many: parsed videos cached globally by video ID ---
second user who pastes the same tutorial pays zero API cost. Over time
this builds a structured index of the hobby\'s entire video knowledge
base.

Creator-first: video always embedded and credited. The parse drives
views TO the creator; eventual revenue-share (§18 stream 2) makes them
active promoters.

> **✦** *Timeline reality: the pipeline has multiple external
> dependencies (YouTube API, transcript acquisition, LLM structuring,
> global cache). Affiliate API approvals are the long pole. Realistic
> timeline: Month 2--3, not Week 3 as originally scoped.*

19.2 Reference Image Swatching (Premium)

Upload any reference image --- an art book page, game screenshot, photo
of a model --- and PaintForge extracts the dominant palette (client-side
color quantization, zero API cost, instant) and matches each swatch
against (a) owned inventory, (b) preferred brands ranked in order, (c)
full database. Output: \'here is that Thunderjaw page as a paint list,
first with what you own, then closest matches at ΔE ranking.\' Every
match annotated with Delta E distance and a plain-language grade
(imperceptible / close / usable with adjustment).

19.3 Photo Inventory Capture (Premium, Post-Sprint)

Snap a photo of a paint rack; a vision model reads visible labels,
proposes matches from the database, user confirms in a checklist grid
before anything is written to inventory. Collapses the biggest switching
cost in the category (re-entering hundreds of paints) into minutes.

> **✦** *Honest difficulty: front-facing racks work well; dense drawers
> and Jucoci-style enclosed storage will not. Per-image vision calls
> cost real money → rate-limited on free, generous on premium. NOT in
> the 30-day sprint. Post-90-days territory.*

19.4 Availability Profile --- The Onboarding Quiz

At onboarding (and editable any time): which brands can you actually buy
locally or affordably? Which retailers do you use? Rank your brand
preferences. This profile weights every recommendation: substitutions
ranked by Delta E within the user\'s accessible brands first; shopping
lists route to their actual retailers. A painter in rural Japan gets
Vallejo-first answers; a UK painter gets Citadel/Army Painter-first
answers --- from the same recipe.

Nobody does region- and retailer-aware substitution. It is also the
feature that fuses UX quality with affiliate conversion: recommendations
the user can actually act on are both better advice and better business.
The availability profile seeds the Section 18 data-intelligence stream:
aggregated availability gaps by region are exactly what manufacturers
cannot currently see.

19.5 Shopping List Exports --- Three Formats

+---------------------+------------------------------------------------+
| > **TXT (shipped)** | > Existing plain-text export, auto-copied to   |
|                     | > clipboard. For the spreadsheet crowd and     |
|                     | > quick paste-into-chat orders. Unchanged.     |
+---------------------+------------------------------------------------+
| > **Branded Print   | > Printable, PaintForge-branded sheet          |
| > PDF**             | > personalized with user\'s name, grouped by   |
|                     | > brand/section, with tick-boxes for in-store  |
|                     | > purchases and quantities from the            |
|                     | > backup-target system. A QR code on the sheet |
|                     | > links back to the live list --- the curious  |
|                     | > painter in the aisle scans it and lands on   |
|                     | > the product with a real example already in   |
|                     | > hand. Physical brand ambassador in the one   |
|                     | > venue where the entire target audience       |
|                     | > congregates offline.                         |
+---------------------+------------------------------------------------+
| > **Mobile Live     | > Shareable live web page: big tap targets,    |
| > List**            | > ticks persist as you move through the shop,  |
|                     | > works from a share link without login. Can   |
|                     | > surface affiliate links for whatever the     |
|                     | > shop does NOT stock --- brick-and-mortar and |
|                     | > affiliate revenue stop competing and start   |
|                     | > compounding.                                 |
+---------------------+------------------------------------------------+

19.6 Auxiliaries & Consumables as First-Class Citizens

A verified gap across every competitor: all of them track COLORS and
ignore the rest of the purchase basket --- varnishes, thinners, flow
improver, retardants, airbrush cleaners, mediums, masking fluid,
primers, texture pastes, pigments, weathering lines. Nobody runs out of
a rare purple mid-project; everybody runs out of varnish and thinner at
the worst moment.

Our backup-bottle and restock-target system is built for consumables ---
it matters MORE for them than for colors. This slots directly into the
\'serious collection manager\' positioning. Implementation: a category
flag on the existing data model at Supabase migration time. The curated
database already contains auxiliaries; the pattern gets promoted to
filterable first-class status.

20\. Project / Recipe Builder & Painting Mode

The recipe builder is Phase 2, but its freemium mechanic is designed now
so the data model is ready. The Painting Mode / Project / Vault system
is the premium gate for the recipe layer.

Project Slots --- The Freemium Gate

Free users get 3 active project slots. This is genuinely useful --- most
painters work on 1--3 things at once --- but reflects real human
behavior honestly: we all open more projects than we finish.

+---------------------+------------------------------------------------+
| > **Free tier**     | > 3 active project slots. Projects occupy a    |
|                     | > slot until Vaulted or deleted. A 24-hour     |
|                     | > unvault cooldown applies per slot ---        |
|                     | > prevents gaming the paywall by cycling slots |
|                     | > in and out.                                  |
+---------------------+------------------------------------------------+
| > **Premium tier**  | > 10 active project slots. No unvault          |
|                     | > cooldown. Additional slots beyond 10         |
|                     | > purchasable as a yearly micro-transaction    |
|                     | > for power users who need more. \'Unlimited\' |
|                     | > is never offered.                            |
+---------------------+------------------------------------------------+
| > **Upgrade         | > \'You have 3 active projects. Want to start  |
| > triggers**        | > a 4th? Go Premium.\' / \'You have 10 active  |
|                     | > projects. Need more? Add a slot pack.\' /    |
|                     | > \'Want to unvault without the 24h wait? Go   |
|                     | > Premium.\' Natural, not punishing, no        |
|                     | > ceiling ever framed as arbitrary.            |
+---------------------+------------------------------------------------+

The Vault Mechanic

When a project is complete, the user clicks \'Vault\'. This transforms
the project into a public recipe --- permanently visible, indexed,
credited to the creator, and a traffic driver for PaintForge. The
project slot is freed. The recipe is never lost; it just becomes
community content.

Vault is not a punishment --- it is a graduation. The painter finishes
something, shares it with the community, and moves on. For PaintForge,
every Vaulted project is free SEO content with no editorial cost.

The 24h Unvault Timer

To prevent free users from gaming the slot system (vault and immediately
unvault to avoid the paywall), unvaulting a recipe back to an active
project has a 24-hour cooldown per slot. The friction is real but not
punishing --- a project you genuinely want back can wait 24 hours. This
cooldown exists solely to prevent slot cycling as a paywall workaround.

> **✦** *Design principle: the unvault timer must be communicated
> transparently. Users who understand the mechanic find it fair. Users
> who are surprised by it find it hostile. Surface the timer clearly at
> the moment of unvaulting, not after clicking.*

Painting Mode --- TBD Scope

\'Painting Mode\' refers to the app experience when a recipe/project is
actively open during a painting session. Minimum viable: recipe open,
current step visible, next step accessible. Potential additions: layer
cure timers, step completion tracking, notes per step. Full Painting
Mode as a dedicated UI state (timer running, minimal chrome, recipe
front-and-center) is Phase 2 scope --- TBD based on user feedback after
recipe builder ships.

21\. 30-Day Sprint Roadmap

> **✦** *GATED: execution is conditional on Stage 0 validation
> (concierge tests, zero code) per Steve Blank methodology. Build order
> below is correct; permission to build is earned per stage. Timeline
> assumes founder-pace overnight sprints. The genuine schedule risks are
> EXTERNAL --- affiliate approvals, API quotas --- not code.*

Day 0 --- Before Writing Any Feature Code

Apply to affiliate programs: Amazon Associates (JP + DE + UK
separately), Awin/Webgains for hobby retailers. Approval lag is the
roadmap\'s long pole --- start immediately.

Create API credentials: YouTube Data API v3 key (free quota), Anthropic
API key for parsing, store as Netlify/Supabase environment secrets ---
never client-side.

Draft Terms of Service: platform license clause for free user recipes,
affiliate disclosure, aggregated-data opt-in language. One legal pass
covers all of it. Before public launch, not after.

Week 1 --- Foundation: Database & Color Science

⚠ NOTE FROM KIRA: Week 1 scope as originally drafted is too wide.
Supabase migration of paints.js AND full brand coverage AND Delta E
shipping are three separate weeks. The migration alone rewrites search,
filter, and hierarchy rendering logic. Treat these as sequential, not
parallel.

Migrate paints.js (\~500KB client bundle) to a Supabase paints table.
This is a prerequisite for everything below. Rewrites: search, filter,
hierarchy rendering, TAXONOMY navigation. Add chemistry field
(lacquer/acrylic/enamel) and category (color/auxiliary/consumable) at
migration time --- retrofit is painful.

Precompute LAB values for every paint with hex data; store as columns.

Ship Delta E 2000 engine + \'closest matches\' UI on every paint row
(filters: owned only / preferred brands / all).

Week 2 --- Substitution, Availability, Money

Availability onboarding quiz + user_availability schema; ranked brand
preferences.

Substitution ranking: Delta E weighted by owned → preferred → available
→ all.

Affiliate layer v1: retailer link resolver, region routing, search-URL
fallback with affiliate tags, click tracking, legally required
disclosure UI.

Wire shopping list export to live links.

Week 3 --- YouTube Parsing Pipeline

Serverless function (Netlify Functions or Supabase Edge): metadata +
description fetch → transcript acquisition → closed-vocabulary fuzzy
matching → LLM structuring → confidence-scored recipe object.
Confirm/correct UI; global cache table keyed by video ID; recipe →
inventory cross-reference → shopping list → affiliate links.

> **✦** *This is the launch feature. Timeline realistic only if
> affiliate approvals landed in Week 0-1. Do not build the pipeline
> before the affiliate layer exists --- the revenue loop depends on
> both.*

Week 4 --- Swatching, Seeding, Soft Launch

Reference image swatching (client-side quantization + LAB matching) ---
cheap to build once ΔE engine exists. Shopping list PDF with QR code +
shareable mobile live list. Seed 10--15 founder recipes (DMD and Horizon
documentation ready to format). Soft launch to 2--3 paint-brand Discords
--- \'paste any tutorial link\' as the demo hook.

Post-30 Backlog (Deliberately Excluded from Sprint)

Painting Mode with timers (§20), the Vault (§20), Spanish localization,
barcode scanner via mobile-browser camera API, creator revenue-share
portal, Japanese localization with Japan push, Mixbox-style physical
colour mixing (Kubelka--Munk physics --- predicts what pigments produce
when physically combined on a palette; distinct from ΔE which measures
perceptual distance between dried colours; Stage 5 bet, correctly
gated), data-intelligence groundwork, marketplace experiment (Phase 3,
evidence-gated). Photo inventory capture: removed from sprint --- too
complex and storage model too hostile to dense collections.
Post-90-days.

22\. Reality Checks & Warnings

Revised Financial Targets --- Affiliate-First Model

+---------------------+------------------------------------------------+
| > **Month 3**       | > Feature-complete per Week-4 roadmap. 200+    |
|                     | > registered users. First affiliate euros.     |
|                     | > Target: €50--150/month. Yes, that small ---  |
|                     | > and real.                                    |
+---------------------+------------------------------------------------+
| > **Month 6**       | > 1,000+ users if YouTube parsing lands as a   |
|                     | > growth loop. Target: €300--800/month         |
|                     | > (affiliate + first subscriptions).           |
+---------------------+------------------------------------------------+
| > **Month 12**      | > €1,500--3,000/month if the                   |
|                     | > parse-share-signup loop compounds. This is   |
|                     | > the success case, not the conservative case. |
+---------------------+------------------------------------------------+
| > **Ceiling check** | > At category-realistic scale (2--3k           |
|                     | > paying-equivalent users), €5--10k/month is   |
|                     | > the mature outcome. A healthy profitable     |
|                     | > niche --- plan costs, time and expectations  |
|                     | > accordingly. The Hobby Atelier empire is a   |
|                     | > good-problem-for-a-distant-year.             |
+---------------------+------------------------------------------------+

Operational & Legal Warnings

Affiliate compliance: EU consumer law and FTC-style rules require clear
disclosure wherever affiliate links appear. Build the disclosure
component once, render it everywhere. Amazon Associates: separate
JP/DE/UK accounts, sales required within 180 days or the account closes.

YouTube ToS: use the official Data API for metadata/descriptions;
acquire transcripts server-side conservatively; always embed the
official player; never rehost or paywall the video content itself. The
parse output is our derived data; the video is theirs.

LLM/vision cost control: global parse cache is the primary defense;
rate-limit free-tier parses; vision (photo capture) is premium-gated
from day one. Pennies per call multiply.

BrushForge name collision: monitor, do not provoke, and run a proper
trademark search before spending real money on the PaintForge brand.

Miniature Painter Pro attribution: their open data is now load-bearing
for our database. In-app credit ships in Week 1, and a friendly note to
Rick Fleuren costs nothing. Goodwill with the upstream is strategy, not
manners.

Solo-founder scope discipline: a CFO day job plus overnight sprints is
the actual constraint. The 30-day roadmap IS the product. Everything
else in this document is a note, not a task. The Hobby Atelier empire,
Japan skins, marketplace --- parked until the loop proves itself.

Growth Ideas Worth Holding (Cheap, Compounding)

SEO conversion charts: copy PaintVault\'s play with our own ΔE engine
--- static brand-to-brand equivalence pages compound organic traffic.
One generation script. Note: requires SSR or pre-generated pages (our
Vite static build does not support SSR by default --- plan for this at
migration time).

\'Painted with what I own\' share cards: when a user completes a
substituted recipe, generate a shareable before/after card crediting the
source video. Free marketing loop through the exact communities we want.

Creator outreach wedge: first partners should be Instagram scheme-card
painters and mid-size (10--50k) YouTube tutorial channels with
structured paint lists in descriptions. They parse cleanly, they have no
monetization channel, and revenue share is found money for them.

Japan-angle synergy: the availability profile makes PaintForge
disproportionately valuable to hobbyists in badly-served regions (Japan
expats, LATAM). The English-language Japan hobby newsletter remains the
zero-cost validation channel.

23\. Lateral Audience Strategy

Direct consequence of the market-size reality check in §22: miniature
painters alone are a pond measured in tens of thousands of tool-users.
The volume lives lateral: scale modelers, Gunpla, diorama and terrain
builders --- audiences where Tamiya and Mr Hobby/Mr Color are central,
not peripheral.

Expansion Is Database + Marketing, Not a Rebuild

Delta E does not care whether the target is a Space Marine or a Zaku.
YouTube parsing, availability profiles, substitution ranking, the
affiliate layer --- every core system is hobby-agnostic. The lateral
move costs brand imports and community outreach, not engineering.

Database is already cross-hobby from Day One: Tamiya (complete), Mr
Hobby/Mr Color (full range), AK Interactive (full), Indart pigments. The
chemistry field added at migration time is the scale and Gunpla
community\'s primary concern --- lacquer vs acrylic vs enamel, what
thins with what, what eats what underneath.

Beachhead Sequencing

Launch and seed with miniature painters first. They are the densest
YouTube-tutorial community; the parse feature demos best there; the
founder can seed authentic content from his own projects. Cross-hobby
data readiness does not equal cross-hobby marketing on day one.

Lateral outreach begins once the loop is proven: Gunpla/scale Discords
and subreddits, with Mr Color-heavy tutorial parses as the demo. The
availability quiz doubles as a hobby-profile question --- a Gunpla
builder answers it and sees Mr Color and Tamiya surfaced first; a
Warhammer painter sees Citadel and Vallejo. Same engine, personalized
shelf.

Naming Decision: Keep PaintForge

\'Paint\' is the one verb every lateral community shares. Gunpla
builders paint. RC bodies get painted. Diorama and terrain work is
painting. The name travels. The Hobby Atelier multi-skin plan is further
demoted: separate skins would fragment an already small early audience
into several microscopic ones and multiply marketing surface for zero
product gain. One name, one database, one community. Hobby Atelier
remains the legal/infrastructure umbrella and future physical-goods
brand (hobbyatelier.store) --- nothing more for now.

> **✦** *Positioning for the lateral era: the inventory, substitution
> and recipe engine for EVERYONE who paints small things --- whatever
> the small thing is.*

24\. The Chemistry Knowledge Layer --- Curation as Moat

Chemistry does not live at the paint level --- it lives at the
product-line level. Vallejo Game Color is \~220 paints and ONE
chemistry. Tamiya X/XF is one chemistry with a finish suffix. The entire
database collapses into roughly 100-150 product-line records, and
compatibility rules on top number \~30-40 family-level entries.
Deterministic lookup, not AI guessing --- exactly what advice that can
ruin someone\'s miniature must be.

The Product-Line Table

One record per line; every paint in the database points at one. Fields:
real chemistry family (waterborne acrylic, alcohol-acrylic hybrid ---
the Tamiya trap --- true lacquer, enamel, oil; never just \'acrylic\' as
a lie of omission), what actually thins it vs. what the brand sells,
cleanup solvent, dry-to-touch and full-cure times, ventilation/toxicity
flag, mixing-family key, plain-language notes. Manufacturer SDS/TDS
sheets publicly list the solvents --- nobody has structured them for
hobbyists. First-mover on boring paperwork is still first-mover.

> **✦** *Founder seeds the top \~30 lines from documented experience;
> the rest ship \'unverified\' with community correction flagging.
> paintRack has 27,000 paints and zero understanding of any of them ---
> PaintForge would have the only database that knows what the paint IS.*

The Severity Ladder --- One Color Language

Four tiers, used identically everywhere in the app. The same color
language governs the matching engine, the recipe linter, cure timers,
and Know More panels --- one vocabulary, or trust dies quietly.

+---------------------+------------------------------------------------+
| > **🟢 GREEN**      | > Same product line or shared mixing family.   |
|                     | > Mix freely. Same finish, same chemistry,     |
|                     | > same generation.                             |
+---------------------+------------------------------------------------+
| > **🟡 YELLOW**     | > Cross-family, same base chemistry (Vallejo × |
|                     | > Army Painter, both waterborne). Usually      |
|                     | > fine, test a small amount first. Note: split |
|                     | > generations (Speedpaint 1.0 vs 2.0,          |
|                     | > Warpaints vs Fanatic) are distinct product   |
|                     | > lines --- same-name cross-generation mixing  |
|                     | > is YELLOW minimum.                           |
+---------------------+------------------------------------------------+
| > **🟠 ORANGE**     | > Any hybrid chemistry involved (Tamiya        |
|                     | > alcohol-acrylic, Acrysion), or different     |
|                     | > finish families (flat over gloss base before |
|                     | > intended). Unpredictable without testing.    |
|                     | > Check before committing.                     |
+---------------------+------------------------------------------------+
| > **🔴 RED**        | > Cross-chemistry that reliably causes damage: |
|                     | > lacquer over acrylic, enamel thinner on bare |
|                     | > plastic, oil wash over unvarnished acrylic,  |
|                     | > solvent varnish over waterborne. RED is      |
|                     | > reserved app-wide --- it only ever means     |
|                     | > chemistry says no. Any UI needing a neutral  |
|                     | > third tier uses amber/grey, not red.         |
+---------------------+------------------------------------------------+

Mixing vs. substitution distinction: physical intermixing on a palette
gets the full severity ladder. Substituting in a recipe step (nothing
touches on the palette) runs one tier softer --- the risks there are
layering order, workflow friction, and finish mismatch, not chemistry
contamination. Cross-sheen substitutions carry a finish note, not a
chemistry flag. Over-flagging safe swaps scares users away from exactly
the substitutions the affiliate model lives on.

The Recipe Linter

Family-level rules walk every recipe\'s steps, join each paint to its
product-line record, check every layer transition, and emit warnings ---
deterministic, free to run, fires on every parsed video too. Missing
primer step, no seal after weathering, oil phase with no barrier,
contrast paint applied over wet layer --- the checks a veteran does by
reflex and a beginner learns by ruining a model.

The payoff sentence combines helpfulness and revenue at zero marginal
cost: \'This wash is oil-based --- you have no mineral spirits and no
gloss varnish. You don\'t own either. Add both to My Set for the next
shopping run?\' Cure-aware timers in Painting Mode use the same
product-line table: dry-to-touch and full-cure times stored per line,
the nasty reactivation case for one-coat paints (dry but not cured, next
wet layer reactivates them) included.

Know More Panels

Every brand and product line gets a Know More card. Brand card: who they
are, specialty, trajectory, store referral link with affiliate
disclosure. Line card: manufacturer pitch paraphrased (their copy is
their copyright), actual chemistry from the product-line table, what
genuinely thins it, cleanup, cure behavior, ventilation flag. \'What
does this dilute with?\' --- three tiers: GREEN if you own it or it\'s
water; PURPLE if it\'s in My Set but not owned (button to shopping
module); AMBER if it also works but isn\'t in your world yet (with its
own buy link). Public URLs for these cards are brand/line SEO pages with
chemistry depth no competitor can copy without doing the homework.

25\. Database Strategy --- Curated Depth, Ordering & Sourcing

The race to 20,000-27,000 SKUs is the wrong race. Complete coverage of
the brands people actually buy, with real knowledge attached, beats a
bigger number attached to nothing. Any brand PaintForge carries is
carried 100% --- every line, every SKU, discontinued sections included.
The real failure mode is incomplete majors, not missing minors. Nobody
churns over a missing boutique brand; they churn when half their Game
Air line isn\'t there.

Demand-Driven Expansion

At the bottom of the brand filter panel: \'Your favorite brand or line
missing?\' → a small form (brand, line, optional link). Additions happen
on demand thresholds; requesters get notified when their request lands
(\'Added Warcolours --- because 47 of you asked\' is marketing money
can\'t buy). The requests themselves are regional demand data feeding
§18 revenue stream 4.

Upstream contribution: lines absent from the community database (Tamiya
Enamel, PS Polycarbonate sprays, Paint Markers --- now complete as of
July 2026) were sampled by the founder and contributed back to the
upstream database. Goodwill with the source whose data is load-bearing,
and a way to announce PaintForge\'s existence to the community that
maintains it.

Hex Sourcing Method (Validated July 6, 2026)

Official digital product-chip images only (never photographed print ---
CMYK lies). Crop to center \~50% of the chip, average the pixels (never
single pixels --- JPEG noise), record sRGB hex, tag source as
swatch-derived. Clears, candies, and metallics: flat hex cannot
represent transparency or flake --- mark approximate; ΔE on them is
directional. Auxiliaries need no hex at all. Batch execution runs
through disposable AI sessions with a fixed prompt producing Name \|
Code \| Set \| hex lines ready for the community file format.

> **✦** *Future upgrade: physical measurement --- cured swatch + pocket
> colorimeter reading LAB directly. Pre-approved as a founder purchase
> the moment the Stage 1 hypothesis gate passes. Not before.*

Brand Ordering

The user\'s top-5 pinned brands (from the §19.4 availability profile
quiz) render first --- the same ranking feeds both the shelf display and
the ΔE coherence weighting. One table, two views, no drift. New users
pre-profile see popularity order seeded by their hobby type answer: a
Gunpla builder sees Mr Hobby/Tamiya first; a Warhammer painter sees
Citadel/Vallejo. Alphabetical toggle as escape hatch. The
popularity_rank column is seeded from community estimates and replaced
by PaintForge\'s own aggregated ownership data as users arrive --- the
brand list becomes §18 stream 4\'s proof of concept.

26\. Order Reconciliation --- Closing the Purchase Loop

Field-discovered pain point: storefronts with 50-item cart caps forcing
split orders, slow checkouts, and a single misclick silently dropping
one SKU from a curated 40-color set --- discovered only when the box
arrived. The gap between \'what I meant to order,\' \'what I actually
ordered,\' and \'what PaintForge thinks I need\' is where hobbyist money
and patience go to die.

> **▸** Paste order confirmation or cart text (any retailer, any
> language --- the closed-vocabulary matcher plus Japanese/Spanish
> aliases handles Volks-grade mixed-language receipts) → parsed line
> items reconciled against your shopping list: missing (meant to buy,
> didn\'t), extras, duplicates.
>
> **▸** Pre-checkout mode is the real save: paste the cart BEFORE paying
> → catch the misclick while it\'s still fixable, not when the box
> arrives missing one metallic.
>
> **▸** One-tap inventory update: confirmed items bulk-mark as owned /
> backup +1. The post-delivery data-entry session dies. Raw receipt text
> is never stored (privacy); aggregates only.
>
> **▸** Future: a dedicated forward address (orders@paintforge.io) so
> receipt emails reconcile themselves. Premium convenience candidate.
>
> **✦** *Data by-product: reconciliation events are ACTUAL purchase
> records --- basket composition, retailer, region. The highest-grade
> signal for §18 stream 4, collected as a side effect of saving users
> from their own checkouts. Offer name: \'Never Miss a Bottle.\'*

27\. Internationalization --- EN / ES / JA

Three languages, staged. English at launch. Spanish fast-follow: the
LATAM tabletop community is growing with essentially zero native tooling
(genuine differentiator) and the founder QAs the translation personally.
Japanese with the Japan push (§9): ties to the Gunpla lateral and the
underserved-expat angle.

The prize is not UI translation --- the prize is parsing Japanese
YouTube tutorials. An enormous Mr Color/Gunpla corpus is locked in
Japanese and served by no English tool. The §19.1 parser is
language-agnostic the moment the paint vocabulary carries official
Japanese names as aliases. A Spanish painter extracting a structured
recipe from a Japanese airbrush tutorial is a feature nobody on Earth
has built.

Paint names and SKUs are never translated --- product identity, not
prose. Exception: dual-official-name brands carry the
canonical/international name as primary everywhere, with the
original-language official name alongside in muted italics, always
searchable as an alias. Names never join the language switch.

> **✦** *Scaffold the i18n layer (string extraction, locale files) while
> components are being touched in the sprint --- retrofitting across a
> finished app is the most tedious job in frontend work. Language ≠
> region: the §19.4 profile owns region and retailers; language is an
> independent display setting. A Spanish speaker in Japan gets Spanish
> UI with Japanese-market availability --- a founder-shaped user.*

28\. Brand Identity --- Strategic Addenda

> **✦** *Section 15 is the authoritative design reference. This section
> covers only strategic items §15 does not.*

Logo Variant Status

Mono (cyan + print-dark) and two-tone SVGs exist --- generated from the
same cleaned 6-color source as canonical logo.svg. Remaining QA: the
print-dark variant on actual grayscale paper (for the §19.5 branded
shopping PDF) and two-tone legibility at 16-48px favicon sizes.

Four-pointed star: RESOLVED July 7, 2026. The star was a Gemini image
generator watermark artifact, automatically removed during
vectorization. The canonical logo.svg is clean and original. Flag closed
--- no redraw required.

Availability Badges (not Country Flags)

Brand headers carry an availability dot driven by the user\'s own quiz
result: stocked by your retailers / orderable / hard to get for you.
Origin ≠ accessibility --- and four of our brands are Spanish, so a flag
column would read like a La Liga table. Country flags live inside the
§24 Know More brand card as flavor, never as a primary UI element.

> **✦** *Trademark check before any major brand spend remains standing
> --- BrushForge name collision watch active.*

29\. Business Model Lenses --- Blank & Hormozi

Two frameworks, opposite ends, both land: Steve Blank on WHETHER the
model is real (customer development); Alex Hormozi on HOW it is packaged
and priced (value equation, offers). Blank governs the roadmap (§30);
Hormozi governs launch messaging and pricing posture.

29.1 The Blank Critique --- Polishing Is Not Testing

> **▸** A startup is a search for a business model, not the execution of
> one. This document is a stack of hypotheses written with one user (the
> founder) and zero customer conversations. Every hypothesis is
> explicit, cheap to test, and load-bearing --- nothing downstream gets
> built until its upstream hypothesis survives contact with real
> painters.
>
> **▸** Concierge MVP as the primary instrument: the riskiest assumption
> (painters will paste a tutorial link to get a paint list) is testable
> with ZERO code --- offer the service manually in 2-3 hobby Discords,
> parse by hand, count organic demand.
>
> **▸** Market type: resegmentation, not new market. Winning GTM is
> owning ONE segment completely (the serious collector, or the terrified
> newbie), not broadcasting at all of r/minipainting.
>
> **▸** Kill/pivot criteria are written before tests run --- so
> sunk-cost attachment cannot move goalposts afterward.

29.2 The Hormozi Lens --- Offers, Not Features

Value = (dream outcome × likelihood) ÷ (time × sacrifice). Substitution
cuts sacrifice, parsing cuts time, linter and timers raise likelihood,
Painting Mode cuts effort. The dream outcome is NEVER \'organized
inventory\' --- nobody dreams of a tidy database. The candy: paint this
exact mini, with what you own, without ruining it.

+---------------------+------------------------------------------------+
| > **Pricing         | > Price against the cost of one ruined €40     |
| > posture**         | > mini or one €60 wrong-ecosystem panic buy.   |
|                     | > Entry at €3-4 while proof is zero; raise     |
|                     | > with testimonials and documented saves at    |
|                     | > the Stage 3 gate.                            |
+---------------------+------------------------------------------------+
| > *                 | > Annual tier (€39-49/yr) with a small         |
| *Annual-preferred** | > tangible signup bonus --- converts           |
|                     | > commitment while enthusiasm is hot. Monthly  |
|                     | > exists but is not the anchor.                |
+---------------------+------------------------------------------------+
| > **Starter Path    | > One-time €19 product for terrified newbies:  |
| > (Stage 4          | > curated region-aware starter kit + chemistry |
| > experiment)**     | > cheat sheet + one guided first project.      |
|                     | > Monetizes the highest-first-order-value      |
|                     | > segment without subscription resistance.     |
|                     | > Testable as a landing page before it exists. |
+---------------------+------------------------------------------------+
| > **B2B2C probe     | > White-label the substitution/availability    |
| > (Stage 4)**       | > widget to hobby retailers --- they pay       |
|                     | > PaintForge AND give distribution. Worth      |
|                     | > exactly two discovery conversations with     |
|                     | > shop owners before any judgment.             |
+---------------------+------------------------------------------------+

30\. Validation-Gated Roadmap --- Milestones, Hypotheses, Gates

How to read: each stage lists what ships, the hypotheses it tests, pass
metrics (set BEFORE the test), and the gate condition. The roadmap looks
like a plan if every hypothesis holds --- and behaves like a series of
bets, each funded only when the previous one pays out. Numbers are
honest first guesses; the discipline is having A number, written down,
in advance.

> **✦** *STATUS --- July 10, 2026 (launch-minus-one, consistency
> pass): VERIFICATION RECORDS FILED. (a) Weird-brothers chemistry
> verification: Vallejo Liquid Gold = alcohol-based (verified tagged in
> Supabase); Vallejo Metal Color = water-alcohol hybrid (verified
> tagged). Recorded here so no future session re-litigates it. (b)
> Sharma ΔE2000 validation record: pass metric written before the run
> --- all 34 Sharma (2005) test pairs must match to 4 decimal places;
> result: 34/34 PASS, July 8, 2026; implementation is the from-source
> port in deltaE.js (npm packages rejected for known hue-rotation
> bugs). CODE FIXES SHIPPED (launch-eve audit): (1) grade() unified ---
> canonical single source now lives in deltaE.js with the hobby
> thresholds (Near Identical <1.5 · Excellent <3 · Close <6 · Usable
> <12 · Distant ≥12); the divergent legacy copy (1/2/5/10) deleted;
> SubstitutePanel imports it. (2) match_run analytics event now fires
> on target-paint change as well as tier/toggle change (was silently
> undercounting). (3) DetailPopup CAN_SUBSTITUTE gate extended with
> primer, contrast_primer, metallic_primer, dry, glaze --- primer↔primer
> matching (a rev U decision) was decided but unreachable in the UI.
> (4) Slogan corrected to canon: \"Paint It With What I Own\";
> DetailPopup button copy now \"Find a Substitute with IrisMatch.\"
> (5) Shop button recolored from orange #FF6B00 to violet #9060d0 in
> SubstitutePanel, Inventory (The Anvil), and HowToUse --- law
> restored: warm hues are warnings exclusively; violet is the
> commerce/action accent. OPEN VERIFICATION (owner: Agus, one query):
> SELECT DISTINCT finish_family FROM paints --- confirm DB values match
> UI string sets exactly, especially \"one-coat\" (UI expects hyphen,
> not one_coat) and whether \"fx\" exists as a value; a mismatch
> silently drops swatch borders and substitute buttons for those types.
> DOC CHANGES THIS REVISION: canonical name registry added to §1;
> July 9--10 competitor additions appended to §17 (BrushRage dossier
> corrected, Scalemates, Hobby Color Converter, KitColorsPro); Mixbox
> CC BY-NC licensing constraint filed under TrueBlend; catalog count
> reconciled to 6,259 / 13 brands across the body; §16 annex stamped as
> frozen July 6 snapshot; stale pending item (Warhammer label) marked
> resolved; stale \"category required before F3\" paragraph rewritten
> to reflect the shipped finish-repurpose mechanism. PENDING NEXT: The
> Anvil naming rollout in UI + loading-screen anvil logo (owner: Agus +
> twin); post-launch: category re-purification, labels/taxonomy module
> split so seed data leaves the bundle, hex_source provenance column.*

> **✦** *STATUS --- July 8, 2026 (Session 7 complete): F1 Supabase
> migration shipped. Full feature and data summary below. ⚠ INVENTORY
> UPDATES CLOSED. Vallejo, Army Painter, and Citadel have been deemed
> the most relevant brands for launch and are fully catalogued to their
> newest product lines. No further brand sweeps until post-launch.
> CURRENT CATALOG TOTAL: 6,259 entries (6,127 at migration + 132
> inventory-close additions: 18 Eccentric Color + 30 Pigment FX + 51
> Diorama FX + 7 Citadel shades + 26 Citadel contrasts). DATA
> ARCHITECTURE NOTE --- LINE MERGES ARE DISPLAY-LEVEL ONLY: Line merges
> (Model Air → Model Color, Game Air → Game Color, Liquid Gold →
> Metallics, Speedpaint 1.0+2.0 → Speedpaint) are display-level
> hierarchy changes only. Sections remain the canonical unit for
> chemistry, finish, and generation --- rows, hexes, and classifications
> stay distinct per section. No data was merged or consolidated. Any
> future AI session reading \"consolidated\" in the UI context must not
> interpret this as a data operation. All remaining brands (P3, Scale
> 75, Reaper, Green Stuff World, Mr Hobby, AK Interactive, Two Thin
> Coats, Pro Acryl) stay pending. Work from this point focuses entirely
> on app features, ΔE engine, and Reddit launch. July 8 --- F2 + F3
> SHIPPED. Find a Substitute design settled (full detail in Technical
> Spec v2.0): trigger = tap paint name (not swatch --- avoids accidental
> inventory edits); tiers = Owned / Custom Brands / All with embedded
> Brand Filter instance; cross-finish expansion limited to
> flat↔satin↔gloss only, with visible sheen warning chip; yellow chip =
> cross-section result (automatically flags cross-generation, e.g.
> Speedpaint 1.0 vs 2.0, since generations are sections); orange chip =
> cross-chemistry or hybrid involved in either direction; red never
> appears in substitution context. Always-closest doctrine: empty state
> is never permitted --- nearest match always shown. PRODUCT DECISION:
> ≥1 preferred brand mandatory at signup; existing users prompted once
> on next login; stored with brand-filter preference. Find a Color
> (hue/value/chroma sliders + hex paste) approved as a separate tool
> reusing the same matching engine --- zero new matching code. SESSION
> 8-9 (July 9-10, 2026) --- SHIPPED: Email infrastructure: Resend SMTP
> wired (smtp.resend.com port 465, verified domain paintforge.io). All
> six Supabase email templates customized in PaintForge forge voice ---
> Confirm signup, Reset password, Invite user, Change email, Password
> changed, Email address changed. Signed \"The Artificer.\" Supabase URL
> config confirmed (Site URL https://paintforge.io, Redirect
> https://paintforge.io/\*\*). Legal pages: ToS, Privacy Policy, About,
> Changelog --- four static HTML pages deployed to /public/ (served
> directly by Netlify). AYT International S.C. (Mexico) as operator.
> Supabase Singapore (ap-southeast-1) with EU SCCs. PostHog EU Cloud in
> cookieless mode. Resend disclosed as email processor. MIT credit to
> Rick Fleuren (Arcturus5404/miniature-paints). Footer links in Auth.jsx
> and Inventory.jsx. Changelog v0.1 baseline established. IrisMatch UI
> --- full polish pass: IrisMatch branding confirmed (\"Iris\" in
> #C084FC, \"Match\" in #7B5EA7, \"Paint with what you own\" subtitle).
> Two-column comparison area with 110px swatches, always present, empty
> state until result selected. Grade chips on cool/neutral ramp ONLY
> (Near Identical \<1.5 · Excellent \<3 · Close \<6 · Usable \<12 ·
> Distant ≥12). Warm hues reserved exclusively for warning chips ---
> design law, not preference. LAB directional hints below comparison (Δ
> Lightness, Δ Red-Green, Δ Yellow-Blue) with \"add X to equalize\"
> advice. SwatchPair in result rows (target + candidate touching). 20
> results. Brand Filter + Shop 🛒 buttons. ♦ My Set toggle per row.
> Honesty note at bottom. DetailPopup: tap paint name → popup with paint
> info → \"Find a Substitute\" button opens IrisMatch. Edge cases (no
> hex, auxiliary, colorshift, pigment) handled in popup. Item Types
> Glossary: GlossaryPopup component inline in SubstitutePanel (? next to
> Type in comparison row) and in HowToUse (button opens same popup). 12
> types defined across three sections. \"Wash / Shade\" confirmed as
> \"Wash.\" HowToUse updates: section header example shows type ·
> chemistry. \"Tapping a paint name\" section added. \"Item types\"
> section condensed with glossary button. Database --- major
> classification work: (1) Warhammer Colour rebrand --- brand label
> updated throughout TAXONOMY and SECTION_LABELS. (2) finish_family
> repurposed as type/category field --- new values: primer,
> contrast_primer, metallic_primer, varnish, satin_varnish, dry, glaze,
> custom, clear. (3) Citadel Spray split into 4 sections: SprayPrimer
> (7), ContrastPrimer (2), SprayMetallic (2), SprayVarnish (1). (4)
> Mecha varnishes moved to mechaVarnish section. (5) AP Warpaints
> Varnish section created (Aegis Suit + Anti-Shine separated from primer
> section). (6) Game Air 72.xxx → vallejoGameAirDisc (51 entries, old
> formulation). (7) Tamiya chemistry filled:
> enamel/waterborne_acrylic/lacquer/auxiliary/oil per line. (8) AK
> auxiliary + varnish chemistry set. (9) Citadel finish regression fixed
> (seeder had reset values). (10) Classification audit queries run --- 7
> queries, all gaps identified and fixed. Hex sampling: 81 new Warhammer
> Colour entries sampled --- all 61 Contrast + 19 current Shades + 2
> discontinued Shades (Coelia Greenshade, Seraphim Sepia). Total
> digitally sampled: 458. LAB backfill re-run after additions --- zero
> gaps confirmed. IrisMatch exclusions updated: primers REMOVED from
> exclusion list (primers now match other primers via finish rule).
> Excluded types: auxiliary, colorshift, pigment, varnish, satin_varnish
> only. PENDING ITEMS LOG (tracked; none are blocking the ΔE build or
> launch): UI --- small fixes: (1) Remove dash before finish tag in
> section headers (STILL PENDING) --- \"GAME COLOR --- flat ·
> waterborne_acrylic\" should read \"GAME COLOR flat ·
> waterborne_acrylic\"; font weight difference is sufficient separator.
> (2) Custom expand button (in the 5-button expand row) looks out of
> place --- update to use #8AABAB (the \"forge\" wordmark colour from
> the PaintForge logo) so it reads as part of the design system. (3)
> Loading screen shown before the auth section still displays crossed
> hammers --- replace with the anvil logo to match the current brand.
> Brand and taxonomy data: (4) RESOLVED --- Warhammer Colour brand
> label already updated throughout TAXONOMY and SECTION_LABELS (see
> classification item 1 of this log); entry retained only to mark the
> resolution. (5) Citadel Spray
> finish_family still NULL --- individual sprays vary (primer, colour,
> topcoat) so finish was intentionally left pending; revisit during a
> Citadel detail sweep. (6) All remaining brands (P3, Scale 75, Reaper,
> Green Stuff World, Mr Hobby, AK Interactive, Two Thin Coats, Pro
> Acryl) --- finish_family and chemistry_family all NULL. Renders
> correctly as pending (borderless swatch, no tag in section header). No
> action needed before launch. (7) Citadel Pigment FX hex sampling
> pending --- niche line, not required for the substitution engine.
> SHIPPED THIS BUILD SESSION (July 8, 2026): F2 --- LAB Precompute:
> lab_l, lab_a, lab_b columns added to the paints table. 5,480 rows
> backfilled via browser tool (hexToLab: sRGB → linear → XYZ D65 → CIE
> LAB). fetchCatalog updated to fetch LAB values alongside hex and
> classification. Sharma 34-pair test set validated to 4 decimal places
> --- 34/34 pass. LAB values are now in the in-memory catalog on every
> page load. F3 --- IrisMatch (Find a Substitute): Full substitution
> engine and UI shipped. ΔE2000 ported directly from Sharma 2005 (no npm
> package). rankSubstitutes() runs client-side over the full in-memory
> catalog (\<10ms at 6,259 rows). Candidate exclusions: primers,
> auxiliaries, colorshift, pigment, NULL finish, no hex/LAB, and all
> sections of the same paint code. Finish rule: same family only by
> default; flat↔satin↔gloss sheen trio expansion toggle available.
> Warning chips: yellow (cross-section), orange
> (cross-chemistry/hybrid). Grade chips: cool/neutral ramp (Near
> Identical \<1.5 · Excellent \<3 · Close \<6 · Usable \<12 · Distant
> ≥12). Always-closest doctrine --- empty state impossible. DetailPopup:
> tap any paint name → popup shows paint details, swatch,
> finish/chemistry tags, owned/set badges. Edge cases (null hex,
> auxiliary, colorshift, pigment) handled here with appropriate
> messages. \"Find a Substitute\" button only shown for substitutable
> paints. SubstitutePanel (IrisMatch branding): \"Iris\" in lilac,
> \"Match\" in violet, \"Paint with what you own\" subtitle. Two-column
> comparison always present --- 110px swatches, empty state until result
> selected, fills with target↔candidate pair on click. Attribute
> comparison (finish/chemistry/section) with bright green ✓ or amber ⚠.
> LAB directional hints below comparison: Δ Lightness, Δ Red-Green, Δ
> Yellow-Blue --- each with direction word and \"add X to equalize\"
> advice, suppressed below ±1 (sampling noise). Tier pills (Owned/Custom
> Brands/All). allow flat↔satin↔gloss toggle. Brand Filter + Shop 🛒
> buttons. ♦ My Set toggle per result row. 20 results. ΔE tooltip (?
> button). Honesty note at bottom. Confirmed flawless on mobile. Data
> schema: (8) category column --- RESOLVED FOR LAUNCH by the
> finish-repurpose decision (July 9): finish_family temporarily carries
> role/type values for non-standard paints (primer, contrast_primer,
> metallic_primer, varnish, satin_varnish, dry, glaze, custom, clear,
> wash, one-coat, ink, fx, metallic), which enforces matching-pool
> isolation by the existing same-finish rule --- F3 shipped on this
> mechanism, no category dependency. True sheens of repurposed rows
> (e.g., Mecha Primer satin, TMM Shade gloss) are preserved in the
> pre-sweep snapshot CSV. The category column exists in schema,
> unpopulated, and remains the POST-LAUNCH re-purification path:
> populate category (paint, primer, varnish, medium, flow_improver,
> masking, adhesive, pigment_binder, terrain_fixer), then restore
> finish_family to pure optical values. category and finish_family
> serve orthogonal concerns --- finish_family = optical behaviour,
> category = functional product type; a gloss varnish is finish
> \"gloss\" + category \"varnish\". Do not conflate them when the
> re-purification happens. SHIPPED THIS SESSION: §3.2 Fix First --- all three
> items resolved: export header corrected to PAINTFORGE --- INVENTORY;
> savePaint wrapped in try/catch with 4-second error indicator on
> failure; SETUP_SUPABASE.sql rewritten with correct schema including
> user_preferences, JSONB defaults, and RLS policies. F1 --- Supabase
> catalog migration: 6,127 paint entries moved from the client bundle
> (paints.js) to a Supabase paints table (NOTE: the pre-migration count
> was 6,201; the 74-entry difference is confirmed intentional --- Indart
> brand removal + AK taxonomy corrections + deduplication of catalog
> entries during migration; no silent row loss) with schema (id,
> section_key, name, hex, finish_family, chemistry_family, category).
> Inventory.jsx now fetches the catalog on mount via paginated
> fetchCatalog() (PAGE=1000 matching Supabase default cap), builds
> paintsBySection in memory, and renders identically to before. Loading
> state shows skeleton rows with spinner overlay and \"Loading your
> inventory and preferences...\" text. Error state shows \"Connection
> unstable\" with a window.location.reload() refresh button. Bundle size
> reduced by \~415KB. Search UX: search now temporarily overrides the
> active content filter to \"All\" and ignores the brand filter, so
> results span the full catalog regardless of saved state. Filter pills
> reflect the effective state during search. Subtle \"showing all brands
> while you search\" indicator appears when a brand filter is being
> bypassed. All state restores on clear --- nothing is permanently
> changed. TMM True Metal: all 60 entries (Light/Base/Shade/Airbrush ×
> 20 colors) updated with official chip hex values (all marked approx),
> tier suffixes added to names --- (light), (base), (shade), (airbrush),
> and finish_family = metallic set in Supabase. Swatch format system ---
> 6-state system driven by finish_family, live in ColorRow: (1)
> flat/gloss/satin/ink/one-coat/pigment → solid fill, solid border; (2)
> metallic/wash/fx/clear → solid fill, dashed border; (3) colorshift →
> white fill, dashed border, \~ no hex; (4) auxiliary → empty circle,
> grey border, --- ; (5) NULL finish_family (pending) → hex color shown
> if available, no border; (6) finish known but hex missing → empty
> circle, muted border, ?. The approx boolean column was never created
> --- finish_family IS the source of truth for swatch style. Finish and
> chemistry classification: 67 sections classified across Vallejo
> (complete, both columns), Army Painter (complete, both columns),
> Citadel (finish only), and Tamiya (finish where unambiguous).
> Classification stored per row in Supabase, set in bulk by section_key.
> All other brands and ambiguous sections left NULL (pending). Primer
> rule flagged: primer finish is color-relevant for planning but primers
> must never appear in color equivalence or substitution results ---
> first-class rule for the chemistry engine. Paint catalog --- inventory
> closed for launch: Vallejo fully catalogued across all product lines
> (Mecha Color with sampled hexes for all 42 base colours + metallics +
> weathering + fluo + primer; Eccentric Color Series added; Pigment FX
> added; Diorama FX added; TAXONOMY restructured --- Model Air into
> Model Color, Game Air into Game Color, Liquid Gold into Metallics
> line, Diorama FX into FX line). Army Painter fully catalogued
> (Speedpaint 1.0 and 2.0 consolidated under single Speedpaint line;
> Metallic 2.0 renamed). Citadel substantially complete (finish and
> chemistry classified across all lines; shades updated to 19 current
> entries; contrasts updated to 61 current entries; dry updated to 23
> current entries; technical updated to 21 current entries with Ardcoat
> name corrected; discontinued items organised under Discontinued
> product line --- glazes, shade disc., dry disc., technical disc.;
> Nighthaunt Gloom and Hexwraith Flame moved from Technical to
> Contrast). Six-state swatch system live. Section headers show finish ·
> chemistry tags. Section headers: finish_family and chemistry_family
> now displayed inline in each section header as muted tag --- \"SECTION
> NAME --- finish · chemistry\". Nothing shown for pending sections.
> Chemistry_family fetched alongside finish_family in the catalog
> select. Email confirmation fix: Supabase Site URL and Redirect URLs
> updated in dashboard to point to paintforge.io --- new user
> confirmation emails now land correctly. LAUNCH COMMITTED: Thursday
> July 10 is the hard build cutoff. Friday July 11 is the Reddit push.
> What is live by Thursday launches.*

Stage 0 --- This Week: Zero Code, Maximum Learning

+---------------------+------------------------------------------------+
| > **Ships**         | > Affiliate program applications (the long     |
|                     | > pole --- start today). API keys. ToS draft.  |
|                     | > Concierge service in 2-3 hobby Discords:     |
|                     | > \'send me a mini tutorial link, I send back  |
|                     | > the full paint list + what you\'d need to    |
|                     | > buy\' --- parsing done BY HAND. One          |
|                     | > chemistry explainer posted to gauge          |
|                     | > education-content pull.                      |
+---------------------+------------------------------------------------+
| > **Hypotheses**    | > H0a: painters actively want                  |
|                     | > tutorial→paint-list conversion. H0b:         |
|                     | > chemistry confusion is engaging content, not |
|                     | > just founder trauma.                         |
+---------------------+------------------------------------------------+
| > **Pass metrics**  | > H0a: ≥10 organic requests in 7 days AND ≥1   |
|                     | > unsolicited \'when is this an app?\'. H0b:   |
|                     | > the explainer generates real engagement      |
|                     | > relative to channel norms.                   |
+---------------------+------------------------------------------------+
| > **Gate**          | > H0a passes → Stage 1 committed, parser build |
|                     | > pre-authorized. H0a weak → STOP: run the     |
|                     | > same concierge test for image swatching and  |
|                     | > inventory-depth before choosing the wedge.   |
|                     | > Do NOT build the parser on founder           |
|                     | > conviction alone.                            |
+---------------------+------------------------------------------------+

Stage 1 --- Weeks 1-2: Foundation & Color Intelligence

+---------------------+------------------------------------------------+
| > **Ships**         | > Supabase DB migration, LAB precompute, ΔE    |
|                     | > engine + match UI, substitution ranking,     |
|                     | > availability quiz, affiliate layer v1, i18n  |
|                     | > scaffold, analytics instrumentation from day |
|                     | > one. Chemistry field + finish field +        |
|                     | > category flag added at migration time ---    |
|                     | > retrofit is painful.                         |
+---------------------+------------------------------------------------+
| > **Hypotheses**    | > H1: cross-brand matching + substitution is   |
|                     | > the daily-use hook. H2: shopping-list        |
|                     | > affiliate links convert at a viable rate.    |
+---------------------+------------------------------------------------+
| > **Pass metrics**  | > H1: ≥40% of week-one actives run ≥3 matches; |
|                     | > unprompted \'this is useful\' from ≥5 users. |
|                     | > H2: ≥8% of generated lists receive ≥1        |
|                     | > affiliate click.                             |
+---------------------+------------------------------------------------+
| > **Gate**          | > H1 pass → Stage 2 proceeds. H1 fail with H0a |
|                     | > passed → parser may still be the hook;       |
|                     | > proceed but flag matching UX for rework. H2  |
|                     | > fail → monetization assumption downgraded;   |
|                     | > revisit pricing posture (§29.2) before Stage |
|                     | > 3.                                           |
+---------------------+------------------------------------------------+

Stage 2 --- Weeks 3-4: The Launch Feature

+---------------------+------------------------------------------------+
| > **Ships**         | > YouTube parsing (pre-authorized by Stage 0), |
|                     | > recipe linter + top-30 product lines seeded  |
|                     | > with chemistry data, export trio (TXT +      |
|                     | > PDF + mobile live list), image swatching if  |
|                     | > time allows, founder recipes seeded, soft    |
|                     | > launch with \'paste any tutorial link\' demo |
|                     | > post.                                        |
+---------------------+------------------------------------------------+
| > **Hypotheses**    | > H3: parse→share is an organic growth loop.   |
|                     | > H4: linter warnings are valued, not noise.   |
+---------------------+------------------------------------------------+
| > **Pass metrics**  | > H3: parse is #1 feature by usage; ≥5         |
|                     | > unprompted shares of parse results; ≥25% of  |
|                     | > parsers return within 7 days. H4: \'why?\'   |
|                     | > explainer taps on ≥20% of warnings;          |
|                     | > dismiss-all under 15%.                       |
+---------------------+------------------------------------------------+
| > **Gate**          | > Week-2 retention ≥20% of signups AND H3      |
|                     | > directional → Stage 3 funded. Retention      |
|                     | > \<10% → STOP and diagnose before any         |
|                     | > monetization work: a leaky bucket does not   |
|                     | > get a paywall.                               |
+---------------------+------------------------------------------------+

Stage 3 --- Months 2-3: Monetization Layer

+---------------------+------------------------------------------------+
| > **Ships**         | > Premium tier live (annual-preferred per      |
|                     | > §29.2, token quota + top-up mechanic).       |
|                     | > Painting Mode + Painter\'s Muse + cure       |
|                     | > timers. The Vault with slot mechanics (3     |
|                     | > free / 10 premium / micro-transactions       |
|                     | > beyond 10 yearly). Order reconciliation      |
|                     | > (§26). Spanish locale. Mix Ratio Calculator. |
+---------------------+------------------------------------------------+
| > **Hypotheses**    | > H5: willingness to pay exists at the entry   |
|                     | > price. H6: the Vault becomes a content       |
|                     | > flywheel without prompting.                  |
+---------------------+------------------------------------------------+
| > **Pass metrics**  | > H5: ≥2.5% free→premium conversion within 30  |
|                     | > days of paywall, OR ≥25 paying users ---     |
|                     | > whichever is more honest at our user count.  |
|                     | > H6: ≥30% of completed projects vaulted       |
|                     | > public; vault pages register first organic   |
|                     | > search impressions within 45 days.           |
+---------------------+------------------------------------------------+
| > **Gate**          | > H5 pass → Stage 4 funded + Hormozi price     |
|                     | > revisit (raise with evidence). H5 fail with  |
|                     | > strong retention → product is loved, offer   |
|                     | > is wrong: rework packaging before touching   |
|                     | > features.                                    |
+---------------------+------------------------------------------------+

Stage 4 --- Months 4-6: Expansion Bets

+---------------------+------------------------------------------------+
| > **Ships**         | > Lateral marketing push (Gunpla/scale, Mr     |
|                     | > Color parse demos). Japanese locale +        |
|                     | > Japanese-alias parsing. Photo inventory      |
|                     | > capture beta. Box Registry + Box Wizard      |
|                     | > (AI-assisted). Starter Path landing-page     |
|                     | > test. Two B2B2C retailer discovery           |
|                     | > conversations. Barcode scanner. Automated    |
|                     | > Paint Pairing.                               |
+---------------------+------------------------------------------------+
| > **Hypotheses**    | > H7: lateral audiences adopt without product  |
|                     | > changes. H8: the Starter Path sells to       |
|                     | > newbies. H9: retailers see white-label       |
|                     | > value. H-Box: completion baskets convert at  |
|                     | > ≥2× the rate and ≥3× the value of            |
|                     | > single-item affiliate clicks.                |
+---------------------+------------------------------------------------+
| > **Pass metrics**  | > H7: ≥20% of new signups identify non-mini    |
|                     | > hobbies in the quiz. H8: landing-page        |
|                     | > conversion ≥3% to preorder/waitlist at €19.  |
|                     | > H9: ≥1 of 2 retailers asks for a follow-up   |
|                     | > unprompted. H-Box: basket CTR and average    |
|                     | > order value vs. baseline shopping-list       |
|                     | > links.                                       |
+---------------------+------------------------------------------------+
| > **Gate**          | > Each bet advances or dies independently ---  |
|                     | > no bundling.                                 |
+---------------------+------------------------------------------------+

Stage 5 --- Months 6-12: Scale Bets (All Evidence-Gated)

+---------------------+------------------------------------------------+
| > **Ships           | > Creator revenue-share portal (only if        |
| > (conditionally)** | > creators organically link parse results).    |
|                     | > Data-intelligence productization (only past  |
|                     | > \~2-3k MAU with opt-in). Marketplace         |
|                     | > experiment (only if vault creators ask to    |
|                     | > sell). LuxEngine vision-lab prototype.       |
|                     | > Multi-hobby positioning refresh.             |
+---------------------+------------------------------------------------+
| > **Hypotheses &    | > H10: ≥3 creators add PaintForge links to     |
| > metrics**         | > descriptions within 60 days of the rev-share |
|                     | > offer. H11: ≥1 manufacturer/distributor      |
|                     | > signs a paid pilot of any size.              |
+---------------------+------------------------------------------------+
| > **Gate**          | > No downstream to unlock --- surviving bets   |
|                     | > compound; dead ones are archived without     |
|                     | > ceremony. The multi-skin vision stays parked |
|                     | > unless PaintForge clears \~€5k/month.        |
+---------------------+------------------------------------------------+

Standing Rules

> **▸** Pass metrics are written before the test and never edited after.
> Misses are misses; the discussion is pivot-vs-kill, never \'the metric
> was wrong.\'
>
> **▸** Everything built stays useful on every branch --- database,
> color engine, chemistry layer, availability profile, Painter\'s Muse
> serve any wedge; gates decide what gets built NEXT, they never strand
> what exists.
>
> **▸** One founder, one active stage. The constraint is Agustín\'s
> hours; the gates exist to spend them only on validated ground.

**PAINTFORGE**

*The forge is lit. Now we build.*

artificer@paintforge.io
