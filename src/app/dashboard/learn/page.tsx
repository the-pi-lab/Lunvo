"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isLocalMode } from "@/lib/localMode";

// 30 LinkedIn lessons — fully static, zero API cost
const LESSONS = [
  {
    day: 1,
    title: "Why Your Hook Decides Everything",
    duration: "4 min read",
    tag: "Fundamentals",
    content: `The LinkedIn feed is brutal.

You have exactly 1.5 seconds before someone scrolls past your post.

That's not a metaphor. That's the average scroll speed on mobile.

Your hook — the very first line of your post — is the only thing standing between being read and being ignored.

Here's what most people get wrong:

They spend 80% of their time writing the body of the post and 20% on the hook. It should be the opposite.

**The 3 hook patterns that actually stop the scroll:**

PATTERN 1 — The Specific Number
"I sent 84 cold DMs in January. 3 replied."
Numbers signal specificity. Specificity signals credibility.

PATTERN 2 — The Bold Claim
"Most career advice is designed to keep you average."
Controversy creates curiosity. Don't be aggressive — be honest.

PATTERN 3 — The Negative Constraint
"Stop writing LinkedIn posts about your achievements."
Telling someone to stop doing something they do = instant attention.

**What kills a hook instantly:**
→ Starting with "I am excited to share..."
→ Starting with "In today's world..."
→ Starting with your name or company
→ Starting with context before the hook
→ Starting with "I" as the first word (algorithm and readers both penalize this)

**Today's Practice:**
Take your last LinkedIn post (or any post you were planning). 
Rewrite just the first line using one of the 3 patterns above.
Paste it in the analyzer and see if your Hook score improves.`,
    takeaway:
      "Your hook is worth 50% of your post's success. Write it last, after you know what the post is about.",
    action: "Rewrite a hook",
  },
  {
    day: 2,
    title: "How the LinkedIn Algorithm Actually Works",
    duration: "5 min read",
    tag: "Algorithm",
    content: `LinkedIn's algorithm is not magic. It follows a predictable pattern.

Understanding it means you can write posts that the algorithm actively promotes.

**Phase 1: The First Hour (Most Critical)**
When you publish, LinkedIn shows your post to a small test group — roughly 2-5% of your followers.
It measures one thing: engagement velocity.

Not total likes. Not total views. VELOCITY — how fast engagement comes in.

If people engage quickly → algorithm shows it to more people.
If nobody engages → post dies in the first hour.

**What this means for you:**
→ Post when YOUR audience is online (not generic "best times")
→ Reply to every comment within the first 60 minutes
→ Ask a question that people actually want to answer

**Phase 2: The Secondary Push**
If Phase 1 goes well, LinkedIn pushes the post to:
- People who follow the people who engaged
- People with similar interests to those who engaged
- Your extended network (2nd and 3rd connections)

This is how posts "go viral" on LinkedIn — they pass Phase 2.

**Phase 3: Long Tail**
LinkedIn posts have a much longer lifespan than Twitter/Instagram.
A good post can get engagement for 2-3 weeks.
This is why consistency compounds — each post builds on the last.

**The 3 signals the algorithm rewards most:**
1. Comments (worth 3x more than likes)
2. Shares (worth 5x more than likes)
3. Time spent reading (LinkedIn tracks scroll depth)

**What the algorithm punishes:**
→ External links in the post body (reduces reach by ~40%)
→ Too many hashtags (3+ = spam signal)
→ Posting and immediately editing (resets the algorithm clock)
→ Deleting and reposting (penalized heavily)

**Today's Practice:**
Next time you post, set a timer for 60 minutes.
Reply to every comment that comes in during that hour.
Watch what happens to your reach compared to posts where you didn't reply.`,
    takeaway:
      "The first hour after posting is everything. Be present, reply fast, and never add external links in the post body.",
    action: "Generate a post",
  },
  {
    day: 3,
    title: "The Best Times to Post on LinkedIn",
    duration: "3 min read",
    tag: "Strategy",
    content: `Generic advice says "post Tuesday-Thursday, 9am-12pm."

That advice is for the average LinkedIn user. You're not average.

**The data-backed truth:**

Wednesday 6 PM is statistically the highest-engagement slot.
Why? End of workday. People are winding down. Scrolling LinkedIn.

Tuesday 1 AM has a hidden advantage.
Almost nobody posts at 1 AM. Zero competition. Your post sits at the top of feeds for hours. It catches European morning scrollers when it's fresh.

Thursday 11 PM — same logic as Tuesday 1 AM.

**But here's what matters more than time:**

YOUR audience's online pattern ≠ generic data.

If you're targeting:
→ Founders: early morning (6-8 AM) or late night (10 PM+)
→ Recruiters: Tuesday-Thursday, 8-10 AM
→ Students: Evening (7-9 PM), weekends
→ Freelancers: Anytime — they're always online

**The real winning strategy:**

Post consistently at the SAME time every day.
LinkedIn's algorithm learns your posting pattern.
Your audience learns your posting pattern.
Both reward consistency over perfect timing.

**What to avoid:**
→ Posting Friday afternoon (people mentally checked out)
→ Posting Saturday/Sunday morning (lowest professional traffic)
→ Posting multiple times in one day (LinkedIn limits reach of secondary posts)

**Today's Practice:**
Decide on YOUR posting time based on your target audience.
Set a calendar reminder. Stick to it for 30 days.
Consistency beats perfect timing every time.`,
    takeaway:
      "Wednesday 6 PM is peak. But consistency at any time beats perfect timing inconsistently.",
    action: "Schedule a reminder",
  },
  {
    day: 4,
    title: "What Recruiters Actually Look For on LinkedIn",
    duration: "5 min read",
    tag: "Career",
    content: `Recruiters spend an average of 7 seconds on a LinkedIn profile before deciding to continue or move on.

7 seconds. Not 7 minutes.

Here's exactly what happens in those 7 seconds:

**Second 1-2: Profile photo**
Does this person look professional? Approachable?
A good photo increases profile views by 21x. Not a typo.

**Second 2-4: Headline**
Most people write: "Software Engineer at XYZ Company"
Recruiters are looking for: What can this person DO for us?

Better headline format:
"[What you do] → [Result you create] | [Who you help]"
Example: "Frontend Dev → Building products users love | Open to opportunities"

**Second 4-7: Recent activity**
This is where your posts come in.

Recruiters scroll through your recent posts before your resume.
They're looking for: Do you think? Do you communicate clearly? Are you active in your field?

**What makes recruiters reach out:**
→ You post about real problems you've solved (not just wins)
→ Your posts show how you think, not just what you know
→ You engage with others in your industry
→ Your profile and posts tell a consistent story

**What makes recruiters skip you:**
→ No recent activity (last post 6 months ago = red flag)
→ Only posting job-hunting content ("I am open to work")
→ Posts that are only motivational (shows no expertise)
→ Inconsistent narrative (posts about 10 different topics)

**The 1-post strategy for job seekers:**
Pick ONE thing you know deeply.
Post about it once a week, consistently.
Show your thinking process, not just your conclusions.
In 90 days, you become "the person who knows about X."

**Today's Practice:**
Look at your last 5 LinkedIn posts.
Would a recruiter in your target industry see expertise and clear thinking?
If not — what ONE topic could you own?`,
    takeaway:
      "Recruiters look at your posts before your resume. Post about ONE thing consistently and show your thinking, not just your wins.",
    action: "Generate a post",
  },
  {
    day: 5,
    title: "The Viral Post Structure That Works Every Time",
    duration: "4 min read",
    tag: "Writing",
    content: `Every post that goes viral on LinkedIn follows some version of this structure.

Not because it's a formula. Because it mirrors how humans process information.

**The 5-Part Structure:**

PART 1: HOOK (1 line)
Creates a pattern interrupt. Makes the reader stop.
Everything else depends on this working.

PART 2: TENSION/PROBLEM (2-3 lines)
Expand the hook. What's the problem, conflict, or situation?
This is where you make the reader feel: "Yes, I know this feeling."

PART 3: EVIDENCE/STORY (3-5 lines)
The specific moment, number, or story that proves your point.
Specificity here is everything. Not "I worked hard" — "I worked 14 hours a day for 6 months."

PART 4: LESSON/INSIGHT (2-3 lines)
The takeaway. What did you learn? What should the reader do differently?
Keep it simple. One clear insight is better than five vague ones.

PART 5: CTA (1 line)
A specific question that the reader wants to answer.
Not "What do you think?" — too vague.
"What was YOUR hardest moment in your first year?" — specific, personal, answerable.

**Example of this structure in action:**

HOOK: "84 applications. 2 callbacks. I almost quit."
TENSION: "For 6 months, I applied to every job I could find. Nothing. I thought I was doing everything right."
EVIDENCE: "Then I rewrote my LinkedIn headline on a Tuesday night. By Thursday, I had 3 recruiter messages."
LESSON: "The resume gets you the interview. Your LinkedIn gets you the recruiter. Optimize in that order."
CTA: "What's the ONE thing that finally broke your job search open?"

**Notice what's missing:**
→ No intro ("Hi LinkedIn!")
→ No company mention
→ No humble-bragging
→ No vague advice
→ No paragraph longer than 3 lines

**Today's Practice:**
Take any idea you've been thinking about.
Fit it into the 5-part structure above.
Paste it in the post generator with your topic — then compare.`,
    takeaway:
      "Hook → Tension → Evidence → Lesson → CTA. Every line must earn its place or get cut.",
    action: "Generate a post",
  },
  {
    day: 6,
    title: "The Comment Strategy Nobody Talks About",
    duration: "4 min read",
    tag: "Growth",
    content: `Growing on LinkedIn is not just about what you post.

It's about where you show up.

**The Comment Compound Effect:**

When you leave a thoughtful comment on a high-performing post,
your comment gets seen by everyone who sees that post.

A post with 50,000 impressions = your comment gets 50,000 exposures.
For free. Without posting anything yourself.

**What makes a comment worth reading:**

BAD comment: "Great post! So insightful!" → Invisible. Everyone ignores this.
BAD comment: "I agree!" → Same. No value.
BAD comment: Tagging 5 people → Spam. Penalized.

GOOD comment: Adds a perspective the post didn't cover.
GOOD comment: Shares a contrasting experience.
GOOD comment: Asks a specific follow-up question.
GOOD comment: Shares a related data point or story.

**The 3-line comment formula:**
Line 1: Your specific reaction to their point.
Line 2: Your experience or data that relates.
Line 3: A question or insight that adds to the conversation.

**Example:**
Original post: "Consistency is the key to LinkedIn growth."
Bad comment: "Totally agree! Great advice!"
Good comment: "Consistency matters, but I'd add: consistency of topic matters more than consistency of schedule. I posted every day for 2 months on random topics — zero growth. Switched to posting 3x/week on one topic — grew 2000 followers in 60 days. What's your take on niche consistency?"

**The 10-comment challenge:**
Leave 10 thoughtful comments per week on posts in your niche.
Track your profile views week over week.
Most people see a 40-60% increase in profile views within 30 days.

**Today's Practice:**
Find 3 posts in your niche right now.
Leave one genuine, specific, valuable comment on each.
Not "Great post!" — something that shows you actually read and thought about it.`,
    takeaway:
      "Comments on others' posts are free advertising. One great comment on a viral post can send hundreds of people to your profile.",
    action: "Generate a post",
  },
  {
    day: 7,
    title: "Personal Brand vs Company Brand — Which Wins on LinkedIn?",
    duration: "4 min read",
    tag: "Strategy",
    content: `If you work at a company, you have two choices on LinkedIn:
Post as the company. Or post as yourself.

The data is clear: Personal always wins.

**Why personal brands outperform company pages:**

People follow people. Not logos.
A company post gets an average of 3-5% organic reach.
A personal post from an employee gets 5-10x more reach.

LinkedIn's algorithm was literally designed to favor person-to-person content.
Company pages are at a structural disadvantage.

**The trust equation:**
Company page: "Our product is the best solution for X."
Employee post: "I worked on this feature for 6 months. Here's what I learned building it."

Which one do you believe more?

**What this means for you:**

If you're an employee:
Your personal brand builds the company brand — but it also builds YOU.
Your LinkedIn presence belongs to you, not your employer.
Build it intentionally.

If you're a founder:
Post as a person, not a company.
People back founders, not startups.
Your story = your company's story.

If you're a freelancer:
Your personal brand IS your business.
Every post is a portfolio piece and a sales tool.

**The one rule:**
Even when posting about your company or work —
center the story on YOUR experience, not the company's features.

Not: "Our new product does X."
But: "I spent 3 months building X. Here's what I got completely wrong."

**Today's Practice:**
Look at your last 5 posts.
How many are company-focused vs experience-focused?
Rewrite one company-focused post to center YOUR experience.`,
    takeaway:
      "People follow people. Post as a human with experiences, not as a brand with features.",
    action: "Generate a post",
  },
  {
    day: 8,
    title: "Why Failure Posts Go Viral (And How to Write One)",
    duration: "4 min read",
    tag: "Writing",
    content: `Data from 500,000+ LinkedIn posts shows one consistent pattern:

Failure posts get 1.34x more engagement than success posts.

Not because LinkedIn users enjoy seeing people fail.
Because failure posts feel REAL in a feed full of manufactured success.

**Why failure resonates:**

When you share a win, people think: "Good for them."
When you share a failure, people think: "That happened to me too."

The second reaction drives comments. Comments drive reach.

**The anatomy of a viral failure post:**

1. The specific failure (not vague: not "things got hard")
   "I lost our biggest client — ₹8 lakh/year — in a 10-minute call."

2. The moment of realization
   "I replayed that call in my head for a week."

3. What you actually learned (not obvious advice)
   "The client didn't leave because of quality. They left because I stopped making them feel like a priority."

4. The actionable insight
   "Now I have a rule: every client gets a personal check-in call once a month. Not about the project — about them."

5. The honest CTA
   "What client mistake taught you the most expensive lesson?"

**What to avoid:**
→ "Everything happens for a reason" endings (fake resolution)
→ Failure that resolves too perfectly (feels manufactured)
→ Failures that are humble-brags in disguise ("I turned down a ₹1cr deal and here's why I'm glad")

**The vulnerability test:**
Before posting a failure story, ask: "Am I slightly uncomfortable sharing this?"
If yes → it's probably real enough to resonate.
If no → it's probably not vulnerable enough to matter.

**Today's Practice:**
Think of one genuine failure or mistake from your work/career.
Not catastrophic. Just real.
Write the first line of that story as a hook.
Paste it in the generator and see what comes out.`,
    takeaway:
      "Failure posts get 1.34x more reach because they feel real. Share the specific moment, not the vague lesson.",
    action: "Generate a post",
  },
  {
    day: 9,
    title: "The 150-200 Word Sweet Spot",
    duration: "3 min read",
    tag: "Writing",
    content: `How long should a LinkedIn post be?

The answer from data: 150-200 words for maximum engagement.

Not 50. Not 500. 150-200.

**Why this range works:**

Too short (under 100 words):
LinkedIn doesn't show the "See more" button.
This means no mystery, no reason to click, no engagement hook.
Short posts work ONLY if the hook is extraordinary.

Too long (over 300 words):
Most readers drop off after the first 150 words on mobile.
More words = more chances to lose them.
LinkedIn's algorithm also shows less reach to very long posts.

The 150-200 range:
→ Long enough to trigger "See more" (creates curiosity)
→ Short enough to actually be read completely
→ Short enough to write in under 20 minutes

**The "See more" button is your friend:**

When a post is long enough, LinkedIn shows "See more" after 3 lines.
This is actually good — it creates a mini-cliffhanger.
If your hook is strong, people click to read more.
Every click signals to the algorithm: "People are interested."

**The editing rule:**
Write your first draft with no word limit.
Then cut everything that isn't earning its place.
If a sentence doesn't add to the story, cut it.
If a paragraph repeats something already said, cut it.

Target: Read your post out loud. If you lose interest anywhere — cut that part.

**Today's Practice:**
Take your next post idea.
Write it, then count the words.
If it's over 200, cut until it's 150-180.
If it's under 100, you need more story.`,
    takeaway:
      "150-200 words is the sweet spot. Enough to trigger 'See more', short enough to actually be read.",
    action: "Analyze a post",
  },
  {
    day: 10,
    title: "The Hashtag Truth Nobody Wants to Admit",
    duration: "3 min read",
    tag: "Algorithm",
    content: `LinkedIn influencers love recommending 5-10 hashtags per post.

The data says: 2 hashtags maximum. More than that hurts you.

**Why hashtags are misunderstood:**

On Instagram, hashtags are discovery tools. You find new content through them.
On LinkedIn, hashtag-based discovery is minimal. LinkedIn is a people algorithm, not a content algorithm.

Hashtags on LinkedIn serve ONE purpose:
Categorizing your content so LinkedIn knows which users to show it to.
That's it. They don't bring you new followers who don't know you.

**The math:**
1-2 hashtags → LinkedIn categorizes you clearly → appropriate audience
5-10 hashtags → LinkedIn gets confused about categorization → lower reach
15+ hashtags → Spam signal → reach penalty

**Which hashtags to use:**

Good: Specific niche hashtag with active community
  #ProductManagement (1.2M followers) — specific, real audience
  #IndianStartup (active, specific)

Bad: Too generic
  #Success (meaningless, no targeting)
  #Motivation (used by everyone, seen by no one)
  #LinkedIn (meta and useless)

Bad: Too small
  #MyCustomHashtag (no followers, no reach extension)

**The only hashtag strategy you need:**
→ 1 niche-specific hashtag (your industry/topic)
→ 1 audience-specific hashtag (who you're writing for)
→ Put them at the END of the post, never in the body

**Today's Practice:**
Find your 2 permanent hashtags.
Use them on every post. Consistently.
Track if posts with these 2 tags get more reach than posts without.`,
    takeaway: "2 hashtags maximum. Put them at the end. Use niche-specific, not generic ones.",
    action: "Generate a post",
  },
  {
    day: 11,
    title: "Building Your Content Pillars",
    duration: "5 min read",
    tag: "Strategy",
    content: `The biggest mistake LinkedIn creators make: posting about everything.

The biggest win: posting about ONE thing until you own it.

**What is a content pillar?**

A content pillar is a topic you return to again and again.
It's the thing people associate with YOUR name on LinkedIn.

When someone thinks "LinkedIn growth" → they think of specific creators.
When someone thinks "no-code tools" → they think of specific creators.
When someone thinks "Indian startup ecosystem" → specific creators.

You want to be the first person that comes to mind for YOUR topic.

**How to choose your pillars:**

The intersection of 3 things:
1. What you know deeply (expertise)
2. What your target audience needs (demand)
3. What you genuinely enjoy thinking about (sustainability)

Wrong approach: "I'll post about AI, design, marketing, and productivity."
Right approach: "I'll post about how designers can use AI tools to work faster."

**The 3-pillar structure (if you want variety):**

Primary pillar (60% of posts): Your main expertise topic
Secondary pillar (30% of posts): A related topic that complements the primary
Personal pillar (10% of posts): Your story, journey, mistakes, opinions

Example for a UX Designer:
Primary: UX/Product design insights (60%)
Secondary: Career growth for designers (30%)
Personal: My journey building THE Π LAB (10%)

**Why this works:**
LinkedIn's algorithm learns what you post about.
Your audience learns what to expect from you.
Both reward consistency within a niche.

**Today's Practice:**
Write down: What is ONE topic I know more about than most people I know?
That's your primary pillar.
Commit to it for 90 days. No exceptions.`,
    takeaway:
      "Pick ONE topic and own it for 90 days. You can't be known for everything. Be known for something.",
    action: "Generate a post",
  },
  {
    day: 12,
    title: "The DM Strategy for Turning Followers into Clients",
    duration: "4 min read",
    tag: "Growth",
    content: `Most LinkedIn DMs are awful.

"Hi [Name], I saw your profile and I think we could collaborate..."
Delete. Immediately.

Here's how to send DMs that actually get replies.

**The rule: Give before you ask.**

Before sending any DM with an agenda, give something of value with no expectation.

Step 1: Leave a genuinely thoughtful comment on their post.
Step 2: Wait. Don't DM immediately.
Step 3: After they've seen you engage authentically — then DM.

**The 3-sentence DM formula:**

Sentence 1: Reference something SPECIFIC from their content.
(Not "I love your posts" — too vague. "Your post about firing your first client resonated because...")

Sentence 2: Share a relevant experience or insight.
(Build connection. Not ask for anything.)

Sentence 3: ONE clear ask — a conversation, not a sale.
("Would you be open to a 15-minute call about X?" — specific, low-commitment)

**What to never do:**

→ Send a pitch deck in the first message
→ Copy-paste the same message to 100 people (they can tell)
→ Ask for a "quick chat" without saying what it's about
→ Connect and immediately pitch (the LinkedIn equivalent of a handshake and then a sales brochure)

**The best DMs come from your content:**

When someone comments on your post with genuine engagement — DM them.
"Hey [Name], your comment on my post about X really stood out. Would love to continue that conversation."

This works because THEY initiated. You're following their signal.

**Today's Practice:**
Find 3 people who engaged with your posts this week.
Send them a thoughtful follow-up DM using the formula above.
No pitch. Just a genuine continuation of the conversation.`,
    takeaway:
      "DMs work when you've given first. Comment authentically, then DM. Reference specifics, not generics.",
    action: "Generate a post",
  },
  {
    day: 13,
    title: "Repurposing — Turn 1 Post into 10",
    duration: "4 min read",
    tag: "Productivity",
    content: `Creating content from scratch every day is exhausting.

The solution: repurposing. One core idea → 10 different posts.

**Why repurposing works:**

Most of your followers didn't see your original post.
LinkedIn reach on a typical post = 10-15% of your followers.
That means 85-90% NEVER saw it.

Repurposing is not repetition. It's re-distribution.

**The 10 repurpose formats from 1 idea:**

Original: A story about failing your first client pitch.

1. The Story Post: Full narrative with emotion (your original)
2. The List Post: "5 things I learned from failing my first pitch"
3. The Contrarian Take: "Why failing your first pitch is actually good news"
4. The Question Post: "What's the biggest mistake you made with your first client?"
5. The Before/After: "Me before that pitch: [X]. Me after: [Y]."
6. The Single Insight: Just the ONE best lesson from the story
7. The Data Point: "Studies show 70% of freelancers lose their first client. Here's why."
8. The Myth-Busting: "The myth: First impressions with clients are about skills. The truth: They're about expectations."
9. The How-To: "How to recover from a client pitch failure in 5 steps"
10. The Anniversary Post: "One year ago I failed my first pitch. Here's what's different now."

**The repurposing calendar:**
Week 1: Original post (the full story)
Week 3: List version (5 lessons)
Week 6: Contrarian take
Week 10: Single best insight
Week 16: Anniversary/reflection

Same idea. Different format. Different timing. Different audience activation.

**Today's Practice:**
Look at your best-performing post ever.
Pick 3 of the 10 formats above.
Outline what each repurposed post would look like.
Schedule them for the coming weeks.`,
    takeaway:
      "1 great idea = 10 different posts. Most followers never saw the original. Repurposing is not repetition.",
    action: "Generate a post",
  },
  {
    day: 14,
    title: "Week 2 Review — Your LinkedIn Audit",
    duration: "5 min read",
    tag: "Review",
    content: `Two weeks in. Time to audit what's working.

Don't skip this. The creators who grow are the ones who review, not just create.

**Your 14-day audit checklist:**

PROFILE AUDIT:

□ Profile photo: Professional but approachable?
□ Banner: Does it communicate what you do?
□ Headline: Does it say what you DO and for WHOM — not just your job title?
□ About section: Does it tell your story in first person?
□ Featured section: Is your best work/post here?
□ Experience: Does each role show impact (numbers), not just responsibilities?

CONTENT AUDIT:

□ Last 5 posts — do they all have a clear hook?
□ Do they follow a consistent topic (your content pillar)?
□ Are they 150-200 words?
□ Do they all end with a specific question?
□ Which got the most engagement? What was different about it?

ENGAGEMENT AUDIT:

□ Have you replied to every comment you received?
□ Have you left thoughtful comments on 10+ posts this week?
□ Have you connected with at least 5 people in your niche?

LEARNING AUDIT:

□ What's the one LinkedIn insight that surprised you this week?
□ What are you going to do differently in week 3?

**The honest question:**

If someone discovered your LinkedIn today for the first time,
would they immediately understand what you're about?
Would they follow you?
Would they reach out?

If the answer to any of these is "probably not" —
that's your priority for week 3.

**Today's Practice:**
Go through each item in the audit above.
Write down your 3 biggest gaps.
Those become your focus for the next 7 days.`,
    takeaway: "Review beats create. Know what's working before you create more content.",
    action: "Analyze a post",
  },
  {
    day: 15,
    title: "The Storytelling Formula That Creates Followers",
    duration: "5 min read",
    tag: "Writing",
    content: `Facts tell. Stories sell. On LinkedIn, stories create followers.

Here's the exact storytelling formula used by LinkedIn's top creators.

**The STSC Framework:**

S — Scene (Drop them into a specific moment)
T — Tension (What's at stake? What's the problem?)
S — Shift (The moment everything changed)
C — Consequence (What happened as a result?)

**Applied example:**

SCENE: "It was 2 AM. My co-founder and I were staring at our dashboard. ₹0 in revenue. Day 89."

TENSION: "We had promised investors a product by day 90. The product wasn't working. Neither of us had slept properly in a week."

SHIFT: "At 3 AM, a notification. Someone had paid. ₹499. A stranger found us through LinkedIn."

CONSEQUENCE: "That ₹499 wasn't the revenue. It was proof. We kept going. 8 months later, we had 500 paying users."

**Why this formula works:**

The brain is wired for narrative. We process stories 22x faster than facts.
When you drop readers into a scene, they experience it — not just read it.
When they experience it, they remember it.
When they remember it, they come back for more.

**The common storytelling mistakes:**

Starting with context instead of scene:
WRONG: "I've been building my startup for 3 years and I want to share something important."
RIGHT: "3 AM. Empty office. ₹0 in the bank."

Resolving too quickly:
Keep the tension alive longer than feels comfortable.
The longer the tension, the bigger the payoff when it resolves.

Making yourself the hero:
The INSIGHT should be the hero.
You're just the person who went through the experience.

**Today's Practice:**
Think of a real moment in your life/career that had genuine tension.
Write just the first 3 lines using the STSC framework.
Share it through the post generator and see how it develops.`,
    takeaway:
      "Scene → Tension → Shift → Consequence. Drop readers into the moment, not into context.",
    action: "Generate a post",
  },
  {
    day: 16,
    title: "Growing from 0 to Your First 500 Followers",
    duration: "5 min read",
    tag: "Growth",
    content: `The first 500 followers is the hardest part of LinkedIn growth.

Here's the exact playbook.

**Why 0-500 is different:**

Below 500 followers, your posts have almost no organic reach.
LinkedIn is conservative about showing content from small accounts to their wider network.
This means growth at 0-500 must be ACTIVE, not passive.

**The 30-day active growth plan:**

WEEK 1-2: Foundation
→ Optimize your profile completely (use yesterday's audit)
→ Connect with 10 people per day in your niche (LinkedIn allows ~100/week)
→ Send personalized connection notes (not the default "I'd like to connect")
→ Post every day, even if it gets 2 likes

WEEK 3-4: Activation
→ Comment on 5-10 posts per day from accounts in your niche
→ Engage with EVERY comment on your posts, same day
→ Tag (sparingly) 1-2 people who would genuinely find the post valuable
→ Share insights from others' content (with credit) — this gets you noticed

**The connection request formula:**
"Hey [Name] — saw your post about [specific topic]. Your point about [specific detail] is something I've been thinking about too. Would love to have you in my network."

2 sentences. Specific. No pitch. 60-70% acceptance rate.

**The fastest path to 500:**

Find 5 LinkedIn creators in your niche with 5,000-50,000 followers.
Comment on their EVERY post for 30 days.
Not "Great post!" — actual insights.
Their audience will see your name repeatedly.
Many will check your profile. Some will follow.

**What not to do:**
→ Buy followers (LinkedIn detects and penalizes)
→ Follow/unfollow strategies (ruins your credibility)
→ Post without engaging on others' content
→ Give up before day 30

**Today's Practice:**
Find 5 creators in your niche right now.
Follow them. Comment on their most recent post.
Set a reminder to do this every day for the next 30 days.`,
    takeaway:
      "0-500 is an active game. Comment strategically on bigger accounts daily. Post consistently even when it gets no reach.",
    action: "Generate a post",
  },
  {
    day: 17,
    title: "LinkedIn Carousel Posts — When and How",
    duration: "4 min read",
    tag: "Content Types",
    content: `Carousel posts (document posts) get 3x more reach than regular text posts.

But most carousels are terrible. Here's how to make them work.

**Why carousels outperform text:**

LinkedIn counts each slide view as an engagement signal.
A 10-slide carousel where someone reads 5 slides = 5 engagement events.
This tells the algorithm: "This content is valuable. Show it to more people."

**When to use carousels:**

✓ Teaching a framework (5-step process, 3-part system)
✓ Breaking down a complex idea into visual steps
✓ Before/after comparisons
✓ "X things I learned" lists where each thing needs context
✓ Portfolio or case study presentation

When NOT to use carousels:
✗ A story that flows naturally as text
✗ A single insight (don't make it 10 slides)
✗ Just to get the algorithm boost with bad content

**The 8-slide structure that works:**

Slide 1: Hook (same rules as text post hook — make them swipe)
Slide 2: The problem/context (why does this matter?)
Slide 3-6: The content (one idea per slide, max 30 words per slide)
Slide 7: The key takeaway (the single most important thing)
Slide 8: CTA (follow for more + specific question)

**Design rules for carousels:**
→ Consistent color scheme (2-3 colors max)
→ Large text (readable on mobile without zooming)
→ One idea per slide (not paragraphs)
→ Visual hierarchy (headline large, body small)
→ Your name/logo on every slide (people screenshot and share)

**The caption still matters:**
Don't just write "New carousel! Swipe →"
Write a mini text post as the caption.
If the caption hooks them, they'll swipe.

**Today's Practice:**
Think of one framework or process you know well.
Outline it as an 8-slide carousel using the structure above.
Note it for when image/carousel generation launches in this tool.`,
    takeaway:
      "Carousels get 3x reach because slide views count as engagement signals. One idea per slide, hook on slide 1.",
    action: "Generate a post",
  },
  {
    day: 18,
    title: "How to Write About Your Job Without Being Boring",
    duration: "4 min read",
    tag: "Writing",
    content: `Most people's LinkedIn is a job description.

"I work in marketing at XYZ. I help brands grow their digital presence."

Nobody cares. Here's why — and how to fix it.

**The problem with job-description content:**

Job descriptions describe ROLES. People connect with EXPERIENCES.

"I manage a team of 10 engineers" → Role
"Last Tuesday, one of my engineers came to me ready to quit. Here's what happened." → Experience

The first describes a job. The second starts a story.

**The 5 ways to make your work interesting:**

1. The Unexpected Moment
Something surprised you at work this week. Share it.
"I've been in product for 7 years. This week a user did something with our product I never imagined."

2. The Uncomfortable Decision
A choice you had to make that wasn't easy.
"I had to tell a client their strategy was wrong. They were paying us ₹3 lakh/month."

3. The Counter-Intuitive Lesson
Something your industry believes that you now question.
"Everyone in UX says 'always follow user research.' I stopped. Here's what happened."

4. The Behind-the-Scenes
What actually happens in your day that people outside your field don't know.
"What a product manager actually does on a Monday: (it's not what they put in the job description)"

5. The Evolution
How your thinking has changed over time.
"What I believed about [topic] in 2022 vs what I believe now."

**The test:**
Before posting, ask: "Does this make someone outside my industry curious?"
If yes → post it.
If no → find the angle that would.

**Today's Practice:**
Think about something that happened at work this week.
Not a win. Not a milestone. Just something real.
Write the first line using one of the 5 formats above.`,
    takeaway:
      "Don't describe your role. Share your experiences. Roles are boring. Experiences are interesting.",
    action: "Generate a post",
  },
  {
    day: 19,
    title: "The Unfollow Problem — Why People Stop Reading You",
    duration: "4 min read",
    tag: "Retention",
    content: `Getting followers is only half the equation.

Keeping them is harder. And more important.

**Why people unfollow or mute you:**

Reason 1: You changed topics without warning.
They followed you for startup content. Now you're posting motivational quotes.
Their expectation ≠ what you deliver.

Reason 2: Your quality became inconsistent.
You had 5 great posts in a row. Then 10 average ones.
They lost trust in your signal.

Reason 3: You got promotional.
"Excited to share my new course / newsletter / product!"
Once a month: okay. Once a week: annoying.

Reason 4: You disappeared and came back.
3 months of silence, then suddenly active again.
The algorithm forgot you. So did your audience.

Reason 5: You only posted, never engaged.
You broadcast but never have conversations.
LinkedIn is social media — social is the key word.

**How to keep the followers you earn:**

→ Stay on your content pillar (same 1-2 topics consistently)
→ Maintain quality over quantity (1 great post > 5 average posts)
→ Mention new products/services max once a month
→ Reply to every comment, even months-old posts
→ Be present: comment on others' content weekly

**The signal test:**
Would your followers feel disappointed if they missed your post?
If yes → you're delivering real value. Keep going.
If no → you're posting for posting's sake. Stop and refocus.

**Today's Practice:**
Look at your follower count this week vs last week.
Is it growing, flat, or shrinking?
If flat or shrinking: which of the 5 reasons above might apply to you?`,
    takeaway:
      "Losing followers is a signal problem. Stay on topic, maintain quality, and engage — don't just broadcast.",
    action: "Analyze a post",
  },
  {
    day: 20,
    title: "LinkedIn for Students — The Unfair Advantage",
    duration: "5 min read",
    tag: "Career",
    content: `If you're a student and you're active on LinkedIn — you have an unfair advantage.

Here's why: Almost no students use LinkedIn effectively.

This means the competition is near-zero.

**The student advantage:**

You have access to things working professionals don't:
→ Fresh perspective (you see the industry without bias)
→ Time (more of it than you think)
→ Relatability (thousands of students feel exactly what you feel)
→ Growth trajectory (you're improving fast — document it)

**What students should post about:**

1. Learning in public
"I'm studying X. This week I learned Y. Here's what surprised me."
Learning posts are underrated. Industry professionals LOVE seeing students engage seriously.

2. Project breakdowns
"I built X in 30 days using Y. Here's what I got completely wrong."
Building in public attracts recruiters and collaborators.

3. Industry observations
"I've read 20 papers on X this month. Here's what academics don't tell you."
Demonstrating depth of thought = you stand out.

4. Honest job search journey
"Applied to 30 companies. 2 callbacks. Here's what I'm changing."
This content gets massive engagement because EVERYONE can relate.

5. Skill milestones
Not "I completed a course" (nobody cares).
But: "I spent 60 hours learning X. Here's what I can actually do with it."

**What NOT to post:**
→ "Excited to start my internship at XYZ! #grateful #blessed"
→ Motivational quotes unrelated to your field
→ Resharing others' content without your own commentary
→ "Looking for opportunities" posts without showing what you offer

**The 90-day student challenge:**
Post once a week about what you're learning or building.
Comment on 10 industry posts per week.
In 90 days, you'll have a LinkedIn presence most graduates never build.

**Today's Practice:**
If you're a student: What are you currently learning or building?
Write the first line of a post about it.
If you're not a student: What do you know now that you wish you'd known as a student?
That's a post.`,
    takeaway:
      "Students who post consistently have near-zero competition on LinkedIn. Document your learning journey before it's over.",
    action: "Generate a post",
  },
  {
    day: 21,
    title: "The 3-Week Review — What's Changed?",
    duration: "4 min read",
    tag: "Review",
    content: `Three weeks. Time for a real honest review.

Not a motivational "you're doing great!" — a real assessment.

**The questions that matter:**

CONSISTENCY:
→ Have you posted at least 10 times in the last 21 days?
→ Have you maintained your content pillar?
→ Have you been commenting on others' content daily?

If no to any of these: This is your primary focus before anything else.

QUALITY:
→ Has your Hook score in the analyzer improved since week 1?
→ Are your posts getting at least some comments (not just likes)?
→ Do you read your own posts and feel proud to share them?

GROWTH:
→ Is your follower count growing week over week?
→ Are people who don't know you engaging with your content?
→ Have you received any DMs or profile views from strangers?

**The honest truth about 3 weeks:**

3 weeks is too short to see dramatic growth.
But it's long enough to see directional signals.

If you've been consistent and your engagement is trending up — keep going.
If you've been consistent and engagement is flat — it's a content quality issue.
If you haven't been consistent — that's your answer.

**What separates those who grow from those who quit:**

It's not talent. It's the ability to stay consistent after the initial excitement fades.

The excitement of starting something new fades around... week 3.

If you're still here — you're in the top 20% already.

**Today's Practice:**
Write down 3 honest answers:
1. What has improved in the last 3 weeks?
2. What hasn't improved?
3. What is the ONE thing I will change in week 4?

Then generate a post about your 3-week journey. Authenticity gets engagement.`,
    takeaway:
      "3 weeks shows direction, not destination. If engagement trends up, keep going. If flat, it's a quality issue.",
    action: "Generate a post",
  },
  {
    day: 22,
    title: "The CTA That Actually Gets Comments",
    duration: "3 min read",
    tag: "Writing",
    content: `"What do you think?"

This is the LinkedIn CTA equivalent of ordering "something" at a restaurant.

Too vague. No direction. Gets ignored.

**Why CTA matters so much:**

Comments are worth 3x more than likes to the LinkedIn algorithm.
A post with 50 comments gets dramatically more reach than a post with 50 likes.
The CTA is directly responsible for whether people comment or scroll.

**The CTA hierarchy (worst to best):**

TERRIBLE:
"What do you think?"
"Drop your thoughts below."
"Follow for more."
"Like and share if you agree."

OKAY:
"Has this happened to you?"
"Agree or disagree?"
"What would you add?"

GOOD:
"What's your experience with [specific thing from post]?"
"What would you have done differently in that situation?"

GREAT:
"What's the ONE thing you wish you knew before [specific thing in post]?"
"Reply with your number: how many [specific metric] before your first [specific outcome]?"
"Have you ever done [exact thing from post]? What happened?"

**What makes a great CTA:**

1. It's answerable with a specific response (not just "yes/no")
2. It's personal (they can answer from their own experience)
3. It's related to the post (not a random question at the end)
4. It's low-stakes (they don't feel judged for answering)

**The curiosity CTA:**
"One thing I didn't mention in this post: [tease a detail].
Ask me about it in the comments."

This works because you've created a specific reason to comment.

**Today's Practice:**
Take your last 3 posts.
Rewrite the CTA of each using the "GREAT" format.
Save these rewrites — use them in future posts.`,
    takeaway:
      "Great CTAs are specific, personal, and answerable. 'What do you think?' is not a CTA — it's a shrug.",
    action: "Analyze a post",
  },
  {
    day: 23,
    title: "Why You Should Never Delete a Post",
    duration: "3 min read",
    tag: "Algorithm",
    content: `You post. It gets 3 likes. You feel embarrassed. You delete it.

Stop. This is one of the most common LinkedIn mistakes.

**Why deleting hurts you:**

When you publish a post, LinkedIn's algorithm starts building a history for it.
Even a "low performing" post gets indexed.
Deleting that post:
→ Removes all engagement history
→ Signals to the algorithm that something was wrong with the content
→ Can temporarily reduce reach on your NEXT post (algorithm gets cautious)
→ Permanently destroys any SEO value it was building

**The math of "low performing" posts:**

A post that got 3 likes and 100 views seems like a failure.
But: 100 people saw your name and profile.
Some of them visited your profile.
Some of them connected.
Some of them will see your NEXT post.

LinkedIn compounds. Every post builds on the last.
Deleting breaks the chain.

**What to do instead of deleting:**

If the post got low engagement → analyze why and apply to the next post.
If you made a factual error → edit the post with a correction note.
If you posted something unprofessional → edit, don't delete.
If you're embarrassed by it → learn from it, move on.

**The one exception:**

If you posted something genuinely harmful, offensive, or that could cause real damage to someone — delete immediately. Ethics > algorithm.

Otherwise: let it stand.

**The mental shift:**

Stop thinking of each post as a pass/fail test.
Think of each post as a deposit.
Some deposits are small. Some are large.
But deleting is withdrawing from an account that's trying to grow.

**Today's Practice:**
Go back and look at your "failed" posts.
What do they have in common?
What did the higher-performing posts do differently?
Write down the 1 pattern you notice.`,
    takeaway:
      "Every post is a compound. Deleting breaks the chain. Even low-performing posts build your presence.",
    action: "Analyze a post",
  },
  {
    day: 24,
    title: "The Controversial Post — How to Be Bold Without Being Offensive",
    duration: "4 min read",
    tag: "Writing",
    content: `Controversy drives engagement on LinkedIn.

But there's a fine line between bold and offensive.

Here's how to walk it.

**Why controversy works:**

When you make a bold claim, people feel compelled to respond.
Either to agree ("finally someone said it")
Or to disagree ("this is wrong, and here's why")
Both responses = comments = reach.

Neutral content is the real risk. It generates neither agreement nor disagreement.
It disappears without a trace.

**The types of controversy that work on LinkedIn:**

TYPE 1 — Industry myth-busting
"Most [industry] advice about [X] is wrong. Here's the data."
Safe, intellectual, invites discussion.

TYPE 2 — Contrarian experience
"Everyone told me to do X. I did the opposite. Here's what happened."
Your experience vs conventional wisdom.

TYPE 3 — Honest uncomfortable truth
"Something nobody in [industry] talks about: [real problem]."
Naming the elephant in the room.

TYPE 4 — Opinion on a trend
"Hot take: [trending thing] is overhyped. Here's why."
Works if you have a genuine reasoned position.

**What makes controversy backfire:**

→ Attacking specific people or companies by name
→ Taking political/religious positions (divides audience permanently)
→ Being contrarian without evidence or reasoning
→ Controversy for shock value with no substance underneath
→ Punching down (criticizing people with less power/platform than you)

**The test: Would you say this in a room full of people in your industry?**
If yes → safe to post.
If no → reconsider.

**Today's Practice:**
What's ONE thing you genuinely believe about your industry that most people don't say publicly?
That's your controversial post.
Write it using the "Industry myth-busting" or "Honest uncomfortable truth" format.`,
    takeaway:
      "Bold posts outperform neutral posts. Controversy = discussion. But attack ideas, not people.",
    action: "Generate a post",
  },
  {
    day: 25,
    title: "The LinkedIn Profile Audit — Part 2",
    duration: "5 min read",
    tag: "Profile",
    content: `You audited your profile in week 2.

Let's go deeper on the parts that matter most.

**YOUR HEADLINE — The most underused real estate on LinkedIn:**

Most headlines: "Software Engineer at Acme Corp"
This tells me your job title. Nothing else.

Better formula: [What you do] | [Who you help] | [Optional: Result or differentiator]

Examples:
"UX Designer | Helping SaaS teams reduce churn through better onboarding"
"Frontend Dev | Building fast, accessible products for early-stage startups"
"Marketing at Razorpay | Writing about growth, product, and Indian fintech"

Your headline appears next to your name EVERYWHERE on LinkedIn.
Every comment you leave. Every post. Every DM.
It's your 24/7 ad. Make it work for you.

**YOUR ABOUT SECTION — Tell a story, not a resume:**

Most About sections are a third-person biography.
"John is a seasoned professional with 10 years of experience..."

Nobody reads this. It's a press release for yourself.

Write in first person. Write like you're talking to one person.
"If you're building something and struggling with X — this is for you."

Structure that works:
Para 1: What you do and who you help (1-2 sentences)
Para 2: Your story — what brought you here (2-3 sentences)
Para 3: What you believe about your field (1-2 sentences)
Para 4: What people can expect if they follow you (1-2 sentences)
Final line: How to reach you.

**YOUR FEATURED SECTION — Curate, don't dump:**

Feature your 3 best pieces of content.
Not your most recent. Your BEST.
This is the first thing someone sees when they visit your profile.

Rotate it every 2-3 months as you create better content.

**YOUR EXPERIENCE — Results, not responsibilities:**

Wrong: "Responsible for managing marketing campaigns."
Right: "Grew email list from 2,000 to 15,000 subscribers in 6 months through content strategy."

Numbers. Results. Impact.
If you can't remember the numbers — estimate. "Roughly 3x" is better than nothing.

**Today's Practice:**
Rewrite your headline using the formula above.
Then rewrite the first paragraph of your About section in first person.
These two changes alone can significantly increase profile view-to-connection rate.`,
    takeaway:
      "Your headline is your 24/7 ad. Make it say what you do and who you help — not just your job title.",
    action: "Analyze a post",
  },
  {
    day: 26,
    title: "Content Batching — Write a Week of Posts in 2 Hours",
    duration: "4 min read",
    tag: "Productivity",
    content: `The biggest reason LinkedIn creators quit: "I don't have time every day."

The solution: content batching.

Write all your posts for the week in one 2-hour session.
Post daily from the batch.

**Why batching works:**

Context switching is expensive. Moving from "work mode" to "writing mode" takes 20+ minutes.
If you write one post per day, you pay that switching cost 7 times per week.
If you batch on Sunday, you pay it once.

**The 2-hour batching session:**

Hour 1 — Ideation (30 min) + Drafting (30 min)
→ List 5-7 post ideas (don't filter yet)
→ Pick the best 5
→ Write a rough first draft of each (don't edit yet)

Hour 2 — Editing (45 min) + Scheduling (15 min)
→ Edit each post: cut fluff, sharpen hook, strengthen CTA
→ Schedule or queue them for the week

**The idea generation system:**

Keep a running note (phone, Notion, anywhere) called "Post Ideas."
Add to it whenever something interesting happens:
→ Surprising thing you learned this week
→ Mistake you made and what you learned
→ Question someone asked you that made you think
→ Industry news you have a take on
→ Something you believed that turned out to be wrong

By batching day, you should have 10-15 ideas waiting.
You never start from zero.

**Tools for batching:**
→ LinkedIn's native scheduler (built-in, free)
→ Buffer (free tier)
→ This tool's future scheduler feature

**The batching mindset:**

You're not "writing LinkedIn posts." You're having creative sessions.
Creative sessions benefit from focus and flow — not daily interruptions.

**Today's Practice:**
Set a 2-hour block this weekend for content batching.
Before that session, add to your "Post Ideas" note every time something interesting happens.
Come to the session with ideas, not a blank page.`,
    takeaway:
      "Batch write all posts in one 2-hour session per week. Context switching kills consistency.",
    action: "Generate a post",
  },
  {
    day: 27,
    title: "Analytics — What to Track and What to Ignore",
    duration: "4 min read",
    tag: "Strategy",
    content: `LinkedIn gives you a lot of numbers.

Most of them don't matter. Here's what to track and what to ignore.

**IGNORE these vanity metrics:**

Impressions: How many times your post appeared in a feed.
This number is inflated and doesn't tell you about actual reading.

Reactions (total): A heart and a like are the same thing.
Chasing total reactions leads to feel-good content, not strategic content.

Connection count: After 500, it's a vanity number.
500 engaged followers > 5000 passive connections.

**TRACK these signal metrics:**

Comment-to-impression ratio:
Comments ÷ Impressions = real engagement rate.
Above 0.5% = strong. Industry average is 0.1-0.2%.

Follower growth rate (weekly):
Are you gaining followers week over week?
Flat for 4+ weeks = content strategy needs a change.

Profile visits from posts:
After each post, check how many people visited your profile.
High post views but low profile visits = hook works, body doesn't.
Low post views = hook problem.

DMs and connection requests:
The ultimate signal. Someone was moved enough to reach out.
Track which posts generate DMs.

**The weekly tracking habit (5 minutes):**

Every Monday, log these 4 numbers:
1. Follower count
2. Total comments this week
3. Profile visits this week
4. Any DMs received

That's it. 4 numbers. 5 minutes.
After 8 weeks, you'll see clear patterns about what content works for YOUR audience.

**Today's Practice:**
Open your LinkedIn analytics right now.
Write down your current follower count, total post impressions this week, and comment count.
This is your baseline.
Check again next Monday.`,
    takeaway:
      "Track comments, follower growth, and profile visits. Ignore impressions and total reactions.",
    action: "Analyze a post",
  },
  {
    day: 28,
    title: "The Founder's LinkedIn Playbook",
    duration: "5 min read",
    tag: "Career",
    content: `If you're building something — LinkedIn is your distribution channel.

Here's the exact playbook for founders.

**Why LinkedIn matters more for founders than anyone else:**

Your early customers are on LinkedIn.
Your future employees are on LinkedIn.
Your investors are on LinkedIn.
Your press contacts are on LinkedIn.

One viral post can bring customers, candidates, and investors simultaneously.
No other platform offers this.

**The founder content mix:**

40% — Building in public
"Here's what we shipped this week. Here's what broke. Here's what surprised us."
People love watching something get built. It's compelling.

30% — Hard-won lessons
"We made this mistake. Here's what we learned. Here's how we fixed it."
Credibility through vulnerability.

20% — Industry insights
"Here's what I'm seeing in [market]. Here's my take on [trend]."
Positions you as a thought leader in your space.

10% — Company updates (sparse)
"We hit X milestone."
Once a month maximum. Otherwise it's promotional, not valuable.

**The build-in-public framework:**

Every week, share ONE of:
→ A feature you shipped and why
→ A user insight that surprised you
→ A mistake you made and what you changed
→ A number (revenue, users, NPS) with context
→ A decision you're wrestling with (ask for opinions)

**Why founders avoid this:**

"I don't want competitors to see our strategy."
Reality: Your execution matters infinitely more than your strategy.
Your competitors knowing your plan won't stop you if you execute better.

"I don't have anything interesting to share."
Reality: The mundane details of building fascinate people who haven't done it.
What feels boring to you is fascinating to your audience.

**Today's Practice:**
What's the most interesting thing that happened in your work this week?
Write the first draft of a post about it using the building-in-public framework.
Share it before it feels "ready."`,
    takeaway:
      "Build in public. Share the mistakes, surprises, and decisions — not just the wins. That's what builds a founder audience.",
    action: "Generate a post",
  },
  {
    day: 29,
    title: "The Long Game — LinkedIn in 6 Months",
    duration: "4 min read",
    tag: "Strategy",
    content: `Most people quit LinkedIn after 4-6 weeks.

The creators who stick to 6 months see results that compound exponentially.

Here's what 6 months of consistent LinkedIn looks like:

**Month 1-2: The Grind**
Posts get low engagement. Maybe 5-10 likes.
You feel like you're talking to nobody.
This is normal. This is where everyone quits.
Push through.

**Month 3: The Traction**
A post breaks through. Gets 50+ likes or 20+ comments.
You understand WHY it worked.
You can replicate it.
Follower growth accelerates.

**Month 4-5: The Compounding**
Each post builds on the last.
Your audience knows what to expect from you.
Algorithm starts trusting you.
Inbound opportunities begin (DMs, collaborations, recruiter reach-outs).

**Month 6: The Flywheel**
People tag you in conversations.
Others share your posts.
Your content finds audiences you never reached before.
You have an asset — a real audience — that belongs to you.

**What the 6-month creator has:**
→ 50-500+ genuine followers in their niche
→ A content system that takes 2 hours/week
→ Inbound opportunities they don't have to chase
→ A professional reputation that follows them everywhere

**The compounding math:**
Month 1: 50 followers gained
Month 2: 80 followers gained (compounding from month 1)
Month 3: 130 followers gained
Month 4: 200 followers gained
Month 6: 500+ followers in that month alone

The first 2 months feel like nothing. Month 6 feels like everything is happening at once.

**Today's Practice:**
Write a letter to yourself for 6 months from now.
What do you want your LinkedIn to look like?
How many followers? What kind of opportunities?
Make it specific. Put it somewhere you'll see it.
On days when a post gets 3 likes — read it.`,
    takeaway:
      "The first 2 months are the hardest and least rewarding. Month 6 is where the compounding shows. Don't quit before month 6.",
    action: "Generate a post",
  },
  {
    day: 30,
    title: "Day 30 — What You Know Now",
    duration: "4 min read",
    tag: "Review",
    content: `30 days ago you started this.

Today you know things about LinkedIn that most users never learn.

Let's review what you've covered:

**The fundamentals you now own:**

✓ Why the hook is 50% of your post's success
✓ How the LinkedIn algorithm works in 3 phases
✓ The best posting times (and why consistency beats perfect timing)
✓ What recruiters look for in 7 seconds
✓ The 5-part viral post structure
✓ The comment strategy for passive growth
✓ Why personal beats company brand every time

**The writing craft you've built:**

✓ The STSC storytelling framework
✓ Why failure posts get 1.34x more reach
✓ The 150-200 word sweet spot
✓ The truth about hashtags (2 max)
✓ CTAs that actually get comments
✓ Controversy that sparks discussion without offending

**The strategy you've developed:**

✓ Content pillars (pick one, own it)
✓ Repurposing (1 idea = 10 posts)
✓ Batching (2 hours/week, not every day)
✓ Analytics (what to track, what to ignore)
✓ The 6-month compounding timeline

**What comes next:**

Day 30 is not the end. It's where the real growth begins.

You have the knowledge. Now you need the reps.

The creators who grow on LinkedIn aren't smarter than you.
They just showed up more consistently.

One post per week. One comment on 10 posts per week.
For 6 months.

That's it. That's the entire strategy.

**Today's Practice:**

Write a post about what you've learned in the last 30 days.
Be specific. Be honest. Share what surprised you.
This kind of reflection post almost always performs well.
Because readers are also learning — and they want to know they're not alone.

You've built something here. Keep building.`,
    takeaway:
      "You have the knowledge. Now you need the reps. 1 post/week + 10 comments/week for 6 months = real growth.",
    action: "Generate a post",
  },
];

