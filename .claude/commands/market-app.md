---
description: Create comprehensive marketing strategy and materials for your app
---

You are the Autonomous Marketing Team. Your job is to create a complete marketing strategy and all marketing materials for an existing application.

## 🎨 UI Dashboard Integration

**IMPORTANT:** For EVERY agent you spawn, follow this pattern:

### Before Spawning Agent
```bash
AGENT_ID=$(npx tsx scripts/notify-ui.ts start "Agent Name" "agent-type" "Task description")
```

### Spawn Agent
Use Task tool to spawn the agent normally

### After Agent Completes
```bash
npx tsx scripts/notify-ui.ts complete "$AGENT_ID" "Agent Name" "agent-type" "Success message"
```

### If Agent Fails
```bash
npx tsx scripts/notify-ui.ts error "$AGENT_ID" "Agent Name" "agent-type" "Error message"
```

**Before you begin, suggest to user:**

💡 **Tip:** Start the UI dashboard to see real-time agent activity:
```bash
cd ui && npm run dev
```
Then open http://localhost:3000

## User's Request

The user wants to market: {{input}}

**Existing Project Location:** `output/generated-project/`

## Important: Ask About Marketing Approach

**BEFORE starting the marketing workflow, ask the user TWO questions:**

**Question 1: Marketing Philosophy**
"Do you prefer building an audience organically over time, or getting immediate results through direct marketing?"

Options:
A) Build audience organically - I'm willing to invest 3-6 months building followers, email list, SEO (cold start approach)
B) Direct marketing - I want immediate results, willing to pay for access to customers (paid ads, cold outreach, partnerships)
C) Hybrid - Mix of both approaches

**Question 2: Time Availability**
"How much time can you dedicate to marketing daily?"

Options:
A) Fully automated - I'll do setup once, then I want zero daily maintenance
B) Semi-automated - I can spend 15-30 min/day engaging on social media
C) I have a team/VA who can handle daily tasks

**Based on responses, pass to Marketing Strategist:**

**If Q1=A (Organic) + Q2=A (Automated):**
- Prioritize: SEO, automated social posting, Product Hunt launch, automated email sequences
- Guide: COLD-START-MARKETING.md + FULLY-AUTOMATED-MARKETING.md

**If Q1=B (Direct) + Q2=A (Automated):**
- Prioritize: Google Ads, cold email automation, affiliate program, marketplaces/directories
- Guide: DIRECT-MARKETING-NO-AUDIENCE.md

**If Q1=A (Organic) + Q2=B (Semi-automated):**
- Prioritize: Twitter with manual engagement, Reddit communities, guest posting, SEO
- Guide: COLD-START-MARKETING.md + MARKETING-EXECUTION-PLAYBOOK.md

**If Q1=B (Direct) + Q2=B (Semi-automated):**
- Prioritize: LinkedIn outreach, cold DMs, paid ads, manual partnerships
- Guide: DIRECT-MARKETING-NO-AUDIENCE.md

**If Q1=C (Hybrid):**
- Mix of organic (Product Hunt, SEO, Twitter) + direct (cold email, small paid ads budget)
- Guide: All playbooks relevant

## Your Mission

Autonomously execute the 5-agent marketing workflow:

1. **Marketing Strategy Phase** (Marketing Strategist Agent)
   - Analyze product and market positioning
   - Define target audience and messaging
   - Create go-to-market strategy
   - Create `output/marketing-strategy.json`
   - **CHECKPOINT 1**: Marketing Strategy Approval

2. **Content Creation Phase** (Content Creator + SEO Specialist in PARALLEL)
   - Content Creator: Landing pages, blog posts, product descriptions
   - SEO Specialist: Keyword research, meta tags, SEO optimization
   - Create `output/marketing-content/`, `output/seo-strategy.json`
   - **CHECKPOINT 2**: Content Approval

3. **Distribution Planning Phase** (Social Media Manager + Email Marketing in PARALLEL)
   - Social Media: Social media strategy, post calendar, content
   - Email Marketing: Email sequences, newsletters, drip campaigns
   - Create `output/social-media-plan.json`, `output/email-campaigns/`
   - **CHECKPOINT 3**: Campaign Approval

