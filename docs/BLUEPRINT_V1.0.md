# GST Calculator — Development Blueprint V1.0

> **Status:** Approved for development  
> **Execution constraint:** 5 hours maximum  
> **Primary market:** India  
> **Primary language:** English  
> **Secondary language:** Hindi  
> **Core principle:** Utility first, monetization second.

---

## 1. Product Definition

### Product
A fast, simple, beautiful GST calculator for India.

### Core Promise
**Calculate GST in seconds.**

### Primary Users
- Consumers checking GST-inclusive prices
- Small-business owners
- Shopkeepers/traders
- Freelancers/service providers
- People preparing quick quotes/prices
- Accountants and finance users needing quick calculations

### Core User Jobs

#### Job 1 — Add GST
“I have ₹10,000. What should the customer pay?”

**₹10,000 → ₹11,800**

#### Job 2 — Remove GST
“I received ₹11,800. What was the original amount?”

**₹11,800 → ₹10,000**

#### Job 3 — Understand/share the calculation
Show:
- GST
- CGST
- SGST
- IGST
- Total

Optional:
- Hear the result
- Copy it
- Share it

---

## 2. Product Principles

These are non-negotiable.

1. **Calculator first** — The user should never have to navigate through content to reach the calculator.
2. **Simple by default** — A person who knows nothing about GST should be able to use it.
3. **Progressive disclosure** — Basic answer first; technical breakdown second.
4. **Game-quality, not game mechanics** — Use polished interaction, tactile feedback, subtle animation, and game-developer-level UX quality. Do not add XP, levels, points, distracting characters, or unnecessary game systems.
5. **Local-first** — Calculations happen in the browser.
6. **Privacy by default** — Do not collect information simply because we can.
7. **Monetization after value** — Ads must never obstruct the core calculation.

---

## 3. V1 Feature Scope

### P0 — Must Ship
- Amount input
- Indian number formatting
- Add GST
- Remove GST
- GST rate selection
- Custom GST rate
- CGST
- SGST
- IGST
- Intra-state calculation
- Inter-state calculation
- Instant calculation
- Result breakdown
- Copy result
- English
- Hindi
- Audio result
- Responsive mobile UX
- SEO foundation
- Analytics
- Production deployment

### P1 — Ship if Time Allows
- Share
- Shareable calculation card
- Business name
- Item/service
- Customer/reference
- Local calculation history

### P2 — Explicitly Excluded from V1
- Login
- Accounts
- Backend
- Database
- Cloud history
- GSTIN lookup
- HSN/SAC lookup
- Invoice system
- Quotation system
- Payments
- AI assistant
- Full GST compliance system
- Multiple additional languages

**Scope rule:** If a new feature does not materially improve the user's ability to calculate GST or our ability to acquire, measure, or monetize users, move it to V2.

---

## 4. Website Architecture

```text
/
│
├── GST Calculator — English
│
├── /hi/
│     └── GST Calculator — Hindi
│
├── /privacy
├── /terms
└── /about
```

### Core Decision
`/` is the calculator.

There is no marketing splash page between Google and the utility.

---

## 5. Primary User Flow

```text
Search
  ↓
GST Calculator
  ↓
Enter Amount
  ↓
Add GST / Remove GST
  ↓
Select GST Rate
  ↓
Instant Result
  ↓
View Breakdown
  ↓
Copy / Audio / Share
  ↓
Done
```

### UX Target
A first-time user should understand and complete the calculation in **under 10 seconds**.

---

## 6. Calculator UX

### Amount
Large input:

**₹ 10,000**

Automatic Indian formatting:

```text
1000      → ₹1,000
10000     → ₹10,000
100000    → ₹1,00,000
1000000   → ₹10,00,000
```

### Mode
Large segmented control:

**Add GST | Remove GST**

### GST Rate
Quick selections:

**5% | 18% | 40% | Custom**

Custom opens an inline input.

> Note: GST rates shown in the UI must be verified against the current intended Indian GST context before launch. Do not hard-code a claim that 40% is universally applicable.

### Tax Type
Simple control:

**Within State | Other State**

Within State:
- CGST + SGST

Other State:
- IGST

---

## 7. Result UX

Example:

### GST
**₹1,800**

### Total
# **₹11,800**

Then:

**View breakdown**

```text
CGST       ₹900
SGST       ₹900
```

For interstate:

```text
IGST       ₹1,800
```

Actions:
- 🔊 Audio
- Copy
- Share

The result must be the visual centerpiece of the experience.

---

## 8. Audio Feature

Use browser `SpeechSynthesis` / Web Speech API.

Example English output:

> “GST is one thousand eight hundred rupees. Your total is eleven thousand eight hundred rupees.”

Hindi should produce Hindi speech where the browser supports an appropriate voice.

