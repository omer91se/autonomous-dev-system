# Marketing Execution Playbook

## Overview

After the Marketing Team creates your strategy and materials, you need to **execute the plan**. This playbook shows you exactly how to take the generated marketing materials and put them into action.

## What the Marketing Team Creates vs. What You Execute

### ✅ Marketing Team Creates:
- Complete marketing strategy (what to do, where, when)
- All content (blog posts, social posts, emails, landing pages)
- Implementation (adds pages to your app, sets up SEO)
- Automation setup (email sequences, scheduling templates)

### 👤 You Execute:
- One-time setup (create accounts, connect tools)
- Ongoing activities (publish, engage, monitor)
- Optimization (A/B testing, responding to data)

**Think of it like this:** The marketing team is your **strategist + content creator + developer**. You're the **operator** who runs the machine they built.

---

## Phase 1: One-Time Setup (2-4 hours)

Do this once after the Marketing Team completes:

### 1. Create Accounts & Tools

Based on your selected channels, create accounts:

**If SEO + Content is a primary channel:**
- [ ] Set up Google Search Console
  - Go to https://search.google.com/search-console
  - Add your domain
  - Verify ownership (DNS or HTML file)
  - Submit sitemap: `https://yourdomain.com/sitemap.xml`

- [ ] Set up Google Analytics 4
  - Go to https://analytics.google.com
  - Create property
  - Add tracking code (Marketing Developer already added this)
  - Set up goals (signups, trials, purchases)

**If Twitter is a primary channel:**
- [ ] Create Twitter/X account
  - Professional username (@yourproduct)
  - Bio from marketing strategy
  - Profile pic and header image

- [ ] Set up Buffer (or Hootsuite)
  - Go to https://buffer.com ($15/mo)
  - Connect Twitter account
  - Import your 90-day content calendar from `output/social-media-posts/twitter/`

**If Email Marketing is included:**
- [ ] Set up email service provider
  - **SendGrid:** https://sendgrid.com (transactional, $15/mo)
  - **Mailchimp:** https://mailchimp.com (marketing, $20/mo)
  - **ConvertKit:** https://convertkit.com (creator-focused, $25/mo)

- [ ] Import email templates
  - Upload templates from `output/email-campaigns/`
  - Set up automation sequences (welcome, onboarding, nurture)
  - Connect to your domain (SPF, DKIM records)

**If LinkedIn is a primary channel:**
- [ ] Create LinkedIn Company Page
- [ ] Set up LinkedIn personal profile (founder)
- [ ] Optional: LinkedIn Sales Navigator ($79/mo for prospecting)

**If Product Hunt launch is planned:**
- [ ] Create Product Hunt account
- [ ] Join community, upvote products (build karma)
- [ ] Identify "hunter" (someone with followers to post for you)
- [ ] Prepare 50 supporters (friends, beta users) for launch day

### 2. Load Content into Tools

**Blog Posts:**
```bash
# Your blog posts are already in output/generated-project/content/blog/
# They're automatically published when you deploy your app
# Just verify they're live at: https://yourdomain.com/blog

# If you want to schedule future posts, rename files:
# draft-post-title.md (won't be published)
# 2024-02-15-post-title.md (publishes on that date)
```

**Social Media Posts:**
```bash
# Load into Buffer/Hootsuite
1. Go to Buffer → Content → Import
2. Upload CSV from: output/social-media-posts/twitter/schedule.csv
3. Review schedule (9am, 2pm, 6pm daily)
4. Approve and publish

# Or manually schedule in Buffer:
- Week 1: Load 21 posts (3/day × 7 days)
- Repeat weekly from your content calendar
```

**Email Sequences:**
```bash
# In your email service provider:

1. Welcome Sequence (triggers on signup):
   - Email 1: Immediate (from output/email-campaigns/welcome-sequence/01-welcome.md)
   - Email 2: +1 day (02-get-started.md)
   - Email 3: +2 days (03-first-feature.md)
   - Email 4: +3 days (04-success-stories.md)
   - Email 5: +5 days (05-upgrade-cta.md)

2. Onboarding Sequence (triggers after welcome):
   - Set up triggers based on user actions
   - Import templates from onboarding-sequence/

3. Nurture Sequence (for inactive users):
   - Trigger: User hasn't logged in for 7 days
   - Import templates from nurture-sequence/
```

### 3. Set Up Tracking

