# Marketing Team - Autonomous Marketing Workflow

## Overview

The Autonomous Marketing Team uses a **5-Agent Marketing Workflow** to create comprehensive marketing strategy and materials for your application. From positioning to landing pages to social media campaigns, the marketing team handles everything needed to launch and grow your product.

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   AUTONOMOUS MARKETING TEAM v1.0                           ║
║                    5-Agent Marketing Workflow                              ║
╚════════════════════════════════════════════════════════════════════════════╝

PHASE 1: MARKETING STRATEGY (Marketing Strategist)
        ↓
        🔔 CHECKPOINT 1: Strategy Approval
        ↓
PHASE 2: CONTENT CREATION (Content Creator + SEO Specialist IN PARALLEL)
        ↓
        🔔 CHECKPOINT 2: Content Approval
        ↓
PHASE 3: DISTRIBUTION PLANNING (Social Media Manager + Email Marketing IN PARALLEL)
        ↓
        🔔 CHECKPOINT 3: Campaign Approval
        ↓
PHASE 4: IMPLEMENTATION (Marketing Developer)
        ↓
PHASE 5: COMPLETION (Launch Checklist)
```

## The 5-Agent Marketing Team

### 1. Marketing Strategist - Strategy & Positioning

**Role:** Creates comprehensive go-to-market strategy

**Responsibilities:**
- Market positioning and competitive analysis
- Target audience definition and personas (3-5 detailed personas)
- Messaging framework and brand voice
- **Strategic channel selection** (2-3 PRIMARY channels based on data, not all channels)
  - Research what competitors are doing (what works, what doesn't)
  - Match channels to where target audience actually spends time
  - Prioritize based on ROI potential and budget fit
  - **Explicitly reject channels that don't fit** (with reasoning)
- Go-to-market timeline (pre-launch, launch, post-launch)
- Budget allocation based on ACTUAL budget from business plan
- Success metrics and KPIs (realistic, measurable)

**Key Philosophy:** **Focus on 2-3 channels and dominate them, rather than spread thin across 10 channels**

**Outputs:**
- `output/marketing-strategy.json` - Complete marketing strategy

**Prompt File:** `agents/marketing-strategist-prompt.md`

---

### 2. Content Creator - Marketing Content & Copy

**Role:** Writes compelling content that converts

**Responsibilities:**
- Landing page copy (hero, problem, solution, features, pricing, CTAs)
- Blog content strategy (10-15 SEO-optimized blog posts)
- Product descriptions (short, medium, long)
- Email copy templates (welcome, onboarding, nurture, conversion)
- Ad copy (Google Ads, social media ads)
- Microcopy (CTAs, error messages, tooltips)

**Outputs:**
- `output/marketing-content/landing-pages/`
- `output/marketing-content/blog-posts/`
- `output/marketing-content/email-templates/`
- `output/marketing-content/ad-copy/`

**Prompt File:** `agents/content-creator-prompt.md`

**Execution:** Runs **IN PARALLEL** with SEO Specialist

---

### 3. SEO Specialist - Search Engine Optimization

**Role:** Optimizes for organic search traffic

**Responsibilities:**
- Keyword research (primary, secondary, long-tail keywords)
- On-page SEO (meta tags, heading structure, content optimization)
- Technical SEO audit (sitemap, robots.txt, performance)
- Schema markup (Organization, SoftwareApplication, Article, FAQ)
- Content calendar (90-day SEO content plan)
- Link building strategy (internal, external, backlinks)
- SEO performance tracking (rankings, traffic, conversions)

**Outputs:**
- `output/seo-strategy.json` - Complete SEO strategy

**Prompt File:** `agents/seo-specialist-prompt.md`

**Execution:** Runs **IN PARALLEL** with Content Creator

---

### 4a. Social Media Manager - Social Strategy & Content

**Role:** Builds audience and drives engagement

**Responsibilities:**
- Social media strategy (channel selection, posting frequency)
- Content calendar (90 days, 3 posts/day)
- Platform-specific content (Twitter, LinkedIn, Instagram, TikTok)
- Launch campaign planning (pre-launch, launch week, post-launch)
- Engagement strategy (community building, growth tactics)
- Paid social strategy (budget allocation, ad campaigns)
- Analytics and reporting (growth, engagement, reach, conversion)

**Outputs:**
- `output/social-media-plan.json` - Social media strategy
- `output/social-media-posts/` - Content calendar and posts

**Prompt File:** `agents/social-media-manager-prompt.md`

**Execution:** Runs **IN PARALLEL** with Email Marketing Agent

---

### 4b. Email Marketing Agent - Email Campaigns & Automation

**Role:** Nurtures leads and converts customers

**Responsibilities:**
- Email sequences (welcome, onboarding, nurture, conversion, re-engagement)
- Email copywriting (subject lines, body content, CTAs)
- Email types (transactional, promotional, educational, engagement)
- Segmentation strategy (user status, engagement, journey stage)
- Email calendar (weekly, monthly, event-based)
- Email design guidelines (mobile-first, single CTA)
- Email automation workflows (triggers, conditions, actions)
- Metrics and A/B testing

**Outputs:**
- `output/email-campaigns/welcome-sequence/`
- `output/email-campaigns/onboarding-sequence/`
- `output/email-campaigns/nurture-sequence/`
- `output/email-campaigns/conversion-sequence/`

**Prompt File:** `agents/email-marketing-prompt.md`

**Execution:** Runs **IN PARALLEL** with Social Media Manager

---

### 5. Marketing Developer - Implementation

**Role:** Implements all marketing materials into the codebase

**Responsibilities:**
- Landing page implementation (homepage, about, features, pricing, case studies)
- SEO implementation (metadata, structured data, sitemap, robots.txt)
- Blog infrastructure (layout, post template, utilities, RSS feed)
- Email template implementation (React Email templates)
- OG image generation (social sharing images)
- Analytics & tracking (Google Analytics, event tracking, goals)
- Performance optimization (image optimization, lazy loading)

**Outputs:**
- `output/generated-project/app/marketing/` - Marketing pages
- `output/generated-project/content/blog/` - Blog posts
- `output/generated-project/emails/` - Email templates
- Updated homepage with marketing copy
- SEO metadata on all pages
- Analytics integration

**Prompt File:** `agents/marketing-developer-prompt.md`

---

## The 3 Checkpoints

### Checkpoint 1: Marketing Strategy Approval
**After:** Marketing Strategist completes strategy
**Shows:**
- Positioning statement and USPs
- Target audience and personas
- Key messages and brand voice
- Channel strategy and priorities
- Budget allocation
- Success metrics

**User Decision:** Approve strategy to proceed or request changes

---

### Checkpoint 2: Content Approval
**After:** Content Creator and SEO Specialist complete (in parallel)
**Shows:**
- Landing page copy preview
- Blog post titles and outlines
- Target keywords and search volumes
- SEO score and optimization recommendations
- Email subject lines

**User Decision:** Approve content or request revisions

---

### Checkpoint 3: Campaign Approval
**After:** Social Media Manager and Email Marketing complete (in parallel)
**Shows:**
- Social media content calendar (90 days)
- Example social posts for each platform
- Email sequence flows
- Launch campaign timeline
- Paid advertising strategy

**User Decision:** Approve campaigns to proceed with implementation

---

## How to Use

### Basic Usage

```bash
# Use the /market-app command to market your existing app
/market-app create comprehensive marketing strategy and launch campaign
```

### What Happens

1. **Phase 1**: Marketing Strategist creates strategy
   - You review and approve positioning, audience, channels, messaging

2. **Phase 2**: Content Creator + SEO Specialist work in parallel
   - You review landing pages, blog posts, keywords

3. **Phase 3**: Social Media + Email Marketing work in parallel
   - You review content calendar and email sequences

4. **Phase 4**: Marketing Developer implements everything
   - Landing pages go live
   - Blog infrastructure is ready
   - SEO is optimized
   - Analytics is tracking

5. **Phase 5**: Launch! You get a complete launch checklist

### Generated Marketing Assets

After completion, you'll have:

```
output/
├── marketing-strategy.json        # Complete go-to-market strategy
├── seo-strategy.json             # Keyword research and SEO plan
├── social-media-plan.json        # 90-day social content calendar
├── marketing-content/
│   ├── landing-pages/
│   │   ├── homepage.md           # Homepage copy
│   │   ├── features.md           # Features page copy
│   │   └── pricing.md            # Pricing page copy
│   ├── blog-posts/
│   │   ├── post-1.md             # SEO-optimized blog posts
│   │   ├── post-2.md
│   │   └── ...                   # 10-15 blog posts
│   ├── email-templates/
│   │   ├── welcome.md
│   │   ├── onboarding-day-1.md
│   │   └── ...
│   └── ad-copy/
│       ├── google-ads.md
│       └── social-ads.md
├── social-media-posts/
│   ├── twitter/
│   │   ├── week-1.md             # Daily tweets
│   │   └── ...
│   ├── linkedin/
│   └── instagram/
├── email-campaigns/
│   ├── welcome-sequence/
│   ├── onboarding-sequence/
│   ├── nurture-sequence/
│   └── conversion-sequence/
└── generated-project/            # Implementation
    ├── app/
    │   ├── page.tsx              # Updated homepage
    │   ├── marketing/
    │   │   ├── about/
    │   │   ├── features/
    │   │   └── case-studies/
    │   ├── blog/
    │   │   ├── layout.tsx
    │   │   └── [slug]/page.tsx
    │   ├── sitemap.ts
    │   └── robots.ts
    ├── content/blog/             # Blog markdown files
    ├── emails/                   # React Email templates
    └── public/
        └── og-images/            # Social sharing images