If speech is unsupported:
- Gracefully hide/disable audio
- Never make audio the only way to access information

Audio is an enhancement, not a dependency.

---

## 9. Sharing

If time allows:

```text
Share
 ↓
Optional:
Business name
Item/service
Customer
 ↓
Generate share card
```

Example:

```text
GST CALCULATION

₹10,000
GST @ 18%

GST             ₹1,800
CGST              ₹900
SGST              ₹900

TOTAL          ₹11,800
```

### Sharing Requirements
- No account
- No server required
- Use Web Share API where available
- Fallback to copy/shareable text
- Do not transmit customer/business data to analytics

---

## 10. History

If P1 fits within the deadline:

Store the last **20 calculations** locally.

```text
localStorage
└── gst_calculator_history
```

No account required.

No cloud synchronization.

---

## 11. Language Strategy

### Default
**English**

Top-level switch:

**English | हिंदी**

### English UI
- GST Calculator
- Enter amount
- Add GST
- Remove GST
- GST Rate
- Total
- View Breakdown

### Hindi UI
- GST कैलकुलेटर
- राशि दर्ज करें
- GST जोड़ें
- GST हटाएँ
- GST दर
- कुल राशि
- विवरण देखें

### Language Product Principle
Hindi is being added because it improves usability for Indian users, especially users who are more comfortable operating in Hindi. SEO benefit is secondary.

Do **not** assume or promise that a Hindi page will rank #1 for Hindi searches.

---

## 12. Localization Architecture

Do not hard-code interface strings inside components.

Conceptually:

```text
translations
├── en
│   ├── calculator
│   ├── result
│   ├── actions
│   └── content
│
└── hi
    ├── calculator
    ├── result
    ├── actions
    └── content
```

Use translation keys such as:

```text
calculator.title
calculator.amount
calculator.add
calculator.remove
result.total
result.cgst
result.sgst
result.igst
actions.copy
actions.share
actions.audio
```

This makes future languages inexpensive to add.

---

## 13. Technical Stack

### Framework
**Next.js**

### Language
**TypeScript**

### Styling
**Tailwind CSS**

### Components
Small custom component system.

### Icons
**Lucide React**

### Animation
CSS-first.

Framer Motion is optional and should not become an architectural dependency.

### State
React state.

### Persistence
`localStorage` only for optional local history.

### Backend
**None for V1.**

### Database
**None for V1.**

### Hosting
**Vercel.**

### Repository
GitHub.

---

## 14. Calculation Engine

Keep GST mathematics separate from UI.

Conceptually:

```text
GST Engine
│
├── addGST()
├── removeGST()
├── calculateCGSTSGST()
├── calculateIGST()
├── validateAmount()
├── roundCurrency()
└── formatINR()
```

The calculation engine must be deterministic and independently testable.

### Calculation Logic

For a tax-exclusive amount:

```text
gstAmount = baseAmount × gstRate / 100
total = baseAmount + gstAmount
```

For an intra-state transaction:

```text
cgst = gstAmount / 2
sgst = gstAmount / 2
```

For an inter-state transaction:

```text
igst = gstAmount
```

For a tax-inclusive amount:

```text
baseAmount = totalAmount / (1 + gstRate / 100)
gstAmount = totalAmount - baseAmount
```

Currency results should be rounded consistently and tested for floating-point edge cases.

---

## 15. Core Data Model

```text
Calculation {
    id: string
    timestamp: number

    amount: number
    mode: "add" | "remove"

    gstRate: number

    taxType:
        "intraState"
        | "interState"

    gstAmount: number

    cgst: number
    sgst: number
    igst: number

    total: number
}
```

Optional share-card metadata:

```text
ShareCard {
    businessName?: string
    item?: string
    customer?: string

    calculation: Calculation
}
```

---

## 16. Privacy

### Do NOT collect
- Name
- Email
- Phone
- GSTIN
- Customer information
- Business information
- Payment information
- Individual calculation values

Calculation values should **not** be sent to analytics.

The calculator works without an account.

---

## 17. Analytics

### Search Analytics
Use **Google Search Console**.

Measure:
- Impressions
- Clicks
- CTR
- Search queries
- Average position
- Indexed pages

### Product Analytics
Use **Google Analytics 4**.

Core events:

```text
page_view

calculator_started
calculation_completed

gst_mode_changed
gst_rate_selected
tax_type_changed

result_copied
result_shared
share_card_generated
audio_played

history_used

language_changed
```

### Never send to analytics
```text
amount = ₹500000
GST = ₹90000
business = ...
customer = ...
GSTIN = ...
```

---

## 18. North-Star Metric

### Calculations per organic visitor

We care about whether traffic actually uses the product rather than raw traffic alone.

