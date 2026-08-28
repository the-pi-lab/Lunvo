/**
 * Phase 32 — Marketplace PR Templates
 * Each template prefills Create with a prompt
 */

export interface MarketplaceTemplate {
  id: string;
  title: string;
  category: "PR" | "Launch" | "Hiring" | "Growth" | "Story";
  hook: string;
  prompt: string;
  tags: string[];
}

export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: "launch-product",
    title: "Product Launch",
    category: "Launch",
    hook: "We shipped something we were scared to ship.",
    prompt:
      "Announce a product launch: share the problem you saw, what you built, one hard decision, and a specific CTA for early users.",
    tags: ["launch", "product", "announcement"],
  },
  {
    id: "hiring-announcement",
    title: "Hiring — We're Looking",
    category: "Hiring",
    hook: "We're hiring, but not for the reason you think.",
    prompt:
      "Write a hiring post for a specific role: describe the mission, who thrives here, what they'll own in first 90 days, and a clear CTA to DM.",
    tags: ["hiring", "team", "culture"],
  },
  {
    id: "fundraising-story",
    title: "Fundraising Journey",
    category: "Story",
    hook: "We got 27 rejections before one yes.",
    prompt:
      "Tell a fundraising story: number of rejections, what you changed, the one insight that unlocked the yes, and a lesson for founders.",
    tags: ["fundraising", "story", "founders"],
  },
  {
    id: "behind-scenes",
    title: "Behind the Scenes",
    category: "PR",
    hook: "What product managers actually do on a Monday.",
    prompt:
      "Share a behind-the-scenes moment from your work this week: the unexpected, the uncomfortable decision, or the counter-intuitive lesson.",
    tags: ["behind-scenes", "culture", "story"],
  },
  {
    id: "milestone-celebration",
    title: "Milestone — 10k Users",
    category: "PR",
    hook: "84 cold DMs. 3 replies. Here's what changed.",
    prompt:
      "Celebrate a milestone (users, revenue, launch): share the specific numbers, the hard part, and what you'd do differently.",
    tags: ["milestone", "celebration", "metrics"],
  },
  {
    id: "contrarian-take",
    title: "Contrarian Take",
    category: "Growth",
    hook: "Most LinkedIn advice is designed to make you invisible.",
    prompt:
      "Make a contrarian claim about your industry: state the myth, your opposite experience, data or story, and a question that invites debate.",
    tags: ["contrarian", "thought-leadership", "growth"],
  },
  {
    id: "failure-lesson",
    title: "Failure Lesson",
    category: "Story",
    hook: "I lost our biggest client in a 10-minute call.",
    prompt:
      "Share a failure: the specific moment, what you learned, the rule you now follow, and a question about others' expensive lessons.",
    tags: ["failure", "lesson", "story"],
  },
  {
    id: "hiring-pr",
    title: "PR — Hiring Template",
    category: "PR",
    hook: "We're not hiring for skills. We're hiring for slope.",
    prompt:
      "Create a PR-style hiring post that sells the mission, not the role: why this problem matters, who will love it, and how to apply.",
    tags: ["PR", "hiring", "template"],
  },
];
