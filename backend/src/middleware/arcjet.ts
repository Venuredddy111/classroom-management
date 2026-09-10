import { NextFunction, Request, Response } from "express";
import {
  adminLimiter,
  anonymousLimiter,
  authLimiter,
  studentLimiter,
  teacherLimiter,
} from "../lib/arcjet";

const STRICT_LIMIT_PATHS = ["/api/auth/sign-in/email", "/api/auth/sign-up/email"];

/**
 * Picks the rate-limit tier for this request: the flat brute-force guard for
 * sign-in/sign-up (no session exists yet, so role never applies there), else
 * a tier scaled by req.user.role — set by attachSession, which must run
 * before this middleware.
 */
function pickLimiter(req: Request) {
  if (STRICT_LIMIT_PATHS.includes(req.path)) return authLimiter;

  switch (req.user?.role) {
    case "admin":
      return adminLimiter;
    case "teacher":
      return teacherLimiter;
    case "student":
      return studentLimiter;
    default:
      return anonymousLimiter;
  }
}

/** Shield + bot detection + role-scaled rate limiting for every request. */
export async function arcjetProtect(req: Request, res: Response, next: NextFunction) {
  // Render (and most PaaS hosts) sit behind a proxy, so the raw socket IP
  // isn't the real client IP — it arrives via X-Forwarded-For instead.
  // req.ip resolves that correctly once Express's `trust proxy` is set.
  const decision = await pickLimiter(req).protect(req, { requested: 1, ipSrc: req.ip });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return res.status(429).json({ error: "Too many requests" });
    }
    if (decision.reason.isBot()) {
      return res.status(403).json({ error: "Automated requests are not allowed" });
    }
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