Secondary metrics:
- Organic traffic
- Calculation completion
- Calculations/user
- Hindi usage
- Audio usage
- Share usage
- Return users
- Revenue

---

## 19. SEO Strategy

### English
`/`

### Hindi
`/hi/`

Each page gets appropriate:
- Title
- Description
- Canonical
- Hreflang
- Open Graph metadata
- Semantic headings
- Structured data where appropriate

### English title direction
Example:

**GST Calculator – Calculate GST Online**

### Hindi title direction
Example:

**GST कैलकुलेटर – ऑनलाइन GST की गणना करें**

Exact titles should be validated during implementation/research.

### Technical SEO
Implement:
- `sitemap.xml`
- `robots.txt`
- Canonical URLs
- Hreflang
- Structured data where appropriate
- Crawlable HTML
- Semantic headings
- Fast page
- Mobile-first design

### AI/Search Discoverability
There is no magic “AI SEO” switch.

Make the product and information easy for search systems to understand through:
- Clear page purpose
- Explicit definitions
- Structured content
- Factual explanations
- Clean HTML
- Descriptive headings
- Strong internal linking
- Appropriate structured data
- Canonical URLs
- Crawlability
- Fast performance
- Original useful content

Do not attempt to game AI search.

---

## 20. On-Page Content

Below the calculator:

### What is GST?
### How to calculate GST?
### How to add GST?
### How to remove GST?
### CGST vs SGST vs IGST
### GST examples
### Frequently Asked Questions

Content must be genuinely useful.

Do not create:
- Keyword stuffing
- AI-generated content farms
- Fake FAQ pages
- Hundreds of thin keyword pages

Hindi content should be naturally localized rather than mechanically translated.

---

## 21. Monetization

### Primary Monetization Target
**Google AdSense**

Important:
AdSense approval and live ads are **not guaranteed within the five-hour build**.

Build an AdSense-ready architecture.

Reusable component:

```text
<AdSlot />
```

If AdSense is not approved/configured:
- Ad slot renders nothing
- Calculator remains fully functional

### Preferred Placement

```text
Calculator
 ↓
Result
 ↓
Actions
 ↓
AD
 ↓
Useful content
```

### Never
- Ads inside amount input
- Ads between rate and result
- Ads inside result card
- Ads covering calculator
- Popups
- Interstitials
- Auto-playing audio/video
- Fake download buttons
- Ads disguised as calculator controls
- Sticky ad obstruction on mobile

### Monetization Principle

**Monetize attention after delivering value.**

Hierarchy:

```text
User Value
    ↓
Usability
    ↓
Organic Traffic
    ↓
Monetization
```

---

## 22. Visual Design Direction

### Feel
**Fintech simplicity + game-quality interaction**

The experience should feel:
- Clean
- Warm
- Modern
- Confident
- Tactile
- Minimal

### Game Developer Advantage
Use game-quality polish:
- Micro-interactions
- Subtle transitions
- Immediate feedback
- Smooth state changes
- Strong visual hierarchy

Do not turn the calculator into a game.

The calculator remains visually dominant.

The result is the emotional centerpiece.

---

## 23. Responsive Design

### Mobile
Primary workflow:

```text
Amount
 ↓
Add/Remove
 ↓
Rate
 ↓
Result
```

Requirements:
- Comfortable touch targets
- Numeric keyboard
- No horizontal overflow
- Calculator immediately visible
- Ads must not obstruct interaction

### Desktop
Use additional whitespace for:
- Supporting content
- Advertisements
- Secondary information

without compromising calculator focus.

---

## 24. Accessibility

Support:
- Keyboard navigation
- Visible focus states
- Semantic labels
- Screen readers
- Adequate contrast
- Reduced-motion preference
- Audio as optional enhancement

---

# 25. Five-Hour Execution Plan

## 0:00–1:00 — Foundation + Calculation

### 0:00–0:10
- Project setup
- Next.js
- TypeScript
- Tailwind
- GitHub

### 0:10–0:30
- GST engine
- Add
- Remove
- CGST/SGST
- IGST
- Rounding
- Currency formatting

### 0:30–1:00
- Calculator UI
- Input
- Modes
- Rates
- Result

### Checkpoint #1
**Working calculator.**

---

## 1:00–2:00 — Core UX + Polish

- Responsive layout
- Result card
- Breakdown
- Validation
- Copy
- Clear/reset
- Transitions
- Typography
- Spacing
- Interaction states

### Checkpoint #2
**Looks and feels like a real product.**

---

## 2:00–3:00 — Differentiation

### 2:00–2:20
Hindi

### 2:20–2:35
Audio

### 2:35–2:50
Copy polish

### 2:50–3:00
Share

### Checkpoint #3
**Differentiated product.**