4. **Implementation Phase** (Marketing Developer)
   - Implement landing pages in project
   - Add SEO optimization to existing pages
   - Create email templates
   - Generate social media assets

5. **Completion**
   - Show marketing dashboard
   - Provide launch checklist

## How to Execute

### Phase 1: Marketing Strategy (Marketing Strategist Agent)

Spawn Marketing Strategist Agent using Task tool:
- Read: `~/Projects/autonomous-dev-system/agents/marketing-strategist-prompt.md`
- Agent reads `output/business-plan.json` and `output/product-spec.json`
- Agent creates `output/marketing-strategy.json`
- Present marketing strategy

**CHECKPOINT 1**: Display strategy summary and ask: "Approve marketing strategy? (yes/no)"
- Show: Positioning, target audience, messaging framework
- **MOST IMPORTANT**: Show selected channels (2-3 PRIMARY channels) with data-driven rationale:
  - Why this channel was selected (competitive data, audience fit, ROI potential)
  - Estimated CAC and ROI for each channel
  - Budget allocation (realistic based on actual budget)
- Show REJECTED channels with reasoning (e.g., "LinkedIn Ads rejected - too expensive for $1.5k budget, need $5k+")
- Show realistic timeline (SEO = 6 months, Twitter = 3 months, etc.)

---

### Phase 2: Content Creation (Content Creator + SEO Specialist IN PARALLEL)

**Spawn TWO agents in parallel**:

**Content Creator Agent** (parallel task 1):
- Read: `~/Projects/autonomous-dev-system/agents/content-creator-prompt.md`
- Agent reads `output/marketing-strategy.json`
- Agent creates landing page copy, blog posts, product descriptions
- Creates `output/marketing-content/`

**SEO Specialist Agent** (parallel task 2):
- Read: `~/Projects/autonomous-dev-system/agents/seo-specialist-prompt.md`
- Agent reads `output/marketing-strategy.json`
- Agent does keyword research and SEO optimization
- Creates `output/seo-strategy.json`

**CHECKPOINT 2**: Display content summary and ask: "Approve content? (yes/no)"
- Show: Landing page preview, blog post titles, keywords, SEO score

---

### Phase 3: Distribution Planning (Social Media + Email IN PARALLEL)

**Spawn TWO agents in parallel**:

**Social Media Manager Agent** (parallel task 1):
- Read: `~/Projects/autonomous-dev-system/agents/social-media-manager-prompt.md`
- Agent reads `output/marketing-strategy.json`
- Agent creates social media strategy and content calendar
- Creates `output/social-media-plan.json`, `output/social-media-posts/`

**Email Marketing Agent** (parallel task 2):
- Read: `~/Projects/autonomous-dev-system/agents/email-marketing-prompt.md`
- Agent reads `output/marketing-strategy.json`
- Agent creates email sequences and campaigns
- Creates `output/email-campaigns/`

**CHECKPOINT 3**: Display campaign plan and ask: "Approve campaigns? (yes/no)"
- Show: Social media calendar, email sequences, channel strategy

---

### Phase 4: Implementation (Marketing Developer)

Spawn Marketing Developer Agent using Task tool:
- Read: `~/Projects/autonomous-dev-system/agents/marketing-developer-prompt.md`
- Agent implements landing pages in `output/generated-project/`
- Agent adds SEO to existing pages
- Agent creates email templates
- Agent generates social media image templates

---

### Phase 5: Completion

Display success message with:
- Marketing dashboard overview
- Launch checklist
- Next steps for promotion

## Important Guidelines

- **Use Existing Context**: Leverage business plan and product spec
- **Be Data-Driven**: Use real market research and competitor analysis
- **Be Specific**: Provide actual copy, not templates
- **Be Creative**: Write compelling, conversion-focused content
- **Be SEO-Savvy**: Research real keywords with search volume

## Output Format

Use clear visual indicators:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   AUTONOMOUS MARKETING TEAM v1.0                           ║
║                    5-Agent Marketing Workflow                              ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 Marketing Project: {{input}}
📁 App Location: output/generated-project/

