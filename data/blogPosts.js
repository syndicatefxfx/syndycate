export const blogPosts = [
  {
    slug: "trading-mindset",
    title: "How to Build a Focused Trading Mindset",
    subtitle: "Discipline, structure, and community support as the pillars of consistency.",
    date: "2025-01-05",
    readTime: "6 min",
    image: "/programResults.gif",
    excerpt:
      "Practical steps to stay disciplined, avoid emotional decisions, and trade with a clear plan every day.",
    content: [
      "A winning mindset is built around routine and clear rules. Start with a daily checklist: pre-market prep, key levels, risk per trade, and a simple review after each session.",
      "Emotions spike when there is no structure. Define your maximum risk per day and per week, and stop trading once the limit is hit. This preserves capital and keeps you from revenge trades.",
      "Community feedback accelerates growth. Share your trades, discuss mistakes openly, and ask for micro-adjustments to your plan. Small corrections compound fast.",
      "Finally, separate decision windows: analyze when the market is calm, execute with alerts, and review later. Don’t try to do all three at once.",
    ],
  },
  {
    slug: "prop-challenges",
    title: "Passing Prop Challenges Without Burning Out",
    subtitle: "Risk pacing, selection of instruments, and realistic targets for funded accounts.",
    date: "2025-01-12",
    readTime: "5 min",
    image: "/programResults.gif",
    excerpt:
      "A step-by-step approach to complete prop evaluations: capital preservation first, profits second.",
    content: [
      "Start with one or two instruments you know best. Spreading across many pairs makes you miss context and increases error rate.",
      "Focus on drawdown management: a small daily risk limit (0.5–1%) and a hard stop if you break rules. Consistency scores higher than sporadic big wins.",
      "Trade fewer setups with high clarity. If a day offers nothing clean, don’t force entries just to stay active.",
      "Use a playbook: screenshot before/after, note the confluence. This doubles as proof of discipline if the prop firm reviews your process.",
    ],
  },
  {
    slug: "multi-timeframe-playbook",
    title: "Multi‑Timeframe Playbook for Cleaner Entries",
    subtitle: "Top-down logic that keeps you aligned with structure and liquidity.",
    date: "2025-01-20",
    readTime: "7 min",
    image: "/programResults.gif",
    excerpt:
      "Combine higher‑timeframe context with precise intraday triggers to cut noise and improve timing.",
    content: [
      "Begin with the higher timeframe to define bias and key zones. Mark liquidity pools and imbalances that matter for the week.",
      "Drop to execution timeframe only after HTF context is clear. Look for alignment: same direction, same liquidity story.",
      "Wait for price to tap your zone and give a clean trigger: shift in order flow, rejection wick, or engulf with follow‑through. No trigger — no trade.",
      "Journal the sequence: bias, level, trigger, management. This makes review objective and repeatable.",
    ],
  },
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug);
}