---

## 3:00–4:00 — Business Infrastructure

### 3:00–3:20
SEO

### 3:20–3:35
Useful content

### 3:35–3:45
Analytics

### 3:45–4:00
Ad infrastructure

---

# 26. Critical Deployment Checkpoint

## 4:00 — DEPLOY

Do not wait until the fifth hour.

Get the actual production URL working.

From this point onward, test against production.

---

## 4:00–4:30 — Production Setup

- Production configuration
- Domain
- HTTPS
- Favicon
- OG image
- Privacy
- Terms
- About
- Search Console
- Sitemap
- Indexing configuration checks

---

## 4:30–5:00 — QA + Launch

**No new features during this period.**

Only testing and fixes.

---

# 27. QA Checklist

## Calculation
- [ ] ₹10,000 + 18% = ₹11,800
- [ ] GST = ₹1,800
- [ ] CGST = ₹900
- [ ] SGST = ₹900
- [ ] ₹11,800 − 18% = ₹10,000
- [ ] IGST = ₹1,800
- [ ] Custom rate
- [ ] Decimal amount
- [ ] Large amount

## Input
- [ ] Empty
- [ ] Zero
- [ ] Negative
- [ ] Invalid characters
- [ ] Large values
- [ ] Rapid changes

## UX
- [ ] Add/remove switching
- [ ] Rate switching
- [ ] State switching
- [ ] Copy
- [ ] Audio
- [ ] Share
- [ ] Reset

## Language
- [ ] English
- [ ] Hindi
- [ ] English → Hindi
- [ ] Hindi → English
- [ ] Hindi metadata
- [ ] Hindi audio
- [ ] No untranslated UI strings

## Responsive
- [ ] Mobile
- [ ] Tablet
- [ ] Laptop
- [ ] Desktop
- [ ] No horizontal overflow
- [ ] Touch targets work
- [ ] Keyboard input works

## SEO
- [ ] Title
- [ ] Description
- [ ] Canonical
- [ ] Hreflang
- [ ] Sitemap
- [ ] Robots
- [ ] Structured data
- [ ] OG metadata

## Production
- [ ] HTTPS
- [ ] Domain
- [ ] Analytics
- [ ] Search Console
- [ ] Ad slot
- [ ] Privacy
- [ ] Terms
- [ ] About
- [ ] Favicon

---

# 28. Emergency Cut Order

If the project is behind schedule:

### Cut first
1. Advanced share-card customization
2. History UI
3. Fancy animations
4. Nonessential content

### Never cut
- Calculator
- Correct mathematics
- Mobile UX
- Hindi
- Audio
- SEO foundation
- Analytics
- Deployment
- QA

---

# 29. Definition of Done

The project is **DONE** when:

> A real person can open the public URL and, without instructions, calculate GST correctly in seconds.

They can:

**Calculate → Understand → Hear → Copy → Share**

They can use:

**English or Hindi**

The site is:

**Responsive → Search-ready → Analytics-ready → AdSense-ready → Deployed**

---

# 30. Council Governance

The Product Ideas project uses a five-member LLM council for major product decisions.

### Advisor 1 — Contrarian
Challenges assumptions, identifies risks, and asks what could be wrong.

### Advisor 2 — Principle Thinker
Focuses on first principles, user jobs, and conceptual correctness.

### Advisor 3 — Expansionist
Considers future scalability, leverage, and how today's architecture affects future opportunities.

### Advisor 4 — Outsider
Approaches the product as a person with little/no domain knowledge and checks whether the experience is actually understandable.

### Advisor 5 — Executor
Cares about what can actually be built and shipped, especially under time constraints.

### Chairman
Reviews all perspectives and makes the final decision.

### Governance Rule
Do not merely agree with the user's suggestion.

Challenge it constructively.

The goal is:
**constructive, ideal, practical decisions — not generic appreciation.**

This council model applies especially to:
- Product Ideas
- HLD Simulation SDK

---

# 31. Final Chairman Ruling

**STOP DISCUSSING. START BUILDING.**

The development blueprint is frozen.

The project progression is:

```text
RESEARCH
   ↓
PRD
   ↓
FLOW
   ↓
UX
   ↓
TECH
   ↓
DATA
   ↓
SEO
   ↓
ANALYTICS
   ↓
MONETIZATION
   ↓
5-HOUR EXECUTION
   ↓
🚀 LIVE
```

## Final Rule

**P0 beats P1. P1 beats polish. Polish beats nothing.**

If a new idea appears during development:
1. Do not automatically implement it.
2. Check whether it is P0/P1/P2.
3. If it is not necessary for launch, move it to V2.
4. Protect the five-hour deadline.

## Target

At the end of five hours:

**A real GST calculator is live on the internet.**