**Conversion Tracking:**
```javascript
// Already added by Marketing Developer, verify it's working:

// Google Analytics Events:
- Signup: trackEvent('signup', { source: 'homepage' })
- Trial Start: trackEvent('trial_started', { plan: 'pro' })
- Upgrade: trackEvent('upgrade', { from: 'free', to: 'pro' })

// Test in browser console:
window.gtag('event', 'test_event', { test: true });
// Check Google Analytics Real-Time events
```

**UTM Parameters for Campaign Tracking:**
```
Homepage: https://yourdomain.com
Twitter traffic: https://yourdomain.com?utm_source=twitter&utm_medium=social&utm_campaign=launch
Product Hunt: https://yourdomain.com?utm_source=producthunt&utm_medium=listing&utm_campaign=launch
Email: https://yourdomain.com?utm_source=email&utm_medium=welcome&utm_campaign=onboarding

Track these in Google Analytics → Acquisition → Campaigns
```

---

## Phase 2: Daily Execution (15-30 min/day)

### Daily Checklist (Mon-Fri)

**Morning Routine (10 minutes):**
- [ ] Check Buffer queue - verify posts are scheduled for today
- [ ] Check Google Analytics - review yesterday's traffic
- [ ] Check email automation - any errors or bounces?
- [ ] Check signups - how many yesterday? From which source?

**Social Media Engagement (15 minutes):**
- [ ] Respond to all comments on your posts (2-5 min)
- [ ] Engage with 10 posts in your niche (like, comment, retweet)
- [ ] Join 2-3 relevant conversations (search keywords, reply thoughtfully)
- [ ] Share 1 piece of valuable content from others

**Content Publishing:**
- [ ] If it's blog day (Mon/Thu): Verify post went live
- [ ] Share blog post on social media
- [ ] Add to relevant communities (Reddit, Indie Hackers)

**Evening Check (5 minutes):**
- [ ] Review engagement on today's posts
- [ ] Respond to any new comments/DMs
- [ ] Note what content performed well (for future)

### Weekly Tasks

**Monday:**
- [ ] Load next week's social posts into Buffer
- [ ] Review analytics from last week
- [ ] Update metrics spreadsheet (traffic, signups, conversions)

**Tuesday:**
- [ ] Publish blog post #1 (if not automated)
- [ ] Share on all channels
- [ ] Submit to relevant communities

**Wednesday:**
- [ ] Check email sequences - review open/click rates
- [ ] A/B test subject lines if needed
- [ ] Update poorly performing emails

**Thursday:**
- [ ] Publish blog post #2 (if not automated)
- [ ] Engage with industry influencers (comment on their posts)

**Friday:**
- [ ] Review week's performance
- [ ] Plan next week's content adjustments
- [ ] Update content calendar if needed
- [ ] Respond to all community questions/comments

### Monthly Tasks

**First Week of Month:**
- [ ] Review previous month metrics vs. targets
- [ ] Create monthly report (template in output/marketing-strategy.json)
- [ ] Adjust strategy based on data (double down on what works)

**Throughout Month:**
- [ ] Update blog content calendar for next month
- [ ] Refresh old blog posts with new data
- [ ] Reach out to potential guest post opportunities
- [ ] Check SEO rankings (Google Search Console)

---

## Phase 3: Launch Execution

### Product Hunt Launch (Example)

**4 Weeks Before:**
- [ ] Prep Product Hunt page draft
- [ ] Screenshot app, create demo video
- [ ] Write tagline and description
- [ ] Identify hunter (someone with PH followers to post for you)

**2 Weeks Before:**
- [ ] Line up 50 supporters (email friends, beta users)
- [ ] Create supporter outreach email
- [ ] Set launch date (Tuesday or Wednesday best)
- [ ] Prepare assets (images, GIFs, first comment)

**1 Week Before:**
- [ ] Email supporters with launch date/time
- [ ] Prepare social media announcements
- [ ] Write founder comment (post immediately after launch)
- [ ] Test all links

**Launch Day (Tuesday, 12:01 AM PT):**
```
Hour 0 (12:01 AM):
- [ ] Hunter posts product
- [ ] Post first comment with backstory
- [ ] Share on Twitter, LinkedIn
- [ ] Email supporter list

Hour 1-3 (Morning):
- [ ] Respond to every comment
- [ ] Share updates on social media
- [ ] Monitor rankings

Hour 4-12 (Afternoon):
- [ ] Continue engaging with comments
- [ ] Share milestones (#3 product!)
- [ ] Thank supporters publicly

Hour 13-24 (Evening):
- [ ] Final push to supporters
- [ ] Respond to all comments
- [ ] Prepare wrap-up post for next day
```