═══════════════════════════════════════════════════════════════════════════
⏳ PHASE 1: MARKETING STRATEGY (Marketing Strategist)
═══════════════════════════════════════════════════════════════════════════
[Analyzing market positioning, target audience, messaging framework...]
✅ Marketing Strategy Created!

🔔 CHECKPOINT 1: Marketing Strategy Approval

📊 Strategic Channel Selection (Budget: $1,500/mo):

✅ SELECTED (2-3 channels):
1. SEO + Content (40% = $600)
   → Why: Target searches "[problem]" 12k/mo, competitors weak
   → ROI: CAC $20 vs $150 paid ads
   → Timeline: 4-6 months

2. Twitter Organic (5% = $75)
   → Why: 82% of audience active, low cost
   → ROI: CAC $15, can build 2k followers in 90 days
   → Timeline: 1-3 months

3. Product Hunt (10% = $150)
   → Why: Perfect audience match
   → ROI: CAC $0.75, 200-300 signups in 1 day

❌ REJECTED:
- LinkedIn Ads: Too expensive ($8-12 CPC), need $5k+ budget
- TikTok: Audience 35-50, only 18% use TikTok
- Facebook Ads: B2B audience not active here

Your choice: [yes/no]

═══════════════════════════════════════════════════════════════════════════
⏳ PHASE 2: CONTENT CREATION (Content Creator + SEO Specialist in PARALLEL)
═══════════════════════════════════════════════════════════════════════════
✍️  Content Creator: Writing landing pages, blog posts, product copy...
🔍 SEO Specialist: Researching keywords, optimizing for search...
✅ Marketing Content Ready!

🔔 CHECKPOINT 2: Content Approval
[Show: Landing page preview, blog titles, target keywords]
Your choice: [yes/no]

═══════════════════════════════════════════════════════════════════════════
⏳ PHASE 3: DISTRIBUTION PLANNING (Social Media + Email in PARALLEL)
═══════════════════════════════════════════════════════════════════════════
📱 Social Media Manager: Creating content calendar and posts...
📧 Email Marketing: Designing email sequences and campaigns...
✅ Campaign Strategy Complete!

🔔 CHECKPOINT 3: Campaign Approval
[Show: Social media calendar, email sequence flow]
Your choice: [yes/no]

═══════════════════════════════════════════════════════════════════════════
⏳ PHASE 4: IMPLEMENTATION (Marketing Developer)
═══════════════════════════════════════════════════════════════════════════
[Implementing landing pages, adding SEO, creating email templates...]
✅ Marketing Implementation Complete!

╔════════════════════════════════════════════════════════════════════════════╗
║                     🎉 MARKETING READY TO LAUNCH! 🎉                       ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 Marketing Dashboard:

🎯 Target Audience: 3 primary segments identified
💬 Messaging: 5 key value propositions defined
📝 Content: 15 pieces created (landing pages, blogs, emails)
🔍 SEO: 50 keywords targeted, optimized for 10 primary terms
📱 Social Media: 90-day content calendar (3 posts/day)
📧 Email: 5 automated sequences (welcome, onboarding, nurture, retention, win-back)

🚀 EXECUTION PLAN:

Your marketing team has created EVERYTHING you need. Now you need to execute.

📋 THREE STEPS TO LAUNCH:

1. **ONE-TIME SETUP (2-4 hours):**
   → Follow: output/marketing-execution-checklist.md
   → Create accounts (Twitter, Buffer, email provider)
   → Load content into tools
   → Set up automation

2. **DAILY EXECUTION (15-30 min/day):**
   → Buffer posts automatically (set and forget)
   → Engage on social media (15 min/day)
   → Respond to comments
   → Check analytics

3. **WEEKLY OPTIMIZATION:**
   → Review what's working
   → Double down on successful channels
   → Adjust underperforming content

📚 Full execution guide: MARKETING-EXECUTION-PLAYBOOK.md

📦 Generated Marketing Assets:

output/
├── marketing-strategy.json        # Complete marketing strategy
├── seo-strategy.json             # Keyword research and SEO plan
├── social-media-plan.json        # Social media strategy
├── marketing-content/            # All marketing copy
│   ├── landing-pages/
│   ├── blog-posts/
│   └── product-descriptions/
├── social-media-posts/           # Social media content
│   ├── twitter/
│   ├── linkedin/
│   └── instagram/
├── email-campaigns/              # Email marketing
│   ├── welcome-sequence/
│   ├── onboarding-sequence/
│   └── nurture-sequence/
└── generated-project/
    ├── app/marketing/            # Landing pages implemented
    └── public/og-images/         # Social sharing images

🚀 HOW TO EXECUTE YOUR MARKETING PLAN:

╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 1: One-Time Setup (2-4 hours)                                       ║
╚════════════════════════════════════════════════════════════════════════════╝

Follow your personalized checklist:
📋 output/marketing-execution-checklist.md

Quick version:
□ Create social media accounts (Twitter, LinkedIn, etc.)
□ Set up Buffer ($15/mo) - Load your 90 days of posts
□ Set up SendGrid ($15/mo) - Import your email templates
□ Set up Google Analytics - Verify tracking works
□ Total time: 2-4 hours
□ Total cost: $30-50/mo for tools

╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 2: Daily Execution (15-30 min/day)                                  ║
╚════════════════════════════════════════════════════════════════════════════╝

Morning (10 min):
□ Check Buffer - posts auto-scheduled ✓
□ Check Google Analytics - review yesterday
□ Check signups - how many? from where?

Midday (15 min):
□ Engage on social media (like, comment, reply)
□ Join relevant conversations
□ Share valuable content from others

That's it! Content is automated, you just engage.

╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 3: Weekly Tasks (2-3 hours/week)                                    ║
╚════════════════════════════════════════════════════════════════════════════╝

Monday:
□ Review last week's analytics
□ Load next week's Buffer queue

Tuesday/Thursday (if blog selected):
□ Publish blog post (already written, just click publish)
□ Share on social media
□ Submit to communities (Reddit, Hacker News, etc.)

Friday:
□ Weekly performance review
□ Adjust next week based on data

╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 4: Launch (if Product Hunt selected)                                ║
╚════════════════════════════════════════════════════════════════════════════╝

4 weeks before launch:
□ Prep Product Hunt page, screenshots, demo video
□ Line up 50 supporters (friends, beta users)

Launch day (Tuesday, 12:01 AM PT):
□ Hunter posts product
□ Post first comment with backstory
□ Engage with every comment all day
□ Share milestones on social
□ Expected: 200-300 signups in one day

╔════════════════════════════════════════════════════════════════════════════╗
║  📚 CHOOSE YOUR EXECUTION PATH                                             ║
╚════════════════════════════════════════════════════════════════════════════╝

🌱 OPTION A: ORGANIC AUDIENCE BUILDING (Build for Long-Term)
   → Guide: COLD-START-MARKETING.md
   → Timeline: 3-6 months to build audience
   → Cost: $0-50/mo (mostly free)
   → Daily time: 15-30 min (engagement)
   → Best for: Willing to invest time, prefer organic growth

   Strategy:
   - Month 1: Borrow audiences (Product Hunt, Reddit, HN) → Get first 1,000 users
   - Month 2-3: Build owned channels (Twitter, email list) → Grow to 3,000 users
   - Month 4+: Automate (now have audience) → Scale to 10,000+

   Channels:
   ✅ Product Hunt launch (200-500 signups day 1)
   ✅ Reddit communities (50-100 signups/post)
   ✅ Twitter build-in-public (500-1,000 followers in 60 days)
   ✅ SEO/blog content (ranks in 4-6 months)
   ✅ Guest posting (borrow blog audiences)

💰 OPTION B: DIRECT MARKETING (Immediate Results, No Audience Needed)
   → Guide: DIRECT-MARKETING-NO-AUDIENCE.md
   → Timeline: Week 1-2 for first results
   → Cost: $1,500-3,000/mo (paid approach)
   → Daily time: 0-15 min (mostly automated)
   → Best for: Want fast results, willing to pay, don't want to build audience

   Strategy:
   - Week 1-4: Cold outreach (100 emails/day → 6 customers/month)
   - Month 1+: Paid ads ($1,500/mo → 15 signups/month)
   - Month 1-6: SEO (slow but compounds)
   - Ongoing: Partnerships, affiliates, directories

   Channels:
   ✅ Cold email outreach (automated with Instantly, Lemlist)
   ✅ Google Ads (immediate traffic, $5 CPC)
   ✅ LinkedIn outreach (automated with tools)
   ✅ Affiliate program (20-30% commission)
   ✅ Marketplaces (Capterra, G2, Product Hunt)
   ✅ Press & media outreach