interface LearnNewsItem {
  topic: string;
  article: {
    title: string;
    description: string;
    source: string;
    link: string;
    date: string;
  } | null;
}

export default function LearnPage() {
  const [userDayNumber, setUserDayNumber] = useState(1);
  const [selectedLessonDay, setSelectedLessonDay] = useState(1);
  const [topicNews, setTopicNews] = useState<LearnNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);

  const currentLesson = (LESSONS[selectedLessonDay - 1] ?? LESSONS[0]!)!;

  useEffect(() => {
    async function loadLearnData() {
      if (isLocalMode()) {
        setIsLoading(false);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
      } else {
        const { data } = await supabase
          .from("users")
          .select("created_at")
          .eq("id", user.id)
          .single();

        if (data) {
          const created = new Date(data.created_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          const dayNumber = Math.min(diffDays + 1, 30);
          setUserDayNumber(dayNumber);
          setSelectedLessonDay(dayNumber);
        }

        setIsLoading(false);
      }

      try {
        const response = await fetch("/api/learn-news", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json();
          setTopicNews((payload.items || []) as LearnNewsItem[]);
        }
      } catch (error) {
        console.error("Failed to fetch learn news:", error);
      } finally {
        setIsNewsLoading(false);
      }
    }

    void loadLearnData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 animate-pulse">
        <div className="h-4 bg-surface-container-high rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-surface-container-high rounded w-3/4 mb-6"></div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-surface-container-high rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Topic News */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-on-background mb-3">
          Daily Topic News (10 Focus Topics)
        </h2>
        <p className="text-[0.68rem] text-on-surface-variant mb-3">
          Headlines link to original publishers. Rights remain with source websites.
        </p>
        {isNewsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicNews.map((item) => (
              <div
                key={item.topic}
                className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-blue-700 mb-1">
                  {item.topic}
                </p>
                {item.article ? (
                  <>
                    <a
                      href={item.article.link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-sm font-semibold text-on-background hover:text-blue-700 line-clamp-2"
                    >
                      {item.article.title}
                    </a>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {item.article.description}
                    </p>
                    <p className="text-[0.68rem] text-on-surface-variant/70 mt-1">
                      {item.article.source}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    No fresh article found for this topic yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Navigator */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
          Lessons
        </p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 30 }, (_, idx) => {
            const day = idx + 1;
            const isLocked = day > userDayNumber;
            const isActive = day === selectedLessonDay;

            return (
              <button
                key={day}
                type="button"
                disabled={isLocked}
                onClick={() => setSelectedLessonDay(day)}
                className={`rounded-md px-2 py-2 text-[0.72rem] sm:text-xs font-semibold transition-colors ${
                  isLocked
                    ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                    : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:border-blue-400"
                }`}
                title={isLocked ? `Unlocks on Day ${day}` : `Open Day ${day}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Day {userDayNumber} of 30
          </span>
          <span className="text-xs text-on-surface-variant/70 bg-surface-container px-3 py-1 rounded-full">
            {currentLesson.tag}
          </span>
          <span className="text-xs text-on-surface-variant/70">{currentLesson.duration}</span>
        </div>
        <h1 className="text-2xl font-semibold text-on-background mt-3">{currentLesson.title}</h1>
        {/* Progress bar */}
        <div className="mt-4 bg-surface-container rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(userDayNumber / 30) * 100}%` }}
          />
        </div>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          {userDayNumber}/30 lessons complete
        </p>
      </div>

      {/* Lesson Content */}
      <div className="prose prose-sm max-w-none mb-8">
        {currentLesson.content.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-on-surface leading-relaxed mb-4 whitespace-pre-line text-sm">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Key Takeaway */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
          Today's Key Takeaway
        </p>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">
          {currentLesson.takeaway}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          if (currentLesson.action === "Generate a post") {
            window.location.href = "/dashboard/create";
          } else if (currentLesson.action === "Analyze a post") {
            window.location.href = "/dashboard/analyze";
          } else {
            window.location.href = "/dashboard/create";
          }
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl text-sm transition-colors"
      >
        {currentLesson.action} →
      </button>

      <p className="text-xs text-on-surface-variant/70 text-center mt-4">
        Future lessons unlock day-by-day. You can revisit any past lesson anytime.
      </p>
    </div>
  );
}