**Day After:**
- [ ] Post results on Twitter/LinkedIn
- [ ] Thank everyone who supported
- [ ] Follow up with highly engaged users
- [ ] Add "Featured on Product Hunt" badge to site

---

## Phase 4: Automation Setup

### Email Automation (Mailchimp Example)

**Welcome Sequence:**
```
Trigger: User signs up

Automation Flow:
[Signup] → Wait 0 min → Email 1 (Welcome)
         → Wait 1 day → Email 2 (Get Started)
         → Wait 1 day → Email 3 (Feature #1)
         → Wait 1 day → Email 4 (Success Story)
         → Wait 2 days → Email 5 (Upgrade CTA)

Setup in Mailchimp:
1. Automations → Create → Custom
2. Trigger: "Someone subscribes to list"
3. Add emails with delays
4. Import content from output/email-campaigns/welcome-sequence/
```

**Drip Campaign Based on Behavior:**
```
If user hasn't upgraded after 14 days:
→ Send conversion sequence

If user hasn't logged in for 7 days:
→ Send re-engagement sequence

If user uses feature X:
→ Send feature-specific tips email
```

### Social Media Automation

**Buffer Setup:**
```bash
1. Connect accounts (Twitter, LinkedIn, etc.)
2. Set posting schedule:
   - Twitter: 9am, 2pm, 6pm (3/day)
   - LinkedIn: Tue/Thu 10am (2/week)
3. Import content calendar CSV
4. Enable "Optimal Timing" (Buffer suggests best times)
5. Set up RSS feed for blog auto-sharing
```

**Zapier Automations:**
```
New blog post published →
  - Post to Twitter
  - Post to LinkedIn
  - Share in Slack community
  - Add to email newsletter queue

New signup →
  - Add to email list
  - Send to analytics
  - Notify in Slack

Product Hunt comment →
  - Notify in Slack
  - Add to response queue
```

### Content Repurposing Automation

```
Blog post published →
  1. Create Twitter thread (use first 10 paragraphs)
  2. Create LinkedIn post (summary + link)
  3. Create email newsletter segment
  4. Create social media graphics (use excerpts)

Use tool like:
- Repurpose.io (automate content repurposing)
- Canva (auto-generate social graphics)
```

---

## Phase 5: Optimization & Iteration

### What to Track Weekly

**Traffic Sources:**
```
Google Analytics → Acquisition → All Traffic → Source/Medium

Track:
- Organic search traffic (SEO working?)
- twitter / social (Twitter driving traffic?)
- producthunt / referral (Product Hunt success?)
- Direct traffic (brand awareness?)

Compare week-over-week growth
```

**Content Performance:**
```
Blog Posts:
- Views per post
- Time on page (>2 min = engaging)
- Bounce rate (<40% = good)
- Signups from post (conversion)

Social Media:
- Engagement rate (likes + comments / followers)
- Click-through rate (clicks / impressions)
- Best performing posts (double down on this content type)
```

**Email Performance:**
```
Welcome sequence:
- Open rate (target: >25%)
- Click rate (target: >5%)
- Conversion rate (target: >3%)

If below target:
- A/B test subject lines
- Shorten email body
- Stronger CTA
```

### Monthly Strategy Adjustments

**Analyze Data:**
```
Question: Which channel drove the most signups?
Answer: Twitter organic (120 signups, CAC $8)

Action: Double down on Twitter
- Increase posting frequency
- Invest in Twitter engagement
- Create more Twitter-specific content

Question: Which channel underperformed?
Answer: Reddit (2 signups, wasted 10 hours)

Action: Stop or reduce Reddit
- Move time to Twitter instead
- Or try different subreddits
- Or adjust approach (more helpful, less promotional)
```

**Content Refresh:**
```
Review blog posts from 3+ months ago:
- Update statistics and data
- Add new sections
- Improve SEO (target new keywords)
- Re-share on social media
```

---

## Tools & Budget Breakdown

### Recommended Tool Stack

**Tier 1: Essential ($100-150/mo)**
- Email: SendGrid $15/mo or Mailchimp $20/mo
- Social Scheduling: Buffer $15/mo
- Analytics: Google Analytics (free) + Plausible $9/mo
- SEO: Google Search Console (free) + Ahrefs Lite $99/mo
- Design: Canva Pro $13/mo