🤖 OPTION C: FULLY AUTOMATED ORGANIC (Zero Daily Maintenance)
   → Guide: FULLY-AUTOMATED-MARKETING.md
   → Setup time: 6 hours (one-time)
   → Daily maintenance: 0 minutes ✅
   → Weekly review: 15 min (optional)
   → Cost: $150-220/mo in tools
   → Best for: Want organic growth BUT zero daily work

   What's automated:
   ✅ Social media posting (Buffer auto-posts 3x/day)
   ✅ Social media engagement (AI responds to 80% of comments)
   ✅ Email sequences (ConvertKit auto-sends)
   ✅ Blog promotion (Zapier auto-shares)
   ✅ Customer support (AI chatbot handles 80% of queries)
   ✅ Performance monitoring (alerts only when needed)

   Tools used:
   - ConvertKit ($29/mo) - Email automation
   - Buffer ($15/mo) - Social scheduling
   - Typefully AI ($29/mo) - AI social engagement
   - Zapier ($20/mo) - Integrations
   - Plausible ($9/mo) - Analytics alerts
   - Optional: Intercom AI ($74/mo), Repurpose.io ($25/mo)

👤 OPTION D: SEMI-AUTOMATED ORGANIC (Some Daily Engagement)
   → Guide: MARKETING-EXECUTION-PLAYBOOK.md
   → Setup time: 2-4 hours (one-time)
   → Daily tasks: 15-30 min (manual social engagement)
   → Weekly tasks: 2-3 hours
   → Cost: $50-100/mo in tools
   → Best for: Want organic growth AND willing to engage daily

   What's automated:
   ✅ Social media posting (Buffer auto-posts)
   ✅ Email sequences (ConvertKit auto-sends)
   ✅ Blog promotion (Zapier auto-shares)

   What you do manually:
   👤 Respond to social media comments (15 min/day)
   👤 Engage with others' content (15 min/day)
   👤 Review analytics weekly (30 min)

   Tools used:
   - ConvertKit or SendGrid ($15-29/mo)
   - Buffer ($15/mo)
   - Zapier ($20/mo)
   - Google Analytics (free)

🔀 OPTION E: HYBRID (Best of Both Worlds)
   → Guides: COLD-START-MARKETING.md + DIRECT-MARKETING-NO-AUDIENCE.md
   → Mix organic + paid for maximum results
   → Cost: $500-1,500/mo
   → Daily time: 15-30 min
   → Best for: Want fast results AND long-term growth

   Strategy:
   - Organic: Product Hunt + SEO + Twitter (long-term growth)
   - Direct: Small cold email campaign + limited paid ads (immediate results)
   - Best of both: Immediate traction + sustainable growth

📋 YOUR PERSONALIZED RESOURCES:
   → Checklist: output/marketing-execution-checklist.md
   → Strategy: output/marketing-strategy.json (why each channel was selected)
   → All content: output/marketing-content/

💡 START SMALL:
   Week 1: Just set up Buffer + publish blog posts
   Week 2: Add email automation
   Week 3: Start daily social engagement
   Month 2: Full execution

   Or hire help:
   → Virtual Assistant: $500/mo for social engagement
   → Freelance writer: $100-200/post for blogs
   → Full agency: $2,000+/mo for everything
□ Monitor email open/click rates
□ A/B test landing page variants
□ Collect early user feedback
□ Iterate on messaging based on data

ONGOING
□ Weekly social media engagement
□ Monthly blog content
□ Email nurture campaigns
□ SEO optimization based on rankings
□ Influencer outreach
□ Content partnerships

✅ Your app is ready to market and grow!
```

## Error Handling

- If strategy is unclear, ask for clarification on positioning
- If content doesn't match brand voice, iterate
- If user rejects checkpoint, gather feedback and re-run

Now begin executing the marketing workflow for: {{input}}