```

---

## Marketing Channels Covered

### Organic Channels
- **SEO & Content Marketing:** Blog posts, landing pages, organic search
- **Social Media Organic:** Twitter, LinkedIn, Instagram, TikTok, Reddit
- **Email Marketing:** Welcome sequences, newsletters, nurture campaigns
- **Community:** Forums, Discord, Slack communities
- **PR:** Press releases, media outreach, journalist relationships

### Paid Channels
- **Google Ads:** Search ads, display ads
- **Social Media Ads:** LinkedIn Ads, Facebook/Instagram Ads, Twitter Ads
- **Sponsored Content:** Industry publications, newsletters
- **Influencer Marketing:** Paid partnerships, sponsored posts

### Launch Channels
- **Product Hunt:** Launch strategy, hunter outreach, supporter mobilization
- **Hacker News:** Community engagement, Show HN posts
- **Reddit:** Relevant subreddit launches (r/SaaS, r/startups, etc.)
- **Tech Publications:** TechCrunch, The Verge, Product Hunt, Indie Hackers

---

## Sample Launch Checklist

After the marketing team completes, you'll receive a comprehensive checklist:

### PRE-LAUNCH (4 weeks before)
- [ ] Set up Google Analytics and tracking pixels
- [ ] Configure email service provider (SendGrid, Mailgun, Mailchimp)
- [ ] Create social media accounts (Twitter, LinkedIn, Instagram)
- [ ] Set up social media scheduling tool (Buffer, Hootsuite)
- [ ] Register with Product Hunt, prepare launch
- [ ] Prepare press kit and media outreach list
- [ ] Build waitlist and start collecting emails
- [ ] Create content stockpile (10 blog posts, 90 days of social posts)

### LAUNCH DAY
- [ ] Publish landing pages
- [ ] Activate email welcome sequence
- [ ] Post launch announcement on all social channels
- [ ] Launch on Product Hunt (Tuesday recommended)
- [ ] Submit to product directories (Capterra, G2, etc.)
- [ ] Reach out to press contacts
- [ ] Post on Hacker News, Reddit, Indie Hackers
- [ ] Monitor analytics and engagement

### POST-LAUNCH (Week 1)
- [ ] Start publishing blog posts (2/week)
- [ ] Continue social media posting per calendar (3/day)
- [ ] Monitor email open/click rates
- [ ] A/B test landing page variants
- [ ] Collect early user feedback
- [ ] Iterate on messaging based on data
- [ ] Thank early supporters publicly

### ONGOING
- [ ] Weekly social media engagement
- [ ] 2 blog posts per week
- [ ] Email nurture campaigns
- [ ] SEO optimization based on rankings
- [ ] Influencer outreach
- [ ] Content partnerships
- [ ] Monthly analytics review

---

## Success Metrics

The marketing team provides target metrics:

### Awareness
- Website traffic: 10,000 visitors/month by month 3
- Social followers: 2,000 followers by month 3
- Brand mentions: 50 mentions/month

### Engagement
- Email open rate: >20%
- Email CTR: >3%
- Social engagement rate: >2%
- Average time on site: >2 minutes

### Conversion
- Signup conversion rate: >3%
- Trial-to-paid conversion: >10%
- CAC (Customer Acquisition Cost): <$50
- LTV (Lifetime Value): >$500

### Growth
- MAU: 1,000 by month 3, 10,000 by month 12
- Month-over-month growth: >20%
- Referral rate: >15%

---

## Strategic Approach Example

### Scenario: B2B SaaS with $1,500/month budget

**❌ BAD STRATEGY (Unfocused):**
```
"We'll do SEO, Twitter, LinkedIn, Instagram, Facebook Ads, Google Ads,
influencer marketing, PR, podcasts, Reddit, and email marketing"
```
**Result:** Spread thin, mediocre execution on all channels, burn $1,500 with no results

**✅ GOOD STRATEGY (Focused):**
```
PRIMARY CHANNELS (90 days):
1. SEO + Content Marketing (40% budget = $600/mo)
   - Why: Target audience searches "[problem]" 12k times/month
   - Competitor data: Top competitor gets 40% traffic from organic, but publishes only 1 post/month
   - ROI: CAC $20 vs $150 for paid ads
   - Timeline: 4-6 months to rank, but starts building authority now