**Tier 2: Growth ($300-500/mo)**
- Add: Zapier $20/mo (automation)
- Add: ConvertKit $50/mo (better email automation)
- Add: Hotjar $32/mo (user behavior tracking)
- Upgrade: Ahrefs Standard $199/mo (better SEO research)

**Tier 3: Scale ($1,000+/mo)**
- Add: HubSpot $800/mo (all-in-one CRM + marketing)
- Add: Mention $99/mo (brand monitoring)
- Add: SEMrush $119/mo (competitive intelligence)
- Hire: Virtual assistant $500/mo (execution help)

### Where Your Time Goes

**15-20 hours/week total:**
- Social media engagement: 5-7 hours/week (1 hour/day)
- Content creation (blog): 4-6 hours/week (2 posts)
- Email management: 2-3 hours/week
- Analytics & optimization: 2-3 hours/week
- Community engagement: 2-4 hours/week

**How to reduce time:**
- Batch content creation (write 4 posts in one day)
- Use Buffer to schedule posts in advance
- Automate email sequences (set and forget)
- Hire VA for social media engagement ($500/mo)

---

## Execution Checklist Generator

After `/market-app` completes, you'll get a personalized checklist in:
`output/marketing-execution-checklist.md`

Example:
```markdown
# Your 90-Day Marketing Execution Checklist

## Week 1: Setup
- [ ] Create Twitter account (@yourproduct)
- [ ] Set up Buffer, load first 21 posts
- [ ] Configure Google Analytics tracking
- [ ] Set up email automation in SendGrid
- [ ] Import welcome sequence (5 emails)

## Week 2-4: Pre-Launch
- [ ] Publish 2 blog posts/week
- [ ] Post 3 tweets/day (automated via Buffer)
- [ ] Engage 15 min/day on Twitter
- [ ] Prep Product Hunt launch
- [ ] Line up 50 supporters

## Week 5: Launch Week
- [ ] Launch on Product Hunt (Tuesday)
- [ ] Social media blitz (announcements on all channels)
- [ ] Monitor and respond to comments all day
- [ ] Email supporters
- [ ] Track signups by source

## Week 6-13: Growth
- [ ] Continue 2 blog posts/week
- [ ] Continue 3 tweets/day
- [ ] Weekly analytics review
- [ ] A/B test email subject lines
- [ ] Optimize based on data
```

---

## When You're Overwhelmed

**Start Small:**
```
Week 1:
- Just publish blog posts
- Just post on Twitter manually (1/day)
- That's it. Don't try to do everything.

Week 2-4:
- Add Buffer for scheduling
- Add email automation
- Still just 2 channels

Month 2+:
- Expand to other channels from your strategy
```

**Get Help:**
- **Freelancer:** Upwork/Fiverr for content writing ($50-200/post)
- **Virtual Assistant:** Social media engagement ($500-1,000/mo)
- **Agency:** Full service marketing ($2,000-10,000/mo)
- **Co-founder:** Someone who loves marketing

---

## FAQ

**Q: Do I have to do everything myself?**
A: No! Start with what you can handle (maybe just blogging + Twitter), then hire help as budget allows.

**Q: Can I automate everything?**
A: Partially. You can automate:
- Email sequences (100% automated)
- Social post scheduling (80% automated, 20% engagement)
- Blog publishing (automated)

You cannot automate:
- Responding to comments (needs human touch)
- Community engagement (authenticity matters)
- Strategic decisions (requires judgment)

**Q: What if I don't have time?**
A: Prioritize:
1. Email automation (set and forget)
2. Blog posts (2/week, batch write)
3. Twitter (15 min/day engagement)
Skip everything else until you have help.

**Q: How long until I see results?**
A: Depends on channel:
- Product Hunt: Immediate (launch day spike)
- Twitter: 1-3 months (audience building)
- SEO: 4-6 months (ranking takes time)
- Email: Immediate (automation starts on signup)

**Q: What if results are bad?**
A: Normal! Iterate:
- Review data monthly
- Double down on what works
- Cut or fix what doesn't
- A/B test everything
- Be patient (marketing takes 3-6 months to see traction)

---

## Next Steps

1. **Complete `/market-app`** - Get your strategy and content
2. **Do one-time setup** - 2-4 hours, create accounts and tools
3. **Start executing** - Follow daily checklist
4. **Review weekly** - Check data, adjust strategy
5. **Be consistent** - Marketing compounds over time

**Remember:** The marketing team gives you the playbook and materials. You execute the plays. Start small, be consistent, iterate based on data.

---

**Ready to execute? Your marketing materials are waiting in `output/`!** 🚀
