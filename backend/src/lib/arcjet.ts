import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";

if (!process.env.ARCJET_KEY) {
  throw new Error("ARCJET_KEY is not set");
}

/**
 * Base client applied to every request: blocks common attack patterns
 * (Shield) and non-browser/automated traffic (bot detection). Rate limiting
 * itself is layered on separately per role below, since how much we trust a
 * caller — and therefore how much throughput to give them — depends on
 * whether they're anonymous or an authenticated student/teacher/admin.
 */
const base = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [shield({ mode: "LIVE" }), detectBot({ mode: "LIVE", allow: [] })],
});

/** Not signed in — the least trusted tier, since an IP could be anyone. */
export const anonymousLimiter = base.withRule(
  tokenBucket({ mode: "LIVE", refillRate: 10, interval: 10, capacity: 20 })
);

/** Authenticated students — more headroom than anonymous, still bounded. */
export const studentLimiter = base.withRule(
  tokenBucket({ mode: "LIVE", refillRate: 20, interval: 10, capacity: 40 })
);

/** Teachers manage classes/enrollments day-to-day, so they get more throughput. */
export const teacherLimiter = base.withRule(
  tokenBucket({ mode: "LIVE", refillRate: 40, interval: 10, capacity: 80 })
);

/** Admins are the most trusted role (bulk operations, dashboards, etc). */
export const adminLimiter = base.withRule(
  tokenBucket({ mode: "LIVE", refillRate: 60, interval: 10, capacity: 120 })
);

/**
 * Sign-in/sign-up happen before a session exists, so they can't be scaled by
 * role — kept as a flat, strict brute-force guard regardless of who's asking.
 */
export const authLimiter = base.withRule(
  tokenBucket({ mode: "LIVE", refillRate: 5, interval: "1m", capacity: 5 })
);