2. Twitter Organic (5% budget = $75/mo)
   - Why: 82% of target personas active on Twitter
   - Competitor data: Competitors have followers but <1% engagement
   - ROI: Can build 2,000 followers in 90 days, CAC $15
   - Timeline: 1-3 months to traction

3. Product Hunt Launch (10% budget = $150 one-time)
   - Why: Perfect audience match, competitor got 800 upvotes
   - ROI: 200-300 signups in one day, CAC $0.75
   - Timeline: Immediate impact

REJECTED CHANNELS:
- LinkedIn Ads: Too expensive ($8-12 CPC), needs $5k+/mo minimum
- TikTok: Audience is 35-50, only 18% use TikTok
- Facebook Ads: B2B audience not active for product discovery
- Google Ads: High CPC ($5-8), SEO is better ROI at this budget
```
**Result:** Focused execution, measurable ROI, sustainable growth

---

## Best Practices

### 1. Start Marketing Before Launch
Don't wait until your product is perfect. Start building audience 4-6 weeks before launch.

### 2. **Focus on 2-3 Channels First** (CRITICAL)
Better to dominate 2 channels than be mediocre on 10. The Marketing Strategist will research what actually works for YOUR product and audience, not just recommend everything.

**The team will:**
- Research 5-10 competitors and see which channels drove their growth
- Match channels to where your audience actually spends time (data, not assumptions)
- Prioritize based on your budget (don't recommend $10k strategies for $1k budgets)
- Explicitly reject channels that don't fit your situation

### 3. Build in Public
Share your journey on Twitter, write about what you're learning. Transparency builds trust.

### 4. Leverage Content Marketing
Create genuinely useful content that solves problems. SEO compounds over time.

### 5. Test Everything
A/B test subject lines, CTAs, ad copy, landing pages. Data beats opinions.

### 6. Engage Authentically
Social media is social. Reply to comments, join conversations, be helpful first.

### 7. Track Metrics Religiously
What gets measured gets improved. Set up analytics from day one.

### 8. **Trust the Strategy Agent's Research**
The Marketing Strategist does deep competitive research and provides data-driven reasoning for every recommendation. If it says "skip LinkedIn Ads for now," there's a good reason based on your budget and competitive landscape.

---

## Integration with Development Workflow

The marketing team integrates seamlessly with the development workflow:

```bash
# 1. Build your app
/build-app a fitness coaching platform

# 2. Improve your app (optional)
/improve-app add user notifications and improve performance

# 3. Market your app
/market-app create comprehensive launch campaign
```

Or market an existing app:

```bash
# If you already have an app in output/generated-project/
/market-app create SEO-optimized content and social media campaign
```

---

## Autonomous Execution

The marketing workflow is **fully autonomous between checkpoints**:

- Automatically spawns agents using the Task tool
- Passes outputs between agents
- Creates all marketing content
- Implements everything in the codebase
- Presents results at 3 checkpoints only

You only need to:
- **Approve or reject at the 3 checkpoints**
- **Review and refine messaging if needed**

---

## Tools & Budget

### Recommended Tools
- **Email:** SendGrid ($100/mo), Mailchimp ($50/mo)
- **Analytics:** Google Analytics (free), Mixpanel ($89/mo)
- **Social Media:** Buffer ($15/mo), Hootsuite ($49/mo)
- **SEO:** Ahrefs ($99/mo), SEMrush ($119/mo)
- **Design:** Canva Pro ($13/mo)

### Sample Budget
For a $5,000/month marketing budget:
- Paid Advertising: $1,500 (30%)
- Content Creation: $1,000 (20%)
- Tools & Software: $500 (10%)
- Partnerships/Influencers: $1,500 (30%)
- PR/Press: $500 (10%)

---

## File Structure

```
autonomous-dev-system/
├── agents/
│   ├── marketing-strategist-prompt.md     # Phase 1
│   ├── content-creator-prompt.md          # Phase 2a (parallel)
│   ├── seo-specialist-prompt.md           # Phase 2b (parallel)
│   ├── social-media-manager-prompt.md     # Phase 3a (parallel)
│   ├── email-marketing-prompt.md          # Phase 3b (parallel)
│   └── marketing-developer-prompt.md      # Phase 4
├── .claude/
│   └── commands/
│       └── market-app.md                  # Marketing orchestrator
└── output/                                # All generated marketing assets
```

---

## Next Steps

1. **Build Your App** (or use existing app):
   ```bash
   /build-app your app idea
   ```

2. **Create Marketing Materials**:
   ```bash
   /market-app create launch campaign
   ```

3. **Review Each Checkpoint** and approve when ready

4. **Launch Your Product**:
   - Landing pages are live
   - Blog is ready
   - Social media is scheduled
   - Emails are automated
   - Analytics is tracking

5. **Execute Launch Plan** following the checklist

---

## License

This autonomous marketing system is part of the Claude Code ecosystem.

---

**Built with Claude Code - Autonomous Marketing Intelligence**
